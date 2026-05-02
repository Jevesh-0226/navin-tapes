const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

function loadDatabaseUrl() {
  const envPath = path.resolve(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) return process.env.DATABASE_URL;
  const env = fs.readFileSync(envPath, 'utf8');
  const match = env.match(/DATABASE_URL\s*=\s*"?([^"\r\n]+)"?/);
  return match ? match[1] : process.env.DATABASE_URL;
}

async function main() {
  const sqlPath = path.resolve(process.cwd(), 'prisma', 'migrations', '20260502161000_add_order_date_product_quantity_box_and_yarn', 'migration.sql');
  if (!fs.existsSync(sqlPath)) {
    console.error('migration.sql not found at', sqlPath);
    process.exit(1);
  }

  const sql = fs.readFileSync(sqlPath, 'utf8');
  const databaseUrl = loadDatabaseUrl();
  if (!databaseUrl) {
    console.error('DATABASE_URL not found in .env or environment');
    process.exit(1);
  }

  // Allow connecting to hosts with self-signed certs (Supabase connection)
  const client = new Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });
  try {
    await client.connect();
    console.log('Connected to DB, executing migration SQL...');
    await client.query(sql);
    console.log('Migration SQL executed successfully.');
  } catch (err) {
    console.error('Error executing migration SQL:', err.message || err);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

main();
