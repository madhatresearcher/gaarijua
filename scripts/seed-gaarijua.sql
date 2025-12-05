-- Migration: create tables and unique indexes for Gaarijua

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Cars table
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
  price_per_day numeric(10,2),
  price_buy numeric(12,2),
  location text,
  created_at timestamptz DEFAULT now()
);

-- Parts table
CREATE TABLE IF NOT EXISTS public.parts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text,
  brand text,
  price numeric(10,2),
  description text,
  images text[],
  compatible_models text[],
  sku text,
  slug text,
  created_at timestamptz DEFAULT now()
);

-- Ensure unique indexes on slug
CREATE UNIQUE INDEX IF NOT EXISTS cars_slug_unique ON public.cars (slug);
CREATE UNIQUE INDEX IF NOT EXISTS parts_slug_unique ON public.parts (slug);

-- Upsert sample data for gaarijua
-- 5 Cars for Rent
INSERT INTO cars (title, brand, model, year, description, images, slug, is_for_rent, price_per_day, location)
VALUES
('Toyota Wish - Daily Rental','Toyota','Wish',2010,
 'Comfortable 7-seater perfect for family trips. Fuel efficient and spacious.',
 ARRAY['https://picsum.photos/seed/wish1/1200/800','https://picsum.photos/seed/wish2/1200/800'],
 'toyota-wish-2010-rent', true, 40, 'Kampala, UG'),

('Toyota Crown Majesta - Executive','Toyota','Crown Majesta',2011,
 'Luxury V8 sedan ideal for business/executive transportation.',
 ARRAY['https://picsum.photos/seed/majesta1/1200/800','https://picsum.photos/seed/majesta2/1200/800'],
 'toyota-crown-majesta-2011-rent', true, 120, 'Kampala, UG'),

('Toyota Prado - Adventure Rental','Toyota','Prado',2015,
 'Strong 4x4 ideal for upcountry and off-road trips.',
 ARRAY['https://picsum.photos/seed/prado1/1200/800','https://picsum.photos/seed/prado2/1200/800'],
 'toyota-prado-2015-rent', true, 90, 'Entebbe, UG'),

('Honda CR-V - Daily Rent','Honda','CR-V',2016,
 'Reliable compact SUV with great comfort and AC.',
 ARRAY['https://picsum.photos/seed/crv1/1200/800','https://picsum.photos/seed/crv2/1200/800'],
 'honda-crv-2016-rent', true, 55, 'Kampala, UG'),

('Mazda CX-5 - Weekend Ride','Mazda','CX-5',2018,
 'Sporty SUV, smooth drive, perfect for weekend outings.',
 ARRAY['https://picsum.photos/seed/cx51/1200/800','https://picsum.photos/seed/cx52/1200/800'],
 'mazda-cx5-2018-rent', true, 65, 'Mbarara, UG')
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  brand = EXCLUDED.brand,
  model = EXCLUDED.model,
  year = EXCLUDED.year,
  description = EXCLUDED.description,
  images = EXCLUDED.images,
  is_for_rent = EXCLUDED.is_for_rent,
  price_per_day = EXCLUDED.price_per_day,
  location = EXCLUDED.location,
  created_at = now();

-- 5 Cars for Sale
INSERT INTO cars (title, brand, model, year, description, images, slug, is_for_rent, price_buy, location)
VALUES
('Toyota Corolla - For Sale','Toyota','Corolla',2012,
 'Very clean daily driver, low fuel usage, well maintained.',
 ARRAY['https://picsum.photos/seed/corolla1/1200/800','https://picsum.photos/seed/corolla2/1200/800'],
 'toyota-corolla-2012-sale', false, 8000, 'Kampala, UG'),

('Nissan X-Trail - For Sale','Nissan','X-Trail',2014,
 'Full service history, good interior, powerful AC.',
 ARRAY['https://picsum.photos/seed/xtrail1/1200/800','https://picsum.photos/seed/xtrail2/1200/800'],
 'nissan-xtrail-2014-sale', false, 11500, 'Jinja, UG'),

('Mercedes C200 - For Sale','Mercedes-Benz','C200',2013,
 'Luxury compact sedan with leather interior and smooth drive.',
 ARRAY['https://picsum.photos/seed/c200-1/1200/800','https://picsum.photos/seed/c200-2/1200/800'],
 'mercedes-c200-2013-sale', false, 16500, 'Kampala, UG'),

('Subaru Forester - For Sale','Subaru','Forester',2015,
 'Excellent condition, well serviced, strong engine.',
 ARRAY['https://picsum.photos/seed/forester1/1200/800','https://picsum.photos/seed/forester2/1200/800'],
 'subaru-forester-2015-sale', false, 12000, 'Mbale, UG'),

('Toyota Hilux - For Sale','Toyota','Hilux',2016,
 'Strong and reliable pickup ideal for commercial work.',
 ARRAY['https://picsum.photos/seed/hilux1/1200/800','https://picsum.photos/seed/hilux2/1200/800'],
 'toyota-hilux-2016-sale', false, 14000, 'Kampala, UG')
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  brand = EXCLUDED.brand,
  model = EXCLUDED.model,
  year = EXCLUDED.year,
  description = EXCLUDED.description,
  images = EXCLUDED.images,
  price_buy = EXCLUDED.price_buy,
  location = EXCLUDED.location,
  created_at = now();

-- 5 Parts
INSERT INTO parts (title, category, brand, price, description, images, compatible_models, sku, slug)
VALUES
('Air Filter - Toyota Corolla (2010–2015)','Filters','Bosch',25.00,
 'High-performance air filter, improves airflow and protects the engine.',
 ARRAY['https://picsum.photos/seed/filter1/800/800'],
 ARRAY['Corolla 2010','Corolla 2012','Corolla 2015'],
 'AF-TOY-001','air-filter-corolla-2010-2015'),

('Brake Pads - Front Set','Brakes','Akebono',45.00,
 'Long-lasting front brake pads with strong stopping power.',
 ARRAY['https://picsum.photos/seed/brake1/800/800'],
 ARRAY['Civic 2014','CR-V 2016','Corolla 2012'],
 'BP-FR-002','brake-pads-front-set'),

('Headlight Bulb H4 (Pair)','Electrical','Philips',18.00,
 'Bright long-life H4 bulbs suitable for many vehicles.',
 ARRAY['https://picsum.photos/seed/bulb1/800/800'],
 ARRAY['Prado 2015','Hilux 2016'],
 'HL-H4-003','headlight-bulb-h4-pair'),

('Oil Filter - Universal','Filters','Mann',10.50,
 'High-quality oil filter, fits multiple Toyota and Lexus engines.',
 ARRAY['https://picsum.photos/seed/oilfilter1/800/800'],
 ARRAY['1UR-FSE','2GR-FE','Crown Majesta'],
 'OF-004','oil-filter-universal'),

('Spark Plugs - Set of 4','Ignition','NGK',22.00,
 'Improved combustion, better startup performance, long lifespan.',
 ARRAY['https://picsum.photos/seed/spark1/800/800'],
 ARRAY['Corolla 2012','Camry 2013','Prado 2015'],
 'SP-005','spark-plugs-set-of-4')
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  price = EXCLUDED.price,
  description = EXCLUDED.description,
  images = EXCLUDED.images,
  compatible_models = EXCLUDED.compatible_models,
  sku = EXCLUDED.sku,
  created_at = now();

-- Verify counts
SELECT 'cars' as table_name, COUNT(*) FROM cars;
SELECT 'parts' as table_name, COUNT(*) FROM parts;
