const fs = require('fs');
const path = require('path');
async function loadEnv() {
  const envPath = path.resolve(__dirname, '..', '.env.local');
  if (!fs.existsSync(envPath)) {
    console.error('.env.local not found at', envPath);
    process.exit(1);
  }
  const raw = fs.readFileSync(envPath, 'utf8');
  raw.split(/\r?\n/).forEach(line => {
    if (!line || line.trim().startsWith('#')) return;
    const m = line.match(/^\s*([^=]+)=\s*(?:"([^"]*)"|'([^']*)'|(.*))$/);
    if (m) {
      const key = m[1].trim();
      const value = m[2] ?? m[3] ?? m[4] ?? '';
      process.env[key] = value;
    }
  });
}

(async () => {
  await loadEnv();
  const { createClient } = require('@supabase/supabase-js');
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) {
    console.error('Supabase URL not set');
    process.exit(1);
  }
  if (!anon && !service) {
    console.error('No Supabase keys found (anon or service role)');
    process.exit(1);
  }

  // Use anon key by default for safe reads; fall back to service role if present
  const keyToUse = anon || service;
  const supabase = createClient(url, keyToUse, {
    // minimal logging
    global: { headers: {} },
  });

  async function tryTable(table) {
    try {
      const { data, error, status } = await supabase.from(table).select('id').limit(1);
      if (error) {
        console.log(`${table}: error:`, error.message || error);
        return { table, ok: false, error: error.message || error, status };
      }
      console.log(`${table}: success, rows returned: ${Array.isArray(data) ? data.length : 0}`);
      return { table, ok: true, rows: Array.isArray(data) ? data.length : 0, status };
    } catch (err) {
      console.log(`${table}: exception:`, err.message || err);
      return { table, ok: false, error: err.message || err };
    }
  }

  const tablesToCheck = ['cars', 'parts'];
  const results = [];
  for (const t of tablesToCheck) {
    // eslint-disable-next-line no-await-in-loop
    results.push(await tryTable(t));
  }

  // If both failed, try a safe auth request to validate key
  const allFailed = results.every(r => !r.ok);
  if (allFailed) {
    try {
      const { data, error, status } = await supabase.auth.getUser();
      if (error) {
        console.log('auth.getUser: error:', error.message || error);
      } else {
        console.log('auth.getUser: success', !!data?.user);
      }
    } catch (err) {
      console.log('auth.getUser: exception:', err.message || err);
    }
  }

  process.exit(0);
})();
