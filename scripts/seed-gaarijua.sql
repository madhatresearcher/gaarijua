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
  mileage integer,
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
,
('Mercedes GLE 400 - Urban Rental','Mercedes-Benz','GLE 400',2020,
 'Refined midsize SUV with executive trim, spacious cabin, and turbocharged V6 comfort.',
 ARRAY['https://picsum.photos/seed/gle1/1200/800','https://picsum.photos/seed/gle2/1200/800'],
 'mercedes-gle-400-2020-rent', true, 120, 'Kampala, UG'),
('Land Rover Discovery Sport - Safari Ready','Land Rover','Discovery Sport',2019,
 'Commanding view, all-wheel drive, and premium ride tuned for safari circuits.',
 ARRAY['https://picsum.photos/seed/discovery1/1200/800','https://picsum.photos/seed/discovery2/1200/800'],
 'land-rover-discovery-sport-2019-rent', true, 110, 'Entebbe, UG')
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

-- Snowy sales inventory (10 cars)
INSERT INTO cars (title, brand, model, year, description, images, slug, is_for_rent, price_buy, location, mileage)
VALUES
('Land Cruiser 300 Series','Toyota','Land Cruiser 300 Series',2023,
 'Flagship V6 twin-turbo Land Cruiser with full-time 4WD, premium interior, and advanced off-road technologies. Mileage: 12,000 km.',
 ARRAY['https://mystrongad.com/toyota/2025/land-cruiser/2025-toyota-land-cruiser-blue.webp'],
 'toyota-land-cruiser-300-series-2023', false, 125000, 'Kampala, Uganda', 12000),

('Land Cruiser 200 Series','Toyota','Land Cruiser 200 Series',2021,
 'Legendary V8 Land Cruiser known for unmatched durability and comfort. Excellent expedition platform. Mileage: 45,000 km.',
 ARRAY['https://dissentoffroad.com/cdn/shop/files/LC200-stellar-front02.jpg?v=1738784195'],
 'toyota-land-cruiser-200-series-2021', false, 98000, 'Nairobi, Kenya', 45000),

('Patrol Y62','Nissan','Patrol Y62',2020,
 '5.6L V8 powerhouse with luxury interior and hydraulic body motion control. A Land Cruiser rival. Mileage: 65,000 km.',
 ARRAY['https://storyblok-assets.prod.nissan.eu/f/298759/2560x1440/fd57420803/qac-2560x1440.jpg/m/filters%3Aquality%2880%29'],
 'nissan-patrol-y62-2020', false, 85000, 'Dubai, UAE', 65000),

('X-Trail','Nissan','X-Trail',2022,
 'Efficient family SUV with modern infotainment, AWD, and excellent fuel economy. Mileage: 21,000 km.',
 ARRAY['https://www-asia.nissan-cdn.net/content/dam/Nissan/AU/Images/vehicles/X-TRAIL/side-profiles/compressed/XT4EPASTL24_TDNNRD9T33TMAA----.png'],
 'nissan-xtrail-2022', false, 31000, 'Kigali, Rwanda', 21000),

('Qashqai','Nissan','Qashqai',2023,
 'Stylish modern crossover with advanced safety tech and great city comfort. Mileage: 10,000 km.',
 ARRAY['https://images.carandbike.com/cms/articles/2024/4/3212751/Nissan_Qashqai_facelift_2_2fdf5fd0f3.jpg'],
 'nissan-qashqai-2023', false, 34000, 'Dar es Salaam, Tanzania', 10000),

('Navara','Nissan','Navara',2019,
 'Reliable workhorse pickup with diesel efficiency and excellent off-road capability. Mileage: 98,000 km.',
 ARRAY['https://upload.wikimedia.org/wikipedia/commons/e/e9/2018_Nissan_Navara_Tekna_DCi_Automatic_2.3.jpg'],
 'nissan-navara-2019', false, 28000, 'Gulu, Uganda', 98000),

('Sunny','Nissan','Sunny',2021,
 'Fuel-efficient sedan perfect for safe daily commuting and fleet operations. Mileage: 30,000 km.',
 ARRAY['https://www.autopediame.com/storage/images/Nissan/2023/sunny%20front%20.jpg'],
 'nissan-sunny-2021', false, 14000, 'Mombasa, Kenya', 30000),

('Defender 110','Land Rover','Defender 110',2022,
 'Rugged luxury 4x4 with modern tech, iconic design, and unbeatable off-road ability. Mileage: 15,000 km.',
 ARRAY['https://www.landroverwindsor.com/images/ckfinder/LAND%20ROVER%20DEFENDER%20exterior.jpg'],
 'land-rover-defender-110-2022', false, 115000, 'Kampala, Uganda', 15000),

('Range Rover','Land Rover','Range Rover',2023,
 'The ultimate statement SUV — silent ride, top-tier luxury, and adaptive off-road systems. Mileage: 8,000 km.',
 ARRAY['https://lp-auto-assets.s3.amazonaws.com/24/land-rover/range-rover/M3/secc1.jpg'],
 'land-rover-range-rover-2023', false, 180000, 'Abuja, Nigeria', 8000),

('Discovery','Land Rover','Discovery',2021,
 'Versatile family luxury SUV with 7 seats, air suspension, and strong off-road performance. Mileage: 40,000 km.',
 ARRAY['https://imgcdn.oto.com/large/gallery/exterior/43/1762/land-rover-discovery-side-view-393597.jpg'],
 'land-rover-discovery-2021', false, 75000, 'Johannesburg, South Africa', 40000)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  brand = EXCLUDED.brand,
  model = EXCLUDED.model,
  year = EXCLUDED.year,
  description = EXCLUDED.description,
  images = EXCLUDED.images,
  price_buy = EXCLUDED.price_buy,
  location = EXCLUDED.location,
  mileage = EXCLUDED.mileage,
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
