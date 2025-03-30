import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT || '5432'),
});

export interface Advertiser {
  id: number;
  email: string;
  password: string;
  name: string;
  description: string;
  ads: string[];
  created_at: Date;
}

export interface AdvertiserRegistrationData {
  email: string;
  password: string;
  name: string;
  description: string;
}

export interface AdvertiserLoginData {
  email: string;
  password: string;
}

export interface AdvertiserResponse {
  id: number;
  email: string;
  name: string;
  description: string;
  ads: string[];
  created_at: Date;
}

export const createAdvertiserTable = async () => {
  const client = await pool.connect();
  try {
    // Drop the table if it exists
    await client.query(`
      DROP TABLE IF EXISTS advertisers CASCADE
    `);

    // Create the table
    await client.query(`
      CREATE TABLE advertisers (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        ads TEXT[] DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create the index
    await client.query(`
      CREATE INDEX idx_advertiser_email ON advertisers(email)
    `);

    console.log('Advertiser table created successfully');
  } catch (error) {
    console.error('Error creating advertiser table:', error);
    throw error;
  } finally {
    client.release();
  }
};

export const registerAdvertiser = async (data: AdvertiserRegistrationData): Promise<AdvertiserResponse> => {
  const client = await pool.connect();
  try {
    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(data.password, saltRounds);

    const result = await client.query(
      `INSERT INTO advertisers (email, password, name, description)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, name, description, ads, created_at`,
      [data.email, hashedPassword, data.name, data.description]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error registering advertiser:', error);
    throw error;
  } finally {
    client.release();
  }
};

export const loginAdvertiser = async (data: AdvertiserLoginData): Promise<AdvertiserResponse | null> => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT * FROM advertisers WHERE email = $1`,
      [data.email]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const advertiser = result.rows[0];
    const validPassword = await bcrypt.compare(data.password, advertiser.password);

    if (!validPassword) {
      return null;
    }

    // Return advertiser data without password
    return {
      id: advertiser.id,
      email: advertiser.email,
      name: advertiser.name,
      description: advertiser.description,
      ads: advertiser.ads,
      created_at: advertiser.created_at
    };
  } catch (error) {
    console.error('Error logging in advertiser:', error);
    throw error;
  } finally {
    client.release();
  }
};

export const getAdvertiserById = async (id: number): Promise<AdvertiserResponse | null> => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT id, email, name, description, ads, created_at 
       FROM advertisers 
       WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  } catch (error) {
    console.error('Error getting advertiser:', error);
    throw error;
  } finally {
    client.release();
  }
}; 