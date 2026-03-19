BEGIN;

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own_safe" ON profiles;
DROP POLICY IF EXISTS "profiles_admin_all" ON profiles;
DROP POLICY IF EXISTS "profiles_public_read" ON profiles;
DROP POLICY IF EXISTS "profiles_public_safe_read" ON profiles;
DROP POLICY IF EXISTS "profiles_admin_insert" ON profiles;
DROP POLICY IF EXISTS "profiles_admin_update" ON profiles;
DROP POLICY IF EXISTS "profiles_admin_delete" ON profiles;

CREATE OR REPLACE FUNCTION is_admin_or_support()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'support')
  );
$$;

CREATE POLICY "profiles_public_safe_read" ON profiles
  FOR SELECT
  USING (true);

CREATE POLICY "profiles_update_own_safe" ON profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_admin_insert" ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin_or_support() OR id = auth.uid());

CREATE POLICY "profiles_admin_update" ON profiles
  FOR UPDATE
  TO authenticated
  USING (is_admin_or_support())
  WITH CHECK (is_admin_or_support());

CREATE POLICY "profiles_admin_delete" ON profiles
  FOR DELETE
  TO authenticated
  USING (is_admin_or_support());

REVOKE ALL PRIVILEGES ON TABLE profiles FROM anon, authenticated;
GRANT SELECT (id, vendor_type, rental_company_id, display_name, avatar_url, is_active, created_at, updated_at)
  ON TABLE profiles TO anon, authenticated;
GRANT UPDATE (display_name, avatar_url, phone, updated_at)
  ON TABLE profiles TO authenticated;

COMMIT;
