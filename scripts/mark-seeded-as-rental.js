const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

// Load .env.local manually
try {
  const envPath = './.env.local'
  if (fs.existsSync(envPath)) {
    const raw = fs.readFileSync(envPath, 'utf8')
    raw.split(/\r?\n/).forEach((line) => {
      const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/)
      if (!m) return
      let [, key, val] = m
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

const slugs = [
  'toyota-rav4-2019-rent-1764942878104',
  'nissan-xtrail-2018-rent-1764942878105',
  'toyota-hiace-2016-rent-1764942878106',
  'suzuki-swift-2020-rent-1764942878107',
  'prado-2015-rent-1764942878108'
]

async function mark() {
  try {
    // First, set is_for_rent = true
    const { data, error } = await supabase.from('cars').update({ is_for_rent: true }).in('slug', slugs).select()
    if (error) {
      console.error('Update is_for_rent error:', error)
    } else {
      console.log('Updated is_for_rent for rows:', data?.length)
    }

    // Then try to set type='rental' if the column exists (in a try/catch)
    try {
      const { data: d2, error: e2 } = await supabase.from('cars').update({ type: 'rental' }).in('slug', slugs).select()
      if (e2) {
        console.warn('Could not set type column (it may not exist):', e2.message || e2)
      } else {
        console.log('Set type=rental for rows:', d2?.length)
      }
    } catch (e) {
      console.warn('Skipping type update, column may not exist:', e.message || e)
    }

  } catch (err) {
    console.error('Unexpected error:', err)
    process.exit(1)
  }
}

mark()
