-- Ensure cars table has closed_at timestamp for 24-hour public visibility after closure.
ALTER TABLE IF EXISTS public.cars
  ADD COLUMN IF NOT EXISTS closed_at timestamptz;
