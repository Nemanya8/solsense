import { Pool } from 'pg';

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT || '5432'),
});

export interface ProfileRatings {
  whale: number;
  hodler: number;
  flipper: number;
  defi_user: number;
  experienced: number;
}

export interface Ad {
  id: number;
  advertiser_id: number;
  name: string;
  short_description: string;
  body: string;
  total_balance: number;
  remaining_balance: number;
  desired_profile: ProfileRatings;
  impressions: number;
  interactions: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreateAdData {
  advertiser_id: number;
  name: string;
  short_description: string;
  body: string;
  total_balance: number;
  desired_profile: ProfileRatings;
}

export const createAdImpressionsTable = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS ad_impressions (
        id SERIAL PRIMARY KEY,
        ad_id INTEGER NOT NULL REFERENCES ads(id),
        wallet_address VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(ad_id, wallet_address)
      )
    `);
  } finally {
    client.release();
  }
};

export const createAdInteractionsTable = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS ad_interactions (
        id SERIAL PRIMARY KEY,
        ad_id INTEGER NOT NULL REFERENCES ads(id),
        wallet_address VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(ad_id, wallet_address)
      )
    `);
  } finally {
    client.release();
  }
};

export const createAdsTable = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS ads (
        id SERIAL PRIMARY KEY,
        advertiser_id INTEGER NOT NULL REFERENCES advertisers(id),
        name VARCHAR(255) NOT NULL,
        short_description TEXT NOT NULL,
        body TEXT NOT NULL,
        total_balance DECIMAL(20, 8) NOT NULL,
        remaining_balance DECIMAL(20, 8) NOT NULL,
        desired_profile JSONB NOT NULL,
        impressions INTEGER DEFAULT 0,
        interactions INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
  } finally {
    client.release();
  }
};

export const createAd = async (data: CreateAdData): Promise<Ad> => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `INSERT INTO ads (
        advertiser_id, name, short_description, body, 
        total_balance, remaining_balance, desired_profile,
        impressions, interactions, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $5, $6, 0, 0, NOW(), NOW())
      RETURNING *`,
      [
        data.advertiser_id,
        data.name,
        data.short_description,
        data.body,
        data.total_balance,
        JSON.stringify(data.desired_profile)
      ]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error creating ad:', error);
    throw error;
  } finally {
    client.release();
  }
};

export const getAdById = async (id: number): Promise<Ad | null> => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT * FROM ads WHERE id = $1`,
      [id]
    );
    if (!result.rows[0]) return null;
    
    // Parse decimal values to numbers
    const ad = result.rows[0];
    return {
      ...ad,
      total_balance: parseFloat(ad.total_balance),
      remaining_balance: parseFloat(ad.remaining_balance)
    };
  } catch (error) {
    console.error('Error getting ad:', error);
    throw error;
  } finally {
    client.release();
  }
};

export const getAdsByAdvertiserId = async (advertiserId: number): Promise<Ad[]> => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT * FROM ads WHERE advertiser_id = $1 ORDER BY created_at DESC`,
      [advertiserId]
    );
    // Parse decimal values to numbers for each ad
    return result.rows.map(ad => ({
      ...ad,
      total_balance: parseFloat(ad.total_balance),
      remaining_balance: parseFloat(ad.remaining_balance)
    }));
  } catch (error) {
    console.error('Error getting advertiser ads:', error);
    throw error;
  } finally {
    client.release();
  }
};

export const updateAdStats = async (id: number, impressions: number, interactions: number): Promise<Ad> => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `UPDATE ads 
       SET impressions = impressions + $1,
           interactions = interactions + $2,
           updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [impressions, interactions, id]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error updating ad stats:', error);
    throw error;
  } finally {
    client.release();
  }
};

export const updateAdRemainingBalance = async (id: number, amount: number): Promise<Ad> => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `UPDATE ads 
       SET remaining_balance = remaining_balance - $1,
           updated_at = NOW()
       WHERE id = $2 AND remaining_balance >= $1
       RETURNING *`,
      [amount, id]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error updating ad balance:', error);
    throw error;
  } finally {
    client.release();
  }
}; 