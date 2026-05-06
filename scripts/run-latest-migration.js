const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

function loadDatabaseUrl() {
  // Try .env file first
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const env = fs.readFileSync(envPath, 'utf8');
    const match = env.match(/DATABASE_URL\s*=\s*"?([^"\r\n]+)"?/);
    if (match) return match[1];
  }
  
  // Try .env.local
  const envLocalPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envLocalPath)) {
    const env = fs.readFileSync(envLocalPath, 'utf8');
    const match = env.match(/DATABASE_URL\s*=\s*"?([^"\r\n]+)"?/);
    if (match) return match[1];
  }
  
  // Fallback to environment variable
  return process.env.DATABASE_URL;
}

async function main() {
  // Use the latest migration
  const sqlPath = path.resolve(process.cwd(), 'prisma', 'migrations', '20260503000000_add_expense_and_stock_color', 'migration.sql');
  if (!fs.existsSync(sqlPath)) {
    console.error('❌ migration.sql not found at', sqlPath);
    process.exit(1);
  }

  const sql = fs.readFileSync(sqlPath, 'utf8');
  const databaseUrl = loadDatabaseUrl();
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL not found in .env, .env.local, or environment variables');
    console.error('\nTo set DATABASE_URL:');
    console.error('  Option 1: Create .env file with DATABASE_URL="your_connection_string"');
    console.error('  Option 2: Set environment variable: $env:DATABASE_URL="your_connection_string"');
    console.error('\nExample Supabase URL:');
    console.error('  postgresql://user:password@aws-1-ap-south-1.pooler.supabase.com:6543/postgres');
    process.exit(1);
  }

  console.log('📡 Connecting to database...');
  const client = new Client({ 
    connectionString: databaseUrl, 
    ssl: { 
      rejectUnauthorized: false,
      minVersion: 'TLSv1.2'
    },
    connect_timeout: 10000 // 10 second timeout
  });
  
  try {
    await client.connect();
    console.log('✅ Connected to database successfully');
    console.log('🔄 Executing migration SQL...\n');
    
    // Split SQL into individual statements and execute
    const statements = sql.split(';').filter(stmt => stmt.trim());
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();
      if (statement) {
        console.log(`[${i + 1}/${statements.length}] Executing: ${statement.substring(0, 60)}...`);
        await client.query(statement);
      }
    }
    
    console.log('\n✅ Migration executed successfully!');
    console.log('📊 Changes applied:');
    console.log('   • Created "Expense" table');
    console.log('   • Added "colour" column to "Stock" table');
    console.log('   • Updated "Stock" unique constraint');
    console.log('   • Created index on "Expense"."date"');
  } catch (err) {
    console.error('\n❌ Error executing migration SQL:');
    console.error(err.message || err);
    
    // Provide helpful error info
    if (err.code === 'ECONNREFUSED' || err.message.includes('connect')) {
      console.error('\n💡 Connection Error - Database may be unreachable');
      console.error('   • Verify DATABASE_URL is correct');
      console.error('   • Check database server is running');
      console.error('   • For Supabase: Verify network/firewall allows connection');
    }
    
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

main();
