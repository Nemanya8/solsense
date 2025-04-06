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
    // Get the interaction amount from the request body, default to 0.5 if not provided
    const interactionAmount = parseFloat(req.body.amount) || 0.5;

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
    
    // Ensure we never reduce balance below zero
    const finalAmount = Math.min(interactionAmount, ad.remaining_balance);
    
    if (finalAmount <= 0) {
      res.status(400).json({ error: 'Ad has no remaining balance' });
      return;
    }

    // Check if user has already interacted with this ad
    const interactionResult = await client.query(
      'SELECT id FROM ad_interactions WHERE ad_id = $1 AND wallet_address = $2',
      [adId, walletAddress]
    );

    if (interactionResult.rows.length > 0) {
      // User has already interacted with this ad - don't decrease balance or reward again
      res.status(200).json({ success: true, message: 'Interaction already recorded', alreadyInteracted: true });
      return;
    }

    // Start transaction
    await client.query('BEGIN');

    // Record the interaction
    await client.query(
      'INSERT INTO ad_interactions (ad_id, wallet_address, amount) VALUES ($1, $2, $3)',
      [adId, walletAddress, finalAmount]
    );

    // Update ad balance - only for unique interactions
    await client.query(
      'UPDATE ads SET remaining_balance = remaining_balance - $1, interactions = interactions + 1 WHERE id = $2',
      [finalAmount, adId]
    );

    // Update user's earned rewards - only for unique interactions
    await updateEarnedRewards(walletAddress, finalAmount);

    // Commit transaction
    await client.query('COMMIT');

    res.json({ success: true, amount: finalAmount });
  } catch (error: any) {
    // Rollback transaction on error
    await client.query('ROLLBACK');
    
    // Check if error is due to unique constraint violation
    if (error.code === '23505') { // Unique violation
      res.status(200).json({ success: true, message: 'Interaction already recorded', alreadyInteracted: true });
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