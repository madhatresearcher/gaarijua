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
    body_type: 'SUV',
    images: ['https://topgear.co.za/wp-content/uploads/2023/09/606f7478eec984ab995aad17_Toyota-Prado-2020-119.jpg'],
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
    body_type: 'SUV',
    images: ['https://d3jvxfsgjxj1vz.cloudfront.net/news/wp-content/uploads/2024/09/11212908/new-2025-nissan-patrol-y63-first-look-review-19.webp'],
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
    body_type: 'SUV',
    images: [
      'https://images.cdn.autocar.co.uk/sites/autocar.co.uk/files/styles/gallery_slide/public/mercedes-glc-review-2023-03-cornering-front.jpg?itok=u11WVGPt',
      'https://images.cdn.autocar.co.uk/sites/autocar.co.uk/files/styles/gallery_slide/public/mercedes-glc-review-2023-05-cornering-rear.jpg?itok=4Jr6Mvej',
      'https://images.cdn.autocar.co.uk/sites/autocar.co.uk/files/styles/gallery_slide/public/mercedes-glc-review-2023-16-boot.jpg?itok=KwNcfGEW',
    ],
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
    body_type: 'SUV',
    images: [
      'https://hips.hearstapps.com/hmg-prod/images/2026-hyundai-palisade-xrt-pro-pr-133-67fec710624bb.jpg?crop=1xw:1xh;center,top',
      'https://hips.hearstapps.com/hmg-prod/images/2026-hyundai-palisade-xrt-pro-pr-151-67fec71dbe17d.jpg?crop=1xw:1xh;center,top',
    ],
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
    body_type: 'pickup truck',
    images: [
      'https://carsguide-res.cloudinary.com/image/upload/c_fit,h_841,w_1490,f_auto,t_cg_base/v1/editorial/segment_review%2Fhero_image%2FIMG_2130.JPG',
      'https://carsguide-res.cloudinary.com/image/upload/c_fit,h_794,w_1191,f_auto,t_cg_base/v1/editorial/IMG_2127%20copy.jpg',
      'https://carsguide-res.cloudinary.com/image/upload/c_fit,h_794,w_1191,f_auto,t_cg_base/v1/editorial/IMG_2118.JPG',
      'https://carsguide-res.cloudinary.com/image/upload/c_fit,h_794,w_1191,f_auto,t_cg_base/v1/editorial/IMG_2122.JPG',
    ],
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
    body_type: 'SUV',
    images: [
      'https://images.prismic.io/carwow/38cac358-345e-48c7-bb5e-1b7e209811e0_2021+Land+Rover+Defender+110+front+quarter+static.jpg?auto=format&cs=tinysrgb&fit=max&q=60',
      'https://images.prismic.io/carwow/c43eed8d-59c5-4c39-aed9-932433586cd9_2021+Land+Rover+Defender+110+rear+quarter+static.jpg?auto=format&cs=tinysrgb&fit=max&q=60',
      'https://images.prismic.io/carwow/a2993960-f97c-44ac-bed2-2332ddbf2610_2021+Land+Rover+Defender+110+interior.jpg?auto=format&cs=tinysrgb&fit=max&q=60',
    ],
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
    body_type: 'SUV',
    images: [
      'https://hips.hearstapps.com/hmg-prod/images/2024-mercedes-benz-gle450-exterior-102-677eca51945f8.jpg?crop=0.704xw:0.525xh;0.277xw,0.348xh&resize=1400:*',
      'https://hips.hearstapps.com/hmg-prod/images/2024-mercedes-benz-gle450-exterior-104-677eca533f6d7.jpg?crop=1xw:1xh;center,top',
      'https://hips.hearstapps.com/hmg-prod/images/2024-mercedes-benz-gle450-interior-101-677eca9b8be24.jpg?crop=1xw:1xh;center,top',
    ],
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
    body_type: 'SUV',
    images: [
      'https://hips.hearstapps.com/hmg-prod/images/tmna-2191021-land-cruiser-200-heritage-0001-1572378175.jpg',
      'https://hips.hearstapps.com/hmg-prod/images/2020-toyota-land-cruiser-heritage-edition-102-1549575831.jpg',
      'https://hips.hearstapps.com/hmg-prod/images/2020-toyota-land-cruiser-heritage-edition-104-1598531585.jpg',
      'https://hips.hearstapps.com/hmg-prod/images/2020-toyota-land-cruiser-heritage-edition-105-1598531587.jpg',
      'https://hips.hearstapps.com/hmg-prod/images/tmna-2191021-land-cruiser-200-heritage-black-0001-2-1572380280.jpg',
    ],
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
    body_type: 'SUV',
    images: [
      'https://hips.hearstapps.com/hmg-prod/images/2023-lexus-rx-350-f-sport-110-660af2a051ca9.jpeg?crop=1xw:1xh;center,top',
      'https://hips.hearstapps.com/hmg-prod/images/2023-lexus-rx-350-f-sport-105-660af299edbef.jpg?crop=1xw:1xh;center,top',
      'https://hips.hearstapps.com/hmg-prod/images/2023-lexus-rx-350-f-sport-103-660af2977aa1e.jpg?crop=1xw:1xh;center,top',
      'https://hips.hearstapps.com/hmg-prod/images/2023-lexus-rx-350-f-sport-101-660af21fc4412.jpg?crop=1xw:1xh;center,top',
      'https://hips.hearstapps.com/hmg-prod/images/2023-lexus-rx-350-f-sport-113-660af21de4ff5.jpg?crop=1xw:1xh;center,top',
    ],
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
    body_type: 'pickup truck',
    images: [
      'https://hips.hearstapps.com/hmg-prod/images/2024-ford-ranger-lariat-171-66fd5b726377f.jpg?crop=1xw:1xh;center,top',
      'https://hips.hearstapps.com/hmg-prod/images/2024-ford-ranger-lariat-184-66fd5b7826597.jpg?crop=1xw:1xh;center,top',
      'https://hips.hearstapps.com/hmg-prod/images/2024-ford-ranger-lariat-205-66fd5b789dc1a.jpg?crop=1xw:1xh;center,top',
      'https://hips.hearstapps.com/hmg-prod/images/2024-ford-ranger-lariat-173-66fd5b77b95a3.jpg?crop=1xw:1xh;center,top',
      'https://hips.hearstapps.com/hmg-prod/images/2024-ford-ranger-113-65f8a2e021b01.jpg?crop=1xw:1xh;center,top',
    ],
    slug: 'ford-ranger-wildtrak-2019-sale',
    is_for_rent: false,
    price_buy: 45000.0,
    location: 'Gulu, Uganda',
    mileage: 67000,
  },
  {
    title: 'Audi A6 Avant — 2022 Estate Sale',
    brand: 'Audi',
    model: 'A6 Avant',
    year: 2022,
    description: 'Executive estate with flowing roofline, adaptive cruise, and heated seats.',
    body_type: 'estate',
    images: [
      'https://cdn.motor1.com/images/mgl/V7eqJ/s1/2022-audi-a6-avant.jpg',
      'https://cdn.motor1.com/images/mgl/UKb6l/s1/2022-audi-a6-avant-interior.jpg',
    ],
    slug: 'audi-a6-avant-2022-sale',
    is_for_rent: false,
    price_buy: 125000.0,
    location: 'Kampala, Uganda',
    mileage: 28000,
  },
  {
    title: 'Mercedes-Benz E 300 — 2020 Sedan Sale',
    brand: 'Mercedes-Benz',
    model: 'E 300',
    year: 2020,
    description: 'Refined executive sedan with AIRMATIC suspension, burled wood, and ambient lighting.',
    body_type: 'Sedan',
    images: [
      'https://cdn.motor1.com/images/mgl/6v4p0/s1/2020-mercedes-benz-e300.jpg',
      'https://cdn.motor1.com/images/mgl/3vWW2/s1/2021-mercedes-benz-e300-interior.jpg',
    ],
    slug: 'mercedes-e300-2020-sale',
    is_for_rent: false,
    price_buy: 97000.0,
    location: 'Mbale, Uganda',
    mileage: 42000,
  },
  {
    title: 'Toyota GR86 — 2022 Track Edition',
    brand: 'Toyota',
    model: 'GR86',
    year: 2022,
    description: 'Lightweight coupe with flat-four engine, manual gearbox, and sport-tuned chassis.',
    body_type: 'coupe',
    images: [
      'https://cdn.motor1.com/images/mgl/0ANpK/s1/2022-toyota-gr86.jpg',
      'https://cdn.motor1.com/images/mgl/2DoIQ/s1/2022-toyota-gr86-interior.jpg',
    ],
    slug: 'toyota-gr86-2022-sale',
    is_for_rent: false,
    price_buy: 46000.0,
    location: 'Jinja, Uganda',
    mileage: 15000,
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
