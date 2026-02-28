-- Adds the required cars.body_type column so the UI can present the body-type selector.
ALTER TABLE IF EXISTS public.cars
  ADD COLUMN IF NOT EXISTS body_type text CHECK (body_type IN ('SUV','estate','Sedan','coupe','pickup truck'));
