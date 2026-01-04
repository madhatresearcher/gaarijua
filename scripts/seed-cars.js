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
    images: ['https://www.toyota.com/imgix/responsive/images/gallery/photos-videos/2021/prado/Prado-2021-003.jpg'],
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
    images: ['https://www.nissanusa.com/content/dam/Nissan/us/vehicles/patrol/2021/overview/2021-patrol-hero-01.jpg'],
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
    images: ['https://www.mercedes-benz.com/en/vehicles/passenger-cars/glc/_jcr_content/root/slider/sliderchild/slide_0/image/MQ6-0-image-20200522121510356.jpeg'],
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
    images: ['https://www.hyundai.com/content/dam/hyundai/us/en/images/2023/palisade/gallery/2023-hyundai-palisade-exterior-front-01.jpg'],
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
    images: ['https://www.toyota.com/imgix/responsive/images/gallery/photos-videos/2019/hilux/Hilux-2019-004.jpg'],
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
    images: ['https://www.landrover.com/content/dam/landrover/global/home/vehicles/defender-110/2020/gallery/defender-110-exterior-01.jpg'],
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
    images: ['https://www.mercedes-benz.com/content/dam/brandhub/mClass/gle-2021/gle-2021-gallery/gle-2021-001.jpg'],
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
    images: ['https://www.toyota.com/imgix/responsive/images/gallery/photos-videos/2019/land-cruiser/LandCruiser-2019-007.jpg'],
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
    images: ['https://www.lexus.com/cm-img/gallery/2018/rx/gallery/exterior/2018_rx_350_001.jpg'],
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
    images: ['https://www.ford.com/cmslibs/content/dam/brand_ford/en_us/brand/performance/ranger-wildtrak/2019/gallery/ranger-wildtrak-2019-exterior-1.jpg'],
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
