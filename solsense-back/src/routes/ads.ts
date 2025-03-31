import express, { RequestHandler, Router } from 'express';
import { updateEarnedRewards } from '../models/portfolio';
import { Pool } from 'pg';

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT || '5432'),
});

const router: Router = express.Router();

const trackInteractionHandler: RequestHandler = async (req, res) => {
  const client = await pool.connect();
  try {
    const { walletAddress } = req.query;
    const { adId } = req.params;

    if (!walletAddress || typeof walletAddress !== 'string') {
      res.status(400).json({ error: 'Invalid wallet address' });
      return;
    }

    // Check if ad exists and has sufficient balance
    const adResult = await client.query(
      'SELECT remaining_balance FROM ads WHERE id = $1',
      [adId]
    );

    if (adResult.rows.length === 0) {
      res.status(404).json({ error: 'Ad not found' });
      return;
    }

    const ad = adResult.rows[0];
    if (ad.remaining_balance < 0.5) {
      res.status(400).json({ error: 'Insufficient ad balance' });
      return;
    }

    // Check if user has already interacted with this ad
    const interactionResult = await client.query(
      'SELECT id FROM ad_interactions WHERE ad_id = $1 AND wallet_address = $2',
      [adId, walletAddress]
    );

    if (interactionResult.rows.length > 0) {
      res.status(400).json({ error: 'You have already interacted with this ad' });
      return;
    }

    // Start transaction
    await client.query('BEGIN');

    // Record the interaction
    await client.query(
      'INSERT INTO ad_interactions (ad_id, wallet_address) VALUES ($1, $2)',
      [adId, walletAddress]
    );

    // Update ad balance
    await client.query(
      'UPDATE ads SET remaining_balance = remaining_balance - $1 WHERE id = $2',
      [0.5, adId]
    );

    // Update user's earned rewards
    await updateEarnedRewards(walletAddress, 0.5);

    // Commit transaction
    await client.query('COMMIT');

    res.json({ success: true });
  } catch (error: any) {
    // Rollback transaction on error
    await client.query('ROLLBACK');
    
    // Check if error is due to unique constraint violation
    if (error.code === '23505') { // Unique violation
      res.status(400).json({ error: 'You have already interacted with this ad' });
    } else {
      console.error('Error tracking interaction:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } finally {
    client.release();
  }
};

router.post('/:adId/interaction', trackInteractionHandler);

export default router; 