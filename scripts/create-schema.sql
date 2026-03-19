-- Create the Gaarijua schema (cars + parts) without seeding sample data
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

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
  closed_at timestamptz,
  body_type text check (body_type in ('SUV','estate','Sedan','coupe','pickup truck')),
  price_per_day numeric(10,2),
  price_buy numeric(12,2),
  location text,
  mileage integer,
  status text not null default 'active' check (status in ('active','closed','draft')),
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
CREATE INDEX IF NOT EXISTS cars_status_rent_created_idx ON public.cars (status, is_for_rent, created_at DESC);
CREATE INDEX IF NOT EXISTS cars_price_per_day_idx ON public.cars (price_per_day);
CREATE INDEX IF NOT EXISTS cars_price_buy_idx ON public.cars (price_buy);
CREATE INDEX IF NOT EXISTS parts_created_at_idx ON public.parts (created_at DESC);
CREATE INDEX IF NOT EXISTS parts_price_idx ON public.parts (price);
CREATE INDEX IF NOT EXISTS cars_title_trgm_idx ON public.cars USING gin (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS cars_brand_trgm_idx ON public.cars USING gin (brand gin_trgm_ops);
CREATE INDEX IF NOT EXISTS cars_model_trgm_idx ON public.cars USING gin (model gin_trgm_ops);
CREATE INDEX IF NOT EXISTS cars_location_trgm_idx ON public.cars USING gin (location gin_trgm_ops);
CREATE INDEX IF NOT EXISTS parts_title_trgm_idx ON public.parts USING gin (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS parts_brand_trgm_idx ON public.parts USING gin (brand gin_trgm_ops);
CREATE INDEX IF NOT EXISTS parts_category_trgm_idx ON public.parts USING gin (category gin_trgm_ops);
CREATE INDEX IF NOT EXISTS parts_seller_trgm_idx ON public.parts USING gin (seller gin_trgm_ops);
