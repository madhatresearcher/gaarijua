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
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'" ) && val.endsWith("'"))) {
        val = val.slice(1, -1)
      }
      if (!process.env[key]) process.env[key] = val
    })
  } catch (err) {
    console.warn('failed to read .env.local', err.message)
  }
}

loadEnv()
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!supabaseUrl || !supabaseKey) {
  console.error('missing supabase connection info')
  process.exit(1)
}
const supabase = createClient(supabaseUrl, supabaseKey)

async function countParts() {
  const { count, error } = await supabase.from('parts').select('*', { count: 'exact' })
  if (error) {
    console.error('count error', error)
    return
  }
  console.log('parts count', count)
}

countParts()
