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
  content_type: string;
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
  content_type: string;
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
        amount DECIMAL(20, 8) NOT NULL DEFAULT 0.5,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(ad_id, wallet_address)
      );
      
      CREATE INDEX IF NOT EXISTS idx_ad_interactions_ad_id ON ad_interactions(ad_id);
      CREATE INDEX IF NOT EXISTS idx_ad_interactions_wallet ON ad_interactions(wallet_address);
    `);
    console.log('Ad interactions table created successfully');
  } catch (error) {
    console.error('Error creating ad interactions table:', error);
    throw error;
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
        content_type VARCHAR(10) NOT NULL DEFAULT 'text',
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
    let result;
    try {
      // First try with content_type
      result = await client.query(
        `INSERT INTO ads (
          advertiser_id, name, short_description, body, 
          content_type, total_balance, remaining_balance, desired_profile,
          impressions, interactions, created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $6, $7, 0, 0, NOW(), NOW())
        RETURNING *`,
        [
          data.advertiser_id,
          data.name,
          data.short_description,
          data.body,
          data.content_type,
          data.total_balance,
          JSON.stringify(data.desired_profile)
        ]
      );
    } catch (err: any) {
      // If content_type column doesn't exist yet, try without it
      if (err.code === '42703' && err.message.includes('column "content_type" of relation "ads" does not exist')) {
        console.warn('content_type column not found, using fallback query');
        result = await client.query(
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
      } else {
        throw err;
      }
    }
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
    const result = await client.query('SELECT * FROM ads WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return null;
    }
    
    // Ensure the ad has a content_type property
    const ad = result.rows[0];
    if (!ad.content_type) {
      ad.content_type = 'text'; // Default to text if not specified
    }
    
    return {
      ...ad,
      total_balance: parseFloat(ad.total_balance),
      remaining_balance: parseFloat(ad.remaining_balance)
    };
  } catch (error) {
    console.error('Error getting ad by ID:', error);
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
    return result.rows.map(ad => ({
      ...ad,
      content_type: ad.content_type || 'text', // Default to text if not specified
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
    // First, get the current balance
    const currentBalanceResult = await client.query(
      `SELECT remaining_balance FROM ads WHERE id = $1`,
      [id]
    );
    
    if (currentBalanceResult.rows.length === 0) {
      throw new Error(`Ad with id ${id} not found`);
    }
    
    const currentBalance = parseFloat(currentBalanceResult.rows[0].remaining_balance);
    // Calculate the deduction amount, ensuring we never go below zero
    const deductionAmount = Math.min(amount, currentBalance);
    
    // Only update if there's something to deduct
    if (deductionAmount <= 0) {
      const adResult = await client.query(
        `SELECT * FROM ads WHERE id = $1`,
        [id]
      );
      return adResult.rows[0];
    }
    
    const result = await client.query(
      `UPDATE ads 
       SET remaining_balance = GREATEST(0, remaining_balance - $1),
           updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [deductionAmount, id]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error updating ad balance:', error);
    throw error;
  } finally {
    client.release();
  }
}; 