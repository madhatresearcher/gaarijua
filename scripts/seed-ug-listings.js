const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

// Ensure env vars are loaded (helps in dev without dotenv)
try {
  const envPath = './.env.local'
  if (fs.existsSync(envPath)) {
    const raw = fs.readFileSync(envPath, 'utf8')
    raw.split(/\r?\n/).forEach((line) => {
      const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/)
      if (!m) return
      let [, key, val] = m
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1)
      }
      if (!process.env[key]) process.env[key] = val
    })
  }
} catch (error) {
  // ignore
}

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before running this script.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const rawListings = [
  {
    id: 'seed-ug-0001',
    listing_type: 'rent',
    make: 'Toyota',
    model: 'Land Cruiser 300',
    year: 2024,
    trim: 'ZX',
    price: 920000,
    location: 'Kampala, Uganda',
    availability: true,
    image_url: 'https://www.toyota.co.ug/content/dam/toyota/uganda/global/vehicles/land-cruiser-300/2024/exterior-1.jpg',
    source_url: 'https://www.toyota.co.ug/en/vehicles/toyota-uganda/land-cruiser-300',
    description: 'Full-size 4x4 SUV, luxurious cabin, 7 seats.',
  },
  {
    id: 'seed-ug-0002',
    listing_type: 'sale',
    make: 'Toyota',
    model: 'Land Cruiser 200',
    year: 2016,
    trim: 'VX',
    price: 265000000,
    currency: 'UGX',
    location: 'Kampala, Uganda',
    availability: true,
    image_url: 'https://media.toyota.co.uk/vehicles/land-cruiser-archive-2010/exterior-front-3.jpg',
    source_url: 'https://media.toyota.co.uk/vehicles/land-cruiser-archive-2010/',
    description: 'Legendary diesel V8 SUV with strong off-road ability.',
  },
  {
    id: 'seed-ug-0003',
    listing_type: 'rent',
    make: 'Nissan',
    model: 'Patrol Y62',
    year: 2022,
    trim: 'Platinum',
    price: 780000,
    currency: 'UGX',
    location: 'Kampala, Uganda',
    availability: true,
    image_url: 'https://www.nissan.ae/content/dam/Nissan/vehicles/patrol/gallery/2022/exterior/front-01.jpg',
    source_url: 'https://www.nissan.ae/vehicles/patrol.html',
    description: 'Full-size luxury SUV with a powerful V8.',
  },
  {
    id: 'seed-ug-0004',
    listing_type: 'sale',
    make: 'Land Rover',
    model: 'Defender 110',
    year: 2021,
    trim: 'SE',
    price: 360000000,
    currency: 'UGX',
    location: 'Mbarara, Uganda',
    availability: true,
    image_url: 'https://www.landrover.co.uk/content/dam/land-rover/vehicles/defender/2021/gallery/defender-110-exterior-front.jpg',
    source_url: 'https://www.landrover.co.uk/vehicles/defender/index.html',
    description: 'Modern rugged 4x4 with premium interior.',
  },
  {
    id: 'seed-ug-0005',
    listing_type: 'rent',
    make: 'Toyota',
    model: 'Hilux',
    year: 2019,
    trim: 'SR5',
    price: 240000,
    currency: 'UGX',
    location: 'Entebbe, Uganda',
    availability: true,
    image_url: 'https://www.toyota.co.ug/content/dam/toyota/uganda/global/vehicles/hilux/2019/exterior-1.jpg',
    source_url: 'https://www.toyota.co.ug/en/vehicles/toyota-uganda/hilux',
    description: 'Reliable diesel pickup with 4x4 capability.',
  },
  {
    id: 'seed-ug-0006',
    listing_type: 'sale',
    make: 'Toyota',
    model: 'Prado 150',
    year: 2017,
    trim: 'TX-L',
    price: 210000000,
    currency: 'UGX',
    location: 'Kampala, Uganda',
    availability: true,
    image_url: 'https://global.toyota/en/album/images/23825616/land-cruiser-prado-150-exterior.jpg',
    source_url: 'https://global.toyota/en/album/images/23825616/',
    description: 'Comfortable mid-size 4x4 SUV with diesel engine.',
  },
  {
    id: 'seed-ug-0007',
    listing_type: 'rent',
    make: 'Ford',
    model: 'Ranger',
    year: 2021,
    trim: 'Wildtrak',
    price: 260000,
    currency: 'UGX',
    location: 'Gulu, Uganda',
    availability: true,
    image_url: 'https://www.ford.co.za/content/dam/guxeu/za/vehicles/ranger/2021/images/ranger-wildtrak-front.jpg',
    source_url: 'https://www.ford.co.za/trucks/ranger/',
    description: 'Diesel pickup with strong towing and off-road capability.',
  },
  {
    id: 'seed-ug-0008',
    listing_type: 'sale',
    make: 'Isuzu',
    model: 'D-Max',
    year: 2018,
    trim: 'LS-A',
    price: 118000000,
    currency: 'UGX',
    location: 'Kampala, Uganda',
    availability: true,
    image_url: 'https://www.isuzu.co.ug/content/dam/isuzu/vehicles/d-max/2018/exterior-1.jpg',
    source_url: 'https://www.isuzu.co.ug/models/d-max',
    description: 'Economical and durable diesel pickup.',
  },
  {
    id: 'seed-ug-0009',
    listing_type: 'rent',
    make: 'Mitsubishi',
    model: 'Pajero Sport',
    year: 2020,
    trim: 'GLS',
    price: 300000,
    currency: 'UGX',
    location: 'Kampala, Uganda',
    availability: true,
    image_url: 'https://www.mitsubishi-motors.com/en/products/pajero_sport/img/01_exterior.jpg',
    source_url: 'https://www.mitsubishi-motors.com/en/products/pajero_sport/',
    description: '7-seater diesel SUV with modern tech.',
  },
  {
    id: 'seed-ug-0010',
    listing_type: 'sale',
    make: 'Mazda',
    model: 'CX-5',
    year: 2019,
    trim: 'Takumi',
    price: 85000000,
    currency: 'UGX',
    location: 'Mbarara, Uganda',
    availability: true,
    image_url: 'https://www.mazda.com/en/cars/cx-5/gallery/img/exterior01.jpg',
    source_url: 'https://www.mazda.com/en/cars/cx-5/',
    description: 'Compact crossover with premium features.',
  },
  {
    id: 'seed-ug-0011',
    listing_type: 'rent',
    make: 'Hyundai',
    model: 'Santa Fe',
    year: 2021,
    trim: 'Premium',
    price: 190000,
    currency: 'UGX',
    location: 'Kampala, Uganda',
    availability: true,
    image_url: 'https://www.hyundai.com/content/dam/hyundai/ww/en/data/find-a-vehicle/2021/santa-fe/gallery/exterior/exterior-01.jpg',
    source_url: 'https://www.hyundai.com/worldwide/en/find-a-vehicle/santa-fe',
    description: 'Mid-size family SUV with efficient engines.',
  },
  {
    id: 'seed-ug-0012',
    listing_type: 'sale',
    make: 'Kia',
    model: 'Sportage',
    year: 2018,
    trim: 'GT-Line',
    price: 65000000,
    currency: 'UGX',
    location: 'Entebbe, Uganda',
    availability: true,
    image_url: 'https://www.kia.com/content/dam/kwp/gb/en/models/sportage/4th-generation/gallery/exterior/exterior-01.jpg',
    source_url: 'https://www.kia.com/gb/models/sportage/',
    description: 'Efficient compact crossover SUV.',
  },
  {
    id: 'seed-ug-0013',
    listing_type: 'sale',
    make: 'BMW',
    model: 'X5',
    year: 2017,
    trim: 'xDrive40e',
    price: 155000000,
    currency: 'UGX',
    location: 'Kampala, Uganda',
    availability: true,
    image_url: 'https://www.bmw.com/content/dam/bmw/common/all-models/x-series/x5/2017/highlights/bmw-x5-highlights-exterior-01.jpg',
    source_url: 'https://www.bmw.com/en/all-models/x-series/x5/2017.html',
    description: 'Premium hybrid SUV with AWD.',
  },
  {
    id: 'seed-ug-0014',
    listing_type: 'sale',
    make: 'Mercedes-Benz',
    model: 'GLE',
    year: 2019,
    trim: '300d',
    price: 190000000,
    currency: 'UGX',
    location: 'Kampala, Uganda',
    availability: true,
    image_url: 'https://www.mercedes-benz.com/en/vehicles/passenger-cars/gle/_jcr_content/root/slider/sliderchild/slide_0/image/MQ6-0-image-mercedes-benz-gle-2019-01.jpeg',
    source_url: 'https://www.mercedes-benz.com/en/vehicles/passenger-cars/gle/',
    description: 'Luxury SUV with diesel efficiency.',
  },
  {
    id: 'seed-ug-0015',
    listing_type: 'sale',
    make: 'Jeep',
    model: 'Wrangler JL',
    year: 2018,
    trim: 'Unlimited Sahara',
    price: 105000000,
    currency: 'UGX',
    location: 'Entebbe, Uganda',
    availability: true,
    image_url: 'https://www.jeep.com/content/dam/fca-brands/na/jeep/en_us/2020/wrangler/2020-wrangler-unlimited-sahara-exterior.jpg',
    source_url: 'https://www.jeep.com/wrangler.html',
    description: 'Off-road SUV with removable roof panels.',
  },
  {
    id: 'seed-ug-0016',
    listing_type: 'rent',
    make: 'Subaru',
    model: 'Outback',
    year: 2020,
    trim: 'Limited',
    price: 160000,
    currency: 'UGX',
    location: 'Kampala, Uganda',
    availability: true,
    image_url: 'https://www.subaru.com/content/dam/subaru/vehicles/outback/2020/gallery/exterior/exterior-01.jpg',
    source_url: 'https://www.subaru.com/vehicles/outback/index.html',
    description: 'AWD crossover wagon built for adventure.',
  },
  {
    id: 'seed-ug-0017',
    listing_type: 'sale',
    make: 'Volkswagen',
    model: 'Tiguan',
    year: 2019,
    trim: 'Highline',
    price: 78000000,
    currency: 'UGX',
    location: 'Kampala, Uganda',
    availability: true,
    image_url: 'https://www.vw.com/content/dam/onehub/us/en/vehicles/tiguan/2019/gallery/exterior/tiguan-exterior-01.jpg',
    source_url: 'https://www.vw.com/en/models/tiguan.html',
    description: 'Efficient compact SUV with modern features.',
  },
  {
    id: 'seed-ug-0018',
    listing_type: 'sale',
    make: 'Chevrolet',
    model: 'Tahoe',
    year: 2015,
    trim: 'LT',
    price: 130000000,
    currency: 'UGX',
    location: 'Kampala, Uganda',
    availability: true,
    image_url: 'https://www.chevrolet.com/content/dam/chevrolet/na/us/english/index/suvs/2015-tahoe/01-images/2015-tahoe-exterior-01.jpg',
    source_url: 'https://www.chevrolet.com/suvs/tahoe',
    description: 'Full-size V8 SUV with massive cargo space.',
  },
  {
    id: 'seed-ug-0019',
    listing_type: 'rent',
    make: 'Lexus',
    model: 'LX 570',
    year: 2019,
    trim: 'Base',
    price: 880000,
    currency: 'UGX',
    location: 'Kampala, Uganda',
    availability: true,
    image_url: 'https://www.lexus.eu/content/dam/lexus/images/models/lx/2019/overview/LX_2019_exterior_01.jpg',
    source_url: 'https://www.lexus.com/models/LX',
    description: 'Ultra-luxury V8 SUV, king of comfort.',
  },
  {
    id: 'seed-ug-0020',
    listing_type: 'sale',
    make: 'Suzuki',
    model: 'Jimny',
    year: 2018,
    trim: 'SZ5',
    price: 48000000,
    currency: 'UGX',
    location: 'Gulu, Uganda',
    availability: true,
    image_url: 'https://www.globalsuzuki.com/auto-model/img/jimny/gallery/exterior.jpg',
    source_url: 'https://www.globalsuzuki.com/auto-model/lineup/jimny/',
    description: 'Compact mountain goat with true 4x4 ability.',
  },
]

const now = new Date().toISOString()

const listings = rawListings.map((item) => {
  const isRent = item.listing_type === 'rent'
  return {
    slug: item.id,
    title: `${item.make} ${item.model} ${item.year}`,
    description: item.description,
    price_per_day: isRent ? item.price : null,
    price_buy: isRent ? null : item.price,
    location: item.location,
    year: item.year,
    images: item.image_url ? [item.image_url] : [],
    is_for_rent: isRent,
    created_at: now,
  }
})

async function seed() {
  try {
    const { error, data } = await supabase.from('cars').upsert(listings, { onConflict: 'slug' }).select()
    if (error) {
      console.error('Seed error:', error.message || error)
      process.exit(1)
    }
    console.log(`Seeded ${data.length} listings (cars table).`)
  } catch (err) {
    console.error('Unexpected error during seeding:', err)
    process.exit(1)
  }
}

seed()
