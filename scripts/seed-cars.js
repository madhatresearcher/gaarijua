const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

function loadEnv() {
  try {
    const envPath = path.resolve(__dirname, '..', '.env.local')
    if (fs.existsSync(envPath)) {
      const raw = fs.readFileSync(envPath, 'utf8')
      raw.split(/\r?\n/).forEach((line) => {
        const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/)
        if (!m) return
        let [, key, val] = m
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1)
        }
        if (!process.env[key]) {
          process.env[key] = val
        }
      })
    }
  } catch (error) {
    // ignore caching issues when env is already loaded
  }
}

loadEnv()

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const listings = [
  {
    title: 'Toyota Prado — 2019 Daily Rental',
    brand: 'Toyota',
    model: 'Prado',
    year: 2019,
    description: 'Spacious 7-seater with diesel power, great for family road trips.',
    images: ['https://picsum.photos/seed/prado2019/1200/800'],
    slug: 'toyota-prado-2019-rent',
    is_for_rent: true,
    price_per_day: 115.0,
    location: 'Kampala, Uganda',
    mileage: 38000,
  },
  {
    title: 'Nissan Patrol — 2021 Safari Rental',
    brand: 'Nissan',
    model: 'Patrol Y62',
    year: 2021,
    description: 'V8-powered luxury SUV tuned for upcountry safaris.',
    images: ['https://picsum.photos/seed/patrol2021/1200/800'],
    slug: 'nissan-patrol-2021-rent',
    is_for_rent: true,
    price_per_day: 140.0,
    location: 'Entebbe, Uganda',
    mileage: 29500,
  },
  {
    title: 'Mercedes-Benz GLC 300 — 2022 Daily Hire',
    brand: 'Mercedes-Benz',
    model: 'GLC 300',
    year: 2022,
    description: 'Executive crossover with soft ride and premium cabin.',
    images: ['https://picsum.photos/seed/glc300/1200/800'],
    slug: 'mercedes-glc-300-2022-rent',
    is_for_rent: true,
    price_per_day: 130.0,
    location: 'Kampala, Uganda',
    mileage: 18000,
  },
  {
    title: 'Hyundai Palisade — 2023 Group Rental',
    brand: 'Hyundai',
    model: 'Palisade',
    year: 2023,
    description: 'Three-row SUV with modern safety features and comfort.',
    images: ['https://picsum.photos/seed/palisade2023/1200/800'],
    slug: 'hyundai-palisade-2023-rent',
    is_for_rent: true,
    price_per_day: 100.0,
    location: 'Mukono, Uganda',
    mileage: 7200,
  },
  {
    title: 'Toyota Hilux — 2019 Pickup Rental',
    brand: 'Toyota',
    model: 'Hilux',
    year: 2019,
    description: 'Tough pickup with 4x4 capability for utility trips.',
    images: ['https://picsum.photos/seed/hilux2019/1200/800'],
    slug: 'toyota-hilux-2019-rent',
    is_for_rent: true,
    price_per_day: 90.0,
    location: 'Jinja, Uganda',
    mileage: 54000,
  },
  {
    title: 'Land Rover Defender 110 — 2020 for Sale',
    brand: 'Land Rover',
    model: 'Defender 110',
    year: 2020,
    description: 'Refreshed Defender with modern tech and low mileage.',
    images: ['https://picsum.photos/seed/defender2020/1200/800'],
    slug: 'land-rover-defender-110-2020-sale',
    is_for_rent: false,
    price_buy: 115000.0,
    location: 'Kampala, Uganda',
    mileage: 22000,
  },
  {
    title: 'Mercedes-Benz GLE 350 — 2021 Owner Sale',
    brand: 'Mercedes-Benz',
    model: 'GLE 350',
    year: 2021,
    description: 'Sporty luxury SUV with adaptive cruise and premium cabin.',
    images: ['https://picsum.photos/seed/gle350/1200/800'],
    slug: 'mercedes-gle-350-2021-sale',
    is_for_rent: false,
    price_buy: 98000.0,
    location: 'Entebbe, Uganda',
    mileage: 26000,
  },
  {
    title: 'Toyota Land Cruiser 200 — 2019 Sale',
    brand: 'Toyota',
    model: 'Land Cruiser 200',
    year: 2019,
    description: 'Classic Land Cruiser with trusted V8 and deployment-ready setup.',
    images: ['https://picsum.photos/seed/landcruiser200/1200/800'],
    slug: 'toyota-land-cruiser-200-2019-sale',
    is_for_rent: false,
    price_buy: 95000.0,
    location: 'Lira, Uganda',
    mileage: 48000,
  },
  {
    title: 'Lexus RX 350 — 2018 Certified Trade',
    brand: 'Lexus',
    model: 'RX 350',
    year: 2018,
    description: 'Luxury crossover with smooth V6 and heat/ventilated seats.',
    images: ['https://picsum.photos/seed/rx350/1200/800'],
    slug: 'lexus-rx-350-2018-sale',
    is_for_rent: false,
    price_buy: 72000.0,
    location: 'Mbale, Uganda',
    mileage: 36000,
  },
  {
    title: 'Ford Ranger Wildtrak — 2019 Sale',
    brand: 'Ford',
    model: 'Ranger Wildtrak',
    year: 2019,
    description: 'High-spec pickup with leather cabin, turbo diesel, and alloy wheels.',
    images: ['https://picsum.photos/seed/rangerwildtrak/1200/800'],
    slug: 'ford-ranger-wildtrak-2019-sale',
    is_for_rent: false,
    price_buy: 45000.0,
    location: 'Gulu, Uganda',
    mileage: 67000,
  },
]

async function seedCars() {
  try {
    const payload = listings.map((listing) => ({
      ...listing,
      price_per_day: listing.is_for_rent ? listing.price_per_day : null,
      price_buy: listing.is_for_rent ? null : listing.price_buy ?? null,
    }))

    const { data, error } = await supabase
      .from('cars')
      .upsert(payload, { onConflict: 'slug' })
      .select('id, title, slug, is_for_rent')

    if (error) {
      throw error
    }

    console.log(`Upserted ${data?.length || 0} car listings.`)
    data.forEach((row) => {
      console.log(`- ${row.slug} (${row.is_for_rent ? 'rent' : 'sale'})`)
    })
  } catch (error) {
    console.error('Failed to seed cars:', error.message || error)
    process.exit(1)
  }
}

seedCars()
