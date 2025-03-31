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

export interface ProfileRatings {
  whale: number;
  hodler: number;
  flipper: number;
  defi_user: number;
  experienced: number;
}

export interface PortfolioData {
  id: number;
  wallet_address: string;
  timestamp: string;
  portfolio_data: {
    status: string;
    wallet: string;
    summary: {
      statuses: {
        [key: string]: {
          [key: string]: {
            asOf: number;
            error: string | null;
            duration: number;
          }
        }
      };
      positions: {
        farm: {
          totalValue: number;
          estimated24hReward: number;
          totalPendingReward: number;
        };
        token: {
          spot: {
            totalValue: number;
          };
          yield: {
            totalValue: number;
            estimated24hReward: number;
          };
        };
        lending: {
          nftPosition: {
            totalValue: number;
          };
          tokenPosition: {
            totalValue: number;
            estimated24hReward: number;
          };
          leverageFarmPosition: {
            totalValue: number;
          };
        };
        liquidity: {
          amm: {
            totalValue: number;
            estimated24hReward: number;
          };
          clmm: {
            totalValue: number;
            estimated24hReward: number;
            totalPendingReward: number;
          };
        };
      };
      staleJobs: string[];
      aggregated: {
        netWorth: number;
        nftValue: number;
        defiValue: number;
        tokenValue: number;
        nftDefiValue: number;
        estimated24hReward: number;
        totalPendingReward: number;
      };
    };
    positions: {
      farm: any[];
      token: {
        spot: any[];
        yield: any[];
      };
      lending: {
        nftPosition: any[];
        tokenPosition: any[];
        leverageFarmPosition: any[];
      };
      liquidity: {
        amm: any[];
        clmm: any[];
      };
    };
  };
  tx_history: {
    id: string;
    result: {
      err: any;
      memo: string | null;
      slot: number;
      blockTime: number;
      signature: string;
      confirmationStatus: string;
    }[];
    jsonrpc: string;
  };
  transaction_volume: number[];
  profile_ratings: ProfileRatings;
  earned_rewards: number;
  created_at: string;
}

const calculateMonthlyVolume = (txHistory: any): number[] => {
  const now = new Date();
  const monthlyVolumes = new Array(12).fill(0);
  
  // Get transactions from the last 12 months
  const last12Months = txHistory.result.filter((tx: any) => {
    const txDate = new Date(tx.blockTime * 1000);
    const monthsAgo = (now.getFullYear() - txDate.getFullYear()) * 12 + 
                     (now.getMonth() - txDate.getMonth());
    return monthsAgo >= 0 && monthsAgo < 12;
  });

  // Calculate volume for each month
  last12Months.forEach((tx: any) => {
    const txDate = new Date(tx.blockTime * 1000);
    const monthsAgo = (now.getFullYear() - txDate.getFullYear()) * 12 + 
                     (now.getMonth() - txDate.getMonth());
    if (monthsAgo >= 0 && monthsAgo < 12) {
      monthlyVolumes[monthsAgo]++;
    }
  });

  // Return data in reverse order (newest to oldest)
  return monthlyVolumes.reverse();
};

const calculateScores = (data: any): ProfileRatings => {
  // Extract basic portfolio metrics
  const netWorth = data.portfolio_data.summary.aggregated.netWorth;
  const defiValue = data.portfolio_data.summary.aggregated.defiValue;
  const tokenValue = data.portfolio_data.summary.aggregated.tokenValue;
  
  // Calculate transaction metrics
  const lendingDurations = Object.values(data.portfolio_data.summary.statuses.lending)
    .map((x: any) => x.duration);
  const totalTransactions = lendingDurations.reduce((a: number, b: number) => a + b, 0);
  const monthlyAvgTransactions = totalTransactions / 12;
  
  // Calculate DeFi participation metrics
  const defiPlatforms = data.portfolio_data.positions.lending.tokenPosition.length +
                       data.portfolio_data.positions.liquidity.clmm.length +
                       data.portfolio_data.positions.liquidity.amm.length;
  
  // Calculate yield metrics
  const totalYield = [
    ...data.portfolio_data.positions.lending.tokenPosition,
    ...data.portfolio_data.positions.liquidity.clmm
  ].reduce((sum: number, pos: any) => sum + (pos.apr || 0), 0);
  const avgYield = totalYield / Math.max(1, defiPlatforms);
  
  // Calculate portfolio diversity
  const tokenHoldings = data.portfolio_data.positions.token.spot.length;
  const uniquePlatforms = new Set([
    ...data.portfolio_data.positions.lending.tokenPosition,
    ...data.portfolio_data.positions.liquidity.clmm
  ].map((pos: any) => pos.platform?.title || '')).size;
  
  // Enhanced scoring system
  const whaleScore = Math.min(100, (netWorth / 100) * 10);
  
  // DeFi score now considers both value and platform diversity
  const defiValueRatio = (defiValue / netWorth) * 100 || 0;
  const platformDiversity = Math.min(100, (uniquePlatforms / 5) * 100);
  const defiScore = Math.min(100, (defiValueRatio * 0.7 + platformDiversity * 0.3));
  
  // HODLer score considers both token value and diversity
  const hodlValueRatio = (tokenValue / netWorth) * 100 || 0;
  const tokenDiversity = Math.min(100, (tokenHoldings / 5) * 100);
  const hodlerScore = Math.min(100, (hodlValueRatio * 0.7 + tokenDiversity * 0.3));
  
  // Flipper score considers transaction frequency and yield
  const transactionScore = Math.min(100, monthlyAvgTransactions / 10);
  const yieldScore = Math.min(100, avgYield / 20);
  const flipperScore = Math.min(100, (transactionScore * 0.6 + yieldScore * 0.4));
  
  // Experience score considers both transaction volume and platform diversity
  const transactionVolume = Math.min(100, totalTransactions / 1000);
  const experienceScore = Math.min(100, (transactionVolume * 0.6 + platformDiversity * 0.4));
  
  return {
    whale: whaleScore,
    defi_user: defiScore,
    hodler: hodlerScore,
    flipper: flipperScore,
    experienced: experienceScore
  };
};

export const createPortfolioTable = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS portfolios (
        id SERIAL PRIMARY KEY,
        wallet_address VARCHAR(255) NOT NULL,
        timestamp VARCHAR(255) NOT NULL,
        portfolio_data JSONB NOT NULL,
        tx_history JSONB NOT NULL,
        transaction_volume INTEGER[] NOT NULL,
        profile_ratings JSONB NOT NULL,
        earned_rewards DOUBLE PRECISION NOT NULL DEFAULT 0,
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
    const monthlyVolume = calculateMonthlyVolume(txHistory);
    const profileRatings = calculateScores({ portfolio_data: portfolioData });
    
    const result = await client.query(
      `INSERT INTO portfolios (wallet_address, timestamp, portfolio_data, tx_history, transaction_volume, profile_ratings, earned_rewards)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [walletAddress, timestamp.toString(), portfolioData, txHistory, monthlyVolume, profileRatings, 0]
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

export const updateEarnedRewards = async (walletAddress: string, amount: number): Promise<void> => {
  const client = await pool.connect();
  try {
    await client.query(
      `UPDATE portfolios 
       SET earned_rewards = earned_rewards + $1
       WHERE wallet_address = $2
       AND id = (
         SELECT id FROM portfolios 
         WHERE wallet_address = $2 
         ORDER BY timestamp DESC 
         LIMIT 1
       )`,
      [amount, walletAddress]
    );
  } catch (error) {
    console.error('Error updating earned rewards:', error);
    throw error;
  } finally {
    client.release();
  }
};
