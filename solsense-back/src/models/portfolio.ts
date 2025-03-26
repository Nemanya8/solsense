import { PortfolioPositionsResponse } from '@stepfinance/step-api-sdk';
import { Pool } from 'pg';

type PortfolioPosition = {
    timestamp: Date;
    positions: PortfolioPositionsResponse;
}

export default PortfolioPosition;

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT || '5432'),
});

export interface PortfolioData {
  id: number;
  wallet_address: string;
  timestamp: number;
  portfolio_data: any;
  tx_history: any;
  created_at: Date;
}

export const createPortfolioTable = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS portfolios (
        id SERIAL PRIMARY KEY,
        wallet_address VARCHAR(255) NOT NULL,
        timestamp BIGINT NOT NULL,
        portfolio_data JSONB NOT NULL,
        tx_history JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_wallet_address ON portfolios(wallet_address);
      CREATE INDEX IF NOT EXISTS idx_timestamp ON portfolios(timestamp);
    `);
    console.log('Portfolio table created successfully');
  } catch (error) {
    console.error('Error creating portfolio table:', error);
    throw error;
  } finally {
    client.release();
  }
};

export const savePortfolioData = async (
  walletAddress: string,
  timestamp: number,
  portfolioData: any,
  txHistory: any
): Promise<PortfolioData> => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `INSERT INTO portfolios (wallet_address, timestamp, portfolio_data, tx_history)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [walletAddress, timestamp, portfolioData, txHistory]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error saving portfolio data:', error);
    throw error;
  } finally {
    client.release();
  }
};

export const getPortfolioData = async (walletAddress: string): Promise<PortfolioData[]> => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT * FROM portfolios 
       WHERE wallet_address = $1 
       ORDER BY timestamp DESC`,
      [walletAddress]
    );
    return result.rows;
  } catch (error) {
    console.error('Error getting portfolio data:', error);
    throw error;
  } finally {
    client.release();
  }
};
