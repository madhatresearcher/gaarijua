-- Seed sample profiles, rentals, and bookings to exercise roles before auth layer.
-- Ensure auth.users contains matching UUIDs before running (Supabase Auth requires real users).
BEGIN;

-- Profiles (admin, support, two vendor sellers, one rental company)
INSERT INTO profiles (id, role, vendor_type, display_name, email, is_active)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'admin', NULL, 'Gaarijua Admin', 'admin@gaarijua.com', true),
  ('22222222-2222-2222-2222-222222222222', 'support', NULL, 'Support Lead', 'support@gaarijua.com', true),
  ('33333333-3333-3333-3333-333333333333', 'vendor', 'seller', 'Zebra Auto Parts', 'vendor1@gaarijua.com', true),
  ('44444444-4444-4444-4444-444444444444', 'vendor', 'seller', 'Kigali Motors', 'vendor2@gaarijua.com', true),
  ('55555555-5555-5555-5555-555555555555', 'vendor', 'rental_company', 'Safari Rentals (Ltd)', 'rental@gaarijua.com', true)
ON CONFLICT (id) DO UPDATE SET
  role = EXCLUDED.role,
  vendor_type = EXCLUDED.vendor_type,
  display_name = EXCLUDED.display_name,
  email = EXCLUDED.email,
  is_active = EXCLUDED.is_active,
  updated_at = now();

-- Connect a couple of cars/parts to owners (existing slugs assumed seeded previously)
UPDATE cars SET owner_id = '33333333-3333-3333-3333-333333333333' WHERE slug = 'toyota-wish-2010-rent';
UPDATE cars SET owner_id = '44444444-4444-4444-4444-444444444444' WHERE slug = 'honda-crv-2016-rent';
UPDATE cars SET owner_id = '55555555-5555-5555-5555-555555555555', rental_company_id = '55555555-5555-5555-5555-555555555555' WHERE slug = 'toyota-prado-2015-rent';
UPDATE parts SET owner_id = '33333333-3333-3333-3333-333333333333' WHERE slug = 'air-filter-corolla-2010-2015';
UPDATE parts SET owner_id = '44444444-4444-4444-4444-444444444444' WHERE slug = 'brake-pads-front-set';

-- Bookings history (past & future) for the rental company fleet and a vendor user.
INSERT INTO bookings (vehicle_id, user_id, rental_company_id, start_date, end_date, status)
VALUES
  ((SELECT id FROM cars WHERE slug = 'toyota-prado-2015-rent'), '44444444-4444-4444-4444-444444444444', '55555555-5555-5555-5555-555555555555', '2025-12-02', '2025-12-05', 'completed'),
  ((SELECT id FROM cars WHERE slug = 'toyota-prado-2015-rent'), '44444444-4444-4444-4444-444444444444', '55555555-5555-5555-5555-555555555555', '2025-12-20', '2025-12-22', 'confirmed');

COMMIT;
