import { Pool } from 'pg';

export const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT || '5432'),
});

// Create tables if they don't exist
const createTables = async () => {
  const client = await pool.connect();
  try {
    // Create advertisers table
    await client.query(`
      CREATE TABLE IF NOT EXISTS advertisers (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create ads table
    await client.query(`
      CREATE TABLE IF NOT EXISTS ads (
        id SERIAL PRIMARY KEY,
        advertiser_id INTEGER REFERENCES advertisers(id),
        name VARCHAR(255) NOT NULL,
        short_description TEXT,
        body TEXT,
        total_balance DECIMAL(20, 8) NOT NULL,
        remaining_balance DECIMAL(20, 8) NOT NULL,
        impressions INTEGER DEFAULT 0,
        interactions INTEGER DEFAULT 0,
        desired_profile JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create ad_impressions table for unique impressions
    await client.query(`
      CREATE TABLE IF NOT EXISTS ad_impressions (
        id SERIAL PRIMARY KEY,
        ad_id INTEGER REFERENCES ads(id),
        wallet_address VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(ad_id, wallet_address)
      )
    `);

    // Create ad_interactions table for unique interactions
    await client.query(`
      CREATE TABLE IF NOT EXISTS ad_interactions (
        id SERIAL PRIMARY KEY,
        ad_id INTEGER REFERENCES ads(id),
        wallet_address VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(ad_id, wallet_address)
      )
    `);

    // Create portfolios table
    await client.query(`
      CREATE TABLE IF NOT EXISTS portfolios (
        id SERIAL PRIMARY KEY,
        wallet_address VARCHAR(255) UNIQUE NOT NULL,
        profile_ratings JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create index on wallet_address for faster lookups
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_portfolios_wallet_address ON portfolios(wallet_address)
    `);

    // Create indexes for faster lookups on impressions and interactions
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_ad_impressions_ad_id ON ad_impressions(ad_id)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_ad_impressions_wallet ON ad_impressions(wallet_address)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_ad_interactions_ad_id ON ad_interactions(ad_id)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_ad_interactions_wallet ON ad_interactions(wallet_address)
    `);
    
    // Create indexes for date-based queries
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_ad_impressions_created_at ON ad_impressions(created_at)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_ad_interactions_created_at ON ad_interactions(created_at)
    `);

    console.log('Database tables created successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  } finally {
    client.release();
  }
}; 