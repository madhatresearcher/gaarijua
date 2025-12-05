const fs = require('fs');
const path = require('path');
const https = require('https');

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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
if (!supabaseUrl) {
  console.error('Supabase URL not found in .env.local');
  process.exit(1);
}

try {
  const req = https.get(supabaseUrl, (res) => {
    console.log('HTTP status code:', res.statusCode);
    let bytes = 0;
    res.on('data', (chunk) => { bytes += chunk.length; });
    res.on('end', () => {
      console.log('Response bytes:', bytes);
      if (res.statusCode && res.statusCode >= 200 && res.statusCode < 400) {
        console.log('Supabase URL reachable.');
        process.exit(0);
      } else {
        console.error('Supabase URL returned non-success status.');
        process.exit(2);
      }
    });
  });
  req.on('error', (err) => {
    console.error('Request error:', err.message);
    process.exit(2);
  });
  req.setTimeout(10000, () => {
    console.error('Request timed out');
    req.destroy();
    process.exit(2);
  });
} catch (err) {
  console.error('Error:', err.message || err);
  process.exit(2);
}
