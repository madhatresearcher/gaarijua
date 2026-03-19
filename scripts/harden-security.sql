BEGIN;

ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.bookings ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_admin_or_support()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'support')
  );
$$;

DROP POLICY IF EXISTS "bookings_admin_support_full" ON public.bookings;
DROP POLICY IF EXISTS "cars_owner_or_high_level" ON public.cars;
DROP POLICY IF EXISTS "cars_public_select" ON public.cars;
DROP POLICY IF EXISTS "parts_owner_or_high_level" ON public.parts;
DROP POLICY IF EXISTS "parts_public_select" ON public.parts;
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own_safe" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_public_read" ON public.profiles;
DROP POLICY IF EXISTS "profiles_public_safe_read" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_insert" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_update" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_delete" ON public.profiles;

CREATE POLICY "bookings_admin_support_full" ON public.bookings
  FOR ALL
  TO authenticated
  USING (public.is_admin_or_support())
  WITH CHECK (public.is_admin_or_support());

CREATE POLICY "cars_owner_or_high_level" ON public.cars
  FOR ALL
  TO authenticated
  USING (public.is_admin_or_support() OR public.cars.owner_id = auth.uid())
  WITH CHECK (public.is_admin_or_support() OR public.cars.owner_id = auth.uid());

CREATE POLICY "cars_public_select" ON public.cars
  FOR SELECT
  TO anon, authenticated
  USING (
    COALESCE(public.cars.status, 'active') = 'active'
    OR (
      COALESCE(public.cars.status, 'active') = 'closed'
      AND COALESCE(public.cars.closed_at, public.cars.created_at) >= (now() - INTERVAL '24 hours')
    )
  );

CREATE POLICY "parts_owner_or_high_level" ON public.parts
  FOR ALL
  TO authenticated
  USING (public.is_admin_or_support() OR public.parts.owner_id = auth.uid())
  WITH CHECK (public.is_admin_or_support() OR public.parts.owner_id = auth.uid());

CREATE POLICY "parts_public_select" ON public.parts
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "profiles_public_safe_read" ON public.profiles
  FOR SELECT
  USING (true);

CREATE POLICY "profiles_update_own_safe" ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_admin_insert" ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin_or_support() OR id = auth.uid());

CREATE POLICY "profiles_admin_update" ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (public.is_admin_or_support())
  WITH CHECK (public.is_admin_or_support());

CREATE POLICY "profiles_admin_delete" ON public.profiles
  FOR DELETE
  TO authenticated
  USING (public.is_admin_or_support());

REVOKE ALL PRIVILEGES ON TABLE public.profiles FROM anon, authenticated;
GRANT SELECT (id, vendor_type, rental_company_id, display_name, avatar_url, is_active, created_at, updated_at)
  ON TABLE public.profiles TO anon, authenticated;
GRANT UPDATE (display_name, avatar_url, phone, updated_at)
  ON TABLE public.profiles TO authenticated;

INSERT INTO storage.buckets (id, name, public)
VALUES ('car_images', 'car_images', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

DO $$
DECLARE
  policy_record record;
BEGIN
  FOR policy_record IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
  LOOP
    EXECUTE format('drop policy if exists %I on storage.objects', policy_record.policyname);
  END LOOP;
EXCEPTION
  WHEN undefined_table THEN
    NULL;
END
$$;

CREATE POLICY "car_images_public_read" ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'car_images');

CREATE POLICY "car_images_auth_insert_own_path" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'car_images'
    AND auth.uid() IS NOT NULL
    AND name LIKE ('cars/' || auth.uid()::text || '/%')
    AND lower(name) ~ '\\.(jpg|jpeg|png|webp|avif)$'
  );

CREATE POLICY "car_images_auth_delete_own_path" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'car_images'
    AND auth.uid() IS NOT NULL
    AND name LIKE ('cars/' || auth.uid()::text || '/%')
  );

COMMIT;
