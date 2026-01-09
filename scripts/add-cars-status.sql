-- Ensure the core cars table has the status column required by the UI.
ALTER TABLE IF EXISTS public.cars
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','closed','draft'));
