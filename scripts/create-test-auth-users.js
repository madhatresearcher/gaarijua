const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

function loadEnv() {
  const envPath = path.resolve(__dirname, '..', '.env.local');
  if (!fs.existsSync(envPath)) {
    console.error('.env.local not found');
    process.exit(1);
  }
  const raw = fs.readFileSync(envPath, 'utf8');
  raw.split(/\r?\n/).forEach((line) => {
    if (!line || line.trim().startsWith('#')) return;
    const m = line.match(/^\s*([^=]+)=\s*(?:"([^\"]*)"|'([^']*)'|(.*))$/);
    if (!m) return;
    const key = m[1].trim();
    const value = m[2] ?? m[3] ?? m[4] ?? '';
    process.env[key] = value;
  });
}

(async () => {
  loadEnv();
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or service role key');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const users = [
    { id: '11111111-1111-1111-1111-111111111111', email: 'admin@gaarijua.com', password: 'Admin123!', role: 'admin' },
    { id: '22222222-2222-2222-2222-222222222222', email: 'support@gaarijua.com', password: 'Support123!', role: 'support' },
    { id: '33333333-3333-3333-3333-333333333333', email: 'vendor1@gaarijua.com', password: 'Vendor123!', role: 'vendor' },
    { id: '44444444-4444-4444-4444-444444444444', email: 'vendor2@gaarijua.com', password: 'Vendor123!', role: 'vendor' },
    { id: '55555555-5555-5555-5555-555555555555', email: 'rental@gaarijua.com', password: 'Rental123!', role: 'vendor' },
  ];

  for (const user of users) {
    const body = {
      id: user.id,
      email: user.email,
      password: user.password,
      email_confirm: true,
      user_metadata: { role: user.role },
    };
    const { data, error } = await supabase.auth.admin.createUser(body);
    if (error) {
      console.error('Failed to create user', user.email, error.message);
    } else {
      console.log('Created/updated user', data.user.id, data.user.email);
    }
  }
})();