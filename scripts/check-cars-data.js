const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

function loadEnv(path) {
  if (!fs.existsSync(path)) return
  const raw = fs.readFileSync(path, 'utf8')
  raw.split(/\r?\n/).forEach((line) => {
    const match = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/)
    if (!match) return
    let [, key, value] = match
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }
    if (!process.env[key]) process.env[key] = value
  })
}

loadEnv('.env.local')

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase credentials')
}
const supabase = createClient(supabaseUrl, supabaseKey)

async function main() {
  const { count, error: countError } = await supabase.from('cars').select('*', { count: 'exact', head: true })
  if (countError) {
    throw countError
  }
  console.log('Total cars rows:', count)

  const { data, error } = await supabase
    .from('cars')
    .select('slug,title,images,is_for_rent,price_per_day,price_buy,location,created_at')
    .order('created_at', { ascending: false })
    .limit(5)
  if (error) {
    throw error
  }
  console.log('Latest rows:')
  data.forEach((row) => console.log(JSON.stringify(row)))
}

main().catch((err) => {
  console.error('Error fetching cars data:', err)
  process.exit(1)
})
