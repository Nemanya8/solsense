import { Pool } from 'pg';

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT || '5432'),
});

async function runMigrations() {
  const client = await pool.connect();
  
  try {
    console.log('Starting database migrations...');
    
    // Check if content_type column exists in the ads table
    const columnCheckResult = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'ads' AND column_name = 'content_type'
    `);

    // If column doesn't exist, add it
    if (columnCheckResult.rows.length === 0) {
      console.log('Adding content_type column to ads table...');
      await client.query(`
        ALTER TABLE ads 
        ADD COLUMN content_type VARCHAR(10) NOT NULL DEFAULT 'text'
      `);
      console.log('Added content_type column successfully!');
    } else {
      console.log('content_type column already exists in ads table.');
    }

    console.log('Database migrations completed successfully!');
  } catch (error) {
    console.error('Error running migrations:', error);
  } finally {
    client.release();
  }
}

// Run migrations when this script is executed directly
if (require.main === module) {
  runMigrations()
    .then(() => {
      console.log('Migration process completed');
      process.exit(0);
    })
    .catch(err => {
      console.error('Migration process failed:', err);
      process.exit(1);
    });
}

export { runMigrations }; 