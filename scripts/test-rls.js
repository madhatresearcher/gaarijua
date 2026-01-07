const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load .env.local
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
    if (!process.env[key]) process.env[key] = val
  })
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('=== RLS Diagnostic ===')
console.log('URL:', url ? 'set' : 'MISSING')
console.log('Service Key:', serviceKey ? 'set' : 'MISSING')
console.log('Anon Key:', anonKey ? 'set' : 'MISSING')
console.log('')

async function test() {
  // Test with service role (should bypass RLS)
  console.log('--- Testing SERVICE ROLE key (bypasses RLS) ---')
  const sbService = createClient(url, serviceKey)
  const { data: sData, error: sErr } = await sbService.from('cars').select('id, title').limit(3)
  if (sErr) {
    console.log('Service Role ERROR:', sErr.message, sErr.code)
  } else {
    console.log('Service Role OK:', sData?.length ?? 0, 'rows')
    sData?.forEach((r) => console.log('  -', r.title))
  }

  console.log('')

  // Test with anon key (subject to RLS)
  console.log('--- Testing ANON key (subject to RLS) ---')
  const sbAnon = createClient(url, anonKey)
  const { data: aData, error: aErr } = await sbAnon.from('cars').select('id, title').limit(3)
  if (aErr) {
    console.log('Anon Key CARS ERROR:', aErr.message, aErr.code)
  } else {
    console.log('Anon Key CARS OK:', aData?.length ?? 0, 'rows')
    aData?.forEach((r) => console.log('  -', r.title))
  }

  const { data: pData, error: pErr } = await sbAnon.from('parts').select('id, title').limit(3)
  if (pErr) {
    console.log('Anon Key PARTS ERROR:', pErr.message, pErr.code)
  } else {
    console.log('Anon Key PARTS OK:', pData?.length ?? 0, 'rows')
    pData?.forEach((r) => console.log('  -', r.title))
  }

  console.log('')

  // Check RLS status on tables
  console.log('--- Checking table RLS status via pg_class ---')
  const { data: rlsCheck, error: rlsErr } = await sbService.rpc('check_rls_status')
  if (rlsErr) {
    console.log('RLS check via RPC failed (function may not exist):', rlsErr.message)
    // Try raw query instead
    const { data: rawCheck, error: rawErr } = await sbService
      .from('cars')
      .select('*')
      .limit(1)
    console.log('Direct cars query:', rawErr ? rawErr.message : `OK, got ${rawCheck?.length} row(s)`)
  } else {
    console.log('RLS Status:', rlsCheck)
  }
}

test().then(() => process.exit(0)).catch((e) => {
  console.error('Unexpected error:', e)
  process.exit(1)
})
