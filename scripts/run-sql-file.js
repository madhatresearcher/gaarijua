const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

function loadEnv() {
  const envPath = path.resolve(__dirname, '..', '.env.local');
  if (!fs.existsSync(envPath)) {
    console.error('.env.local not found at', envPath);
    process.exit(1);
  }
  const raw = fs.readFileSync(envPath, 'utf8');
  raw.split(/\r?\n/).forEach((line) => {
    if (!line || line.trim().startsWith('#')) return;
    const m = line.match(/^\s*([^=]+)=\s*(?:"([^"]*)"|'([^']*)'|(.*))$/);
    if (!m) return;
    const key = m[1].trim();
    const value = m[2] ?? m[3] ?? m[4] ?? '';
    process.env[key] = value;
  });
}

function getConnectionString() {
  const candidate =
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_CONN ||
    process.env.POSTGRES_DATABASE;
  if (candidate && candidate !== 'postgres') {
    return candidate;
  }
  const host = process.env.POSTGRES_HOST;
  const user = process.env.POSTGRES_USER || 'postgres';
  const password = process.env.POSTGRES_PASSWORD;
  const database = process.env.POSTGRES_DATABASE || 'postgres';
  if (!host || !password) {
    console.error('Missing Postgres connection info in .env.local');
    process.exit(1);
  }
  return `postgres://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:5432/${database}`;
}

async function runSqlFile(filePath) {
  const fullPath = path.resolve(__dirname, filePath);
  if (!fs.existsSync(fullPath)) {
    console.error('SQL file not found:', fullPath);
    process.exit(1);
  }
  const sql = fs.readFileSync(fullPath, 'utf8');
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  const client = new Client({
    connectionString: getConnectionString(),
    ssl: { rejectUnauthorized: false },
  });
  try {
    await client.connect();
    console.log(`Running ${path.basename(fullPath)}...`);
    await client.query(sql);
    console.log(`Finished ${path.basename(fullPath)}.`);
  } finally {
    await client.end();
  }
}

(async () => {
  loadEnv();
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('Usage: node run-sql-file.js <relative-sql-path> [more-sql-paths]');
    process.exit(1);
  }
  for (const arg of args) {
    await runSqlFile(arg);
  }
})();