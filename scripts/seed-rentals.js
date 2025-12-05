const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

// Load .env.local manually (avoid adding dotenv dependency)
try {
  const envPath = './.env.local'
  if (fs.existsSync(envPath)) {
    const raw = fs.readFileSync(envPath, 'utf8')
    raw.split(/\r?\n/).forEach((line) => {
      const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/)
      if (!m) return
      let [, key, val] = m
      // strip surrounding quotes
      if ((val.startsWith("\"") && val.endsWith("\"")) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1)
      }
      if (!process.env[key]) process.env[key] = val
    })
  }
} catch (e) {
  // ignore
}

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRole) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRole)

async function seed() {
  const now = new Date().toISOString()
  const listings = [
    {
      title: 'Toyota RAV4 — 2019 (Daily Rent)',
      slug: 'toyota-rav4-2019-rent-' + Date.now(),
      description: 'Comfortable SUV, great for family trips. Automatic, AC, 5 seats.',
      price_per_day: 55,
      location: 'Kampala',
      year: 2019,
      images: ['https://picsum.photos/seed/rav4/1200/800'],
      promoted: false,
      created_at: now,
      type: 'rental'
    },
    {
      title: 'Nissan X-Trail — 2018 (Daily Rent)',
      slug: 'nissan-xtrail-2018-rent-' + (Date.now()+1),
      description: 'Spacious and reliable SUV. Clean interior, ideal for long drives.',
      price_per_day: 47,
      location: 'Entebbe',
      year: 2018,
      images: ['https://picsum.photos/seed/xtrail/1200/800'],
      promoted: false,
      created_at: now,
      type: 'rental'
    },
    {
      title: 'Toyota Hiace Van — 2016 (Daily Rent)',
      slug: 'toyota-hiace-2016-rent-' + (Date.now()+2),
      description: 'Reliable 12-seater van, perfect for group transport and airport runs.',
      price_per_day: 80,
      location: 'Kampala',
      year: 2016,
      images: ['https://picsum.photos/seed/hiace/1200/800'],
      promoted: false,
      created_at: now,
      type: 'rental'
    },
    {
      title: 'Suzuki Swift — 2020 (Daily Rent)',
      slug: 'suzuki-swift-2020-rent-' + (Date.now()+3),
      description: 'Small, fuel-efficient hatchback. Easy to park, ideal for city use.',
      price_per_day: 30,
      location: 'Jinja',
      year: 2020,
      images: ['https://picsum.photos/seed/swift/1200/800'],
      promoted: false,
      created_at: now,
      type: 'rental'
    },
    {
      title: 'Land Cruiser Prado — 2015 (Daily Rent)',
      slug: 'prado-2015-rent-' + (Date.now()+4),
      description: 'Powerful 4x4, perfect for rough roads and safari trips.',
      price_per_day: 120,
      location: 'Mbarara',
      year: 2015,
      images: ['https://picsum.photos/seed/prado/1200/800'],
      promoted: false,
      created_at: now,
      type: 'rental'
    },
  ]

  try {
    const { data, error } = await supabase.from('cars').insert(listings).select()
    if (error) {
      console.error('Insert error:', error)
      // Try a fallback: insert only a minimal set of fields in case schema differs
      const allowed = ['title', 'slug', 'description', 'price_per_day', 'location', 'year', 'images', 'price_buy']
      const simplified = listings.map((l) => {
        const out = {}
        allowed.forEach((k) => { if (l[k] !== undefined) out[k] = l[k] })
        return out
      })
      const { data: d2, error: e2 } = await supabase.from('cars').insert(simplified).select()
      if (e2) {
        console.error('Fallback insert error:', e2)
        process.exit(1)
      }
      console.log('Inserted (fallback) listings:', d2.length)
      d2.forEach((row) => console.log(row.id, row.title, row.slug))
      return
    }
    console.log('Inserted listings:', data.length)
    data.forEach((row) => console.log(row.id, row.title, row.slug))
  } catch (err) {
    console.error('Unexpected error:', err)
    process.exit(1)
  }
}

seed()
