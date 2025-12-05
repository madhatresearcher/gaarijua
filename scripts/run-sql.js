const fs = require('fs');
const path = require('path');

function loadEnv() {
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
  // Relax TLS for this local diagnostic (not for production)
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  loadEnv();
  const conn = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL || process.env.POSTGRES_CONN || process.env.POSTGRES_DATABASE;
  if (!conn || conn === 'postgres') {
    const host = process.env.POSTGRES_HOST;
    const user = process.env.POSTGRES_USER || 'postgres';
    const password = process.env.POSTGRES_PASSWORD;
    const database = process.env.POSTGRES_DATABASE || 'postgres';
    if (!host || !password) {
      console.error('No usable Postgres connection string found in .env.local');
      process.exit(1);
    }
    const built = `postgres://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:5432/${database}`;
    process.env.POSTGRES_CONN = built;
  } else {
    process.env.POSTGRES_CONN = conn;
  }

  const { Client } = require('pg');
  const sqlPath = path.resolve(__dirname, 'seed-gaarijua.sql');
  if (!fs.existsSync(sqlPath)) {
    console.error('SQL file not found:', sqlPath);
    process.exit(1);
  }
  const sql = fs.readFileSync(sqlPath, 'utf8');
  const client = new Client({ connectionString: process.env.POSTGRES_CONN, ssl: { rejectUnauthorized: false } });
  try {
    await client.connect();
    console.log('Connected to Postgres, running migration...');
    const res = await client.query(sql);
    // Query returns last result only; run an extra query to fetch counts
    const carsRes = await client.query("SELECT COUNT(*) FROM public.cars");
    const partsRes = await client.query("SELECT COUNT(*) FROM public.parts");
    console.log('cars count:', carsRes.rows[0].count);
    console.log('parts count:', partsRes.rows[0].count);
    await client.end();
    console.log('Migration completed.');
    process.exit(0);
  } catch (err) {
    console.error('Error running SQL:', err.message || err);
    try { await client.end(); } catch (e) {}
    process.exit(2);
  }
})();
