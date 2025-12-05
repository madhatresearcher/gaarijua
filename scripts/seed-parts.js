const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

function loadEnv() {
  try {
    const envPath = './.env.local'
    if (!fs.existsSync(envPath)) return
    const raw = fs.readFileSync(envPath, 'utf8')
    raw.split(/\r?\n/).forEach((line) => {
      const match = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/)
      if (!match) return
      let [, key, val] = match
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1)
      }
      if (!process.env[key]) process.env[key] = val
    })
  } catch (error) {
    console.warn('Could not load .env.local:', error.message)
  }
}

loadEnv()

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const parts = [
  {
    title: 'Air Filter - Toyota Rav4 (2013-2018)',
    category: 'Filters',
    brand: 'Bosch',
    price: 32.5,
    description: 'High performance dry air filter that keeps engine clean.',
    images: ['https://picsum.photos/seed/part1/800/800'],
    compatible_models: ['Rav4 2013', 'Rav4 2016', 'Highlander 2017'],
    sku: 'FIL-RAV4-13',
    slug: 'air-filter-rav4-2013-2018'
  },
  {
    title: 'Front Brake Pads - Honda Accord',
    category: 'Brakes',
    brand: 'Akebono',
    price: 45.0,
    description: 'Ceramic front brake pads with quiet wear.',
    images: ['https://picsum.photos/seed/part2/800/800'],
    compatible_models: ['Accord 2014', 'Accord 2016', 'Odyssey 2015'],
    sku: 'BP-ACC-14',
    slug: 'front-brake-pads-accord-2014'
  },
  {
    title: 'Headlight Bulb - H11 (Pair)',
    category: 'Electrical',
    brand: 'Philips',
    price: 18.0,
    description: 'Bright H11 bulbs for improved visibility.',
    images: ['https://picsum.photos/seed/part3/800/800'],
    compatible_models: ['Corolla 2013', 'Corolla 2016', 'Hilux 2017'],
    sku: 'BUL-H11-2',
    slug: 'headlight-bulb-h11-pair'
  },
  {
    title: 'Oil Filter - Toyota Diesel',
    category: 'Filters',
    brand: 'Mann',
    price: 12.75,
    description: 'High quality oil filter compatible with Toyota diesel engines.',
    images: ['https://picsum.photos/seed/part4/800/800'],
    compatible_models: ['Hilux 2015', 'Land Cruiser 2014', 'Fortuner 2016'],
    sku: 'OIL-TY-DIE',
    slug: 'oil-filter-toyota-diesel'
  },
  {
    title: 'Spark Plugs - Set of 4',
    category: 'Ignition',
    brand: 'NGK',
    price: 24.99,
    description: 'Long life spark plugs that deliver reliable starts.',
    images: ['https://picsum.photos/seed/part5/800/800'],
    compatible_models: ['Corolla 2012', 'Camry 2015', 'Vitz 2013'],
    sku: 'SP-4-SET',
    slug: 'spark-plugs-set-of-4'
  },
  {
    title: 'Fuel Pump Assembly',
    category: 'Fuel System',
    brand: 'Denso',
    price: 89.0,
    description: 'OEM quality fuel pump ready for quick replacement.',
    images: ['https://picsum.photos/seed/part6/800/800'],
    compatible_models: ['Corolla 2010', 'Axio 2014', 'Premio 2016'],
    sku: 'FP-DEN-010',
    slug: 'fuel-pump-assembly'
  },
  {
    title: 'Clutch Kit - Toyota Hilux',
    category: 'Transmission',
    brand: 'Exedy',
    price: 210.0,
    description: 'Premium clutch kit with pressure plate and disc.',
    images: ['https://picsum.photos/seed/part7/800/800'],
    compatible_models: ['Hilux 2010', 'Hilux 2014', 'Fortuner 2011'],
    sku: 'CK-HIL-10',
    slug: 'clutch-kit-hilux'
  },
  {
    title: 'Radiator - Toyota Land Cruiser',
    category: 'Cooling',
    brand: 'Valeo',
    price: 325.0,
    description: 'Heavy-duty radiator built for tough climates.',
    images: ['https://picsum.photos/seed/part8/800/800'],
    compatible_models: ['Land Cruiser 2012', 'Land Cruiser 2015'],
    sku: 'RAD-LCR-12',
    slug: 'radiator-land-cruiser'
  },
  {
    title: 'Timing Belt Kit - Subaru Forester',
    category: 'Timing',
    brand: 'Gates',
    price: 135.0,
    description: 'Complete timing belt kit with tensioners.',
    images: ['https://picsum.photos/seed/part9/800/800'],
    compatible_models: ['Forester 2010', 'Forester 2013', 'Legacy 2011'],
    sku: 'TB-SUB-10',
    slug: 'timing-belt-kit-forester'
  },
  {
    title: 'Rear Suspension Coil Spring',
    category: 'Suspension',
    brand: 'KYB',
    price: 88.0,
    description: 'Durable coil spring with consistent ride height.',
    images: ['https://picsum.photos/seed/part10/800/800'],
    compatible_models: ['Prado 2012', 'Harrier 2014'],
    sku: 'CS-KYB-12',
    slug: 'rear-coil-spring-prado'
  }
]

async function seedParts() {
  try {
    const { data, error } = await supabase.from('parts').upsert(parts, { onConflict: 'slug' }).select('id,title,slug')
    if (error) {
      console.error('Insert error:', error)
      process.exit(1)
    }
    console.log('Inserted part listings:', data.length)
    data.forEach((row) => console.log(`${row.id} ${row.slug}`))
  } catch (err) {
    console.error('Unexpected error:', err)
    process.exit(1)
  }
}

seedParts()
