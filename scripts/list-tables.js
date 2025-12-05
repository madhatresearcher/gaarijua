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
  // Allow self-signed TLS certs for this local diagnostic (not for production).
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  loadEnv();
  const conn = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL || process.env.POSTGRES_DATABASE;
  if (!conn || conn === 'postgres') {
    // If a full URL wasn't set, try building from components
    const host = process.env.POSTGRES_HOST;
    const user = process.env.POSTGRES_USER || 'postgres';
    const password = process.env.POSTGRES_PASSWORD;
    const database = process.env.POSTGRES_DATABASE || 'postgres';
    if (!host || !password) {
      console.error('No usable Postgres connection string found in .env.local');
      process.exit(1);
    }
    // Build a connection string assuming standard port 5432
    const built = `postgres://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:5432/${database}`;
    process.env.POSTGRES_CONN = built;
  } else {
    process.env.POSTGRES_CONN = conn;
  }

  const { Client } = require('pg');
  // Supabase uses managed Postgres with SSL; allow self-signed chain validation by disabling
  // strict certificate checks here so the script can connect. This is safe for this local
  // diagnostic script but not recommended for production code.
  const client = new Client({ connectionString: process.env.POSTGRES_CONN, ssl: { rejectUnauthorized: false } });
  try {
    await client.connect();
    const sql = `SELECT table_schema, table_name
                 FROM information_schema.tables
                 WHERE table_type = 'BASE TABLE'
                   AND table_schema NOT IN ('pg_catalog', 'information_schema')
                 ORDER BY table_schema, table_name;`;
    const res = await client.query(sql);
    if (!res.rows || res.rows.length === 0) {
      console.log('No tables found (public schema may be empty).');
    } else {
      console.log('Tables found:');
      res.rows.forEach(r => console.log(`${r.table_schema}.${r.table_name}`));
    }
    await client.end();
  } catch (err) {
    console.error('Error querying Postgres:', err.message || err);
    try { await client.end(); } catch (e) {}
    process.exit(2);
  }
})();
