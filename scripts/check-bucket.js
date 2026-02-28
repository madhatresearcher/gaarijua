const fs = require('fs');
const path = require('path');
(async ()=>{
  const envPath = path.resolve(__dirname, '..', '.env.local');
  if (!fs.existsSync(envPath)) return console.error('.env.local not found');
  const raw = fs.readFileSync(envPath,'utf8');
  const env = {};
  raw.split(/\r?\n/).forEach(line=>{
    const m=line.match(/^\s*([^=]+)=\s*(?:"([^"]*)"|'([^']*)'|(.*))$/);
    if (!m) return; const k=m[1].trim(); const v=m[2]||m[3]||m[4]||''; env[k]=v;
  });
  const { createClient } = require('@supabase/supabase-js');
  const url = env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY;
  if (!url || !key) return console.error('SUPABASE_URL or SERVICE_ROLE_KEY missing in .env.local');
  const supabase = createClient(url, key);
  try {
    const bucket = 'car-images';
    console.log('Checking bucket:', bucket, 'on', url);
    const { data, error } = await supabase.storage.from(bucket).list('', { limit: 1 });
    if (error) {
      console.error('Error listing bucket:', error.message || JSON.stringify(error));
      process.exit(2);
    }
    console.log('Bucket exists. First item(s):', data);
  } catch (err) {
    console.error('Unexpected error:', err.message || err);
    process.exit(3);
  }
})();
