-- Supabase schema & RLS for profiles, bookings, and related policies.
BEGIN;

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'user' check (role in ('admin', 'support', 'vendor', 'user')),
  vendor_type text check (vendor_type in ('rental_company', 'seller')),
  rental_company_id uuid references profiles(id),
  display_name text,
  email text,
  phone text,
  avatar_url text,
  is_active boolean default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table if exists cars
  add column if not exists owner_id uuid references profiles(id),
  add column if not exists rental_company_id uuid references profiles(id);

alter table if exists cars
  add column if not exists seller text,
  add column if not exists promoted boolean default false,
  add column if not exists promoted_expires timestamptz,
  add column if not exists views_count integer default 0,
  add column if not exists type text default 'rental';
alter table if exists cars
  add column if not exists body_type text check (body_type in ('SUV','estate','Sedan','coupe','pickup truck'));

alter table if exists parts
  add column if not exists owner_id uuid references profiles(id);

alter table if exists parts
  add column if not exists seller text;

-- Rentals and sales bookings history table.
create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references cars(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  rental_company_id uuid references profiles(id),
  start_date date not null,
  end_date date not null,
  status text not null check (status in ('pending','confirmed','completed','cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS on bookings so that policies control who sees what.
alter table if exists bookings enable row level security;

drop policy if exists "bookings_admin_support_full" on bookings;
drop policy if exists "bookings_profile_owner" on bookings;
drop policy if exists "bookings_rental_company_history" on bookings;

-- Admins & support get full visibility; rental companies see fleet history; users see their own bookings.
create policy "bookings_admin_support_full" on bookings
  for all
  using (exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role in ('admin','support')))
  with check (exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role in ('admin','support')));

create policy "bookings_profile_owner" on bookings
  for select
  using (user_id = auth.uid());

create policy "bookings_rental_company_history" on bookings
  for select
  using (
    exists (
      select 1
      from profiles
      where profiles.id = auth.uid()
        and profiles.vendor_type = 'rental_company'
        and bookings.rental_company_id = profiles.id
    )
  );

alter table if exists cars enable row level security;
alter table if exists parts enable row level security;

drop policy if exists "cars_owner_or_high_level" on cars;
drop policy if exists "parts_owner_or_high_level" on parts;
drop policy if exists "cars_public_select" on cars;
drop policy if exists "parts_public_select" on parts;

create policy "cars_owner_or_high_level" on cars
  for all
  using (
    exists (
      select 1 from profiles where profiles.id = auth.uid() and profiles.role in ('admin','support')
    )
    or cars.owner_id = auth.uid()
  )
  with check (
    exists (
      select 1 from profiles where profiles.id = auth.uid() and profiles.role in ('admin','support')
    )
    or cars.owner_id = auth.uid()
  );

create policy "cars_public_select" on cars
  for select
  using (true);

create policy "parts_public_select" on parts
  for select
  using (true);

create policy "parts_owner_or_high_level" on parts
  for all
  using (
    exists (
      select 1 from profiles where profiles.id = auth.uid() and profiles.role in ('admin','support')
    )
    or parts.owner_id = auth.uid()
  )
  with check (
    exists (
      select 1 from profiles where profiles.id = auth.uid() and profiles.role in ('admin','support')
    )
    or parts.owner_id = auth.uid()
  );

-- Allow users to read their own profile
alter table if exists profiles enable row level security;

drop policy if exists "profiles_select_own" on profiles;
drop policy if exists "profiles_update_own" on profiles;
drop policy if exists "profiles_admin_all" on profiles;
drop policy if exists "profiles_public_read" on profiles;
drop policy if exists "profiles_admin_insert" on profiles;
drop policy if exists "profiles_admin_delete" on profiles;

-- Helper function to check admin/support status (avoids recursion)
create or replace function is_admin_or_support()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role in ('admin', 'support')
  );
$$;

-- Public read on profiles (needed so other policies can check roles without recursion)
create policy "profiles_public_read" on profiles
  for select
  using (true);

create policy "profiles_update_own" on profiles
  for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- Admin insert (also allow users to insert their own profile via trigger)
create policy "profiles_admin_insert" on profiles
  for insert
  with check (is_admin_or_support() or id = auth.uid());

-- Admin delete
create policy "profiles_admin_delete" on profiles
  for delete
  using (is_admin_or_support());

-- Trigger to auto-create profile row when a new user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email, display_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    'user'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

COMMIT;