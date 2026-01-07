-- Create the Gaarijua schema (cars + parts) without seeding sample data
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.cars (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  brand text,
  model text,
  year integer,
  description text,
  images text[],
  slug text,
  is_for_rent boolean DEFAULT false,
  seller text,
  promoted boolean DEFAULT false,
  promoted_expires timestamptz,
  views_count integer DEFAULT 0,
  body_type text check (body_type in ('SUV','estate','Sedan','coupe','pickup truck')),
  price_per_day numeric(10,2),
  price_buy numeric(12,2),
  location text,
  mileage integer,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.cars
  ADD COLUMN IF NOT EXISTS mileage integer;

CREATE TABLE IF NOT EXISTS public.parts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text,
  brand text,
  price numeric(10,2),
  description text,
  images text[],
  seller text,
  compatible_models text[],
  sku text,
  slug text,
  created_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS cars_slug_unique ON public.cars (slug);
CREATE UNIQUE INDEX IF NOT EXISTS parts_slug_unique ON public.parts (slug);
