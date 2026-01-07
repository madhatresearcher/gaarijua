-- Drop all existing policies on profiles
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "profiles_admin_all" ON profiles;
DROP POLICY IF EXISTS "profiles_public_read" ON profiles;

-- Temporarily disable RLS to reset
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Simple public read policy (no self-reference)
CREATE POLICY "profiles_public_read" ON profiles
  FOR SELECT
  USING (true);

-- Users can update their own profile
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Admin insert/delete policy using a function to avoid recursion
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

CREATE POLICY "profiles_admin_insert" ON profiles
  FOR INSERT
  WITH CHECK (is_admin_or_support() OR id = auth.uid());

CREATE POLICY "profiles_admin_delete" ON profiles
  FOR DELETE
  USING (is_admin_or_support());
