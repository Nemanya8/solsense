import express, { RequestHandler, Router } from 'express';
import { createAd, getAdById, getAdsByAdvertiserId, updateAdStats, updateAdRemainingBalance } from '../models/ad';
import { CreateAdData } from '../models/ad';
import { getPortfolioData } from '../models/portfolio';
import { pool } from '../db';
import { authenticateJWT, AuthRequest } from '../middleware/auth';

const router: Router = express.Router();

interface DailyStat {
  date: string;
  impressions: number;
  interactions: number;
}

/**
 * @swagger
 * /api/ads:
 *   post:
 *     summary: Create a new ad
 *     tags: [Ads]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - short_description
 *               - body
 *               - total_balance
 *               - desired_profile
 *             properties:
 *               name:
 *                 type: string
 *               short_description:
 *                 type: string
 *               body:
 *                 type: string
 *               total_balance:
 *                 type: number
 *               desired_profile:
 *                 type: object
 *                 properties:
 *                   whale:
 *                     type: number
 *                   hodler:
 *                     type: number
 *                   flipper:
 *                     type: number
 *                   defi_user:
 *                     type: number
 *                   experienced:
 *                     type: number
 */
const createAdHandler: RequestHandler = async (req: AuthRequest, res) => {
  try {
    if (!req.advertiserId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const adData: CreateAdData = {
      advertiser_id: req.advertiserId,
      name: req.body.name,
      short_description: req.body.short_description,
      body: req.body.body,
      total_balance: req.body.total_balance,
      desired_profile: req.body.desired_profile
    };

    const ad = await createAd(adData);
    res.status(201).json(ad);
  } catch (error) {
    console.error('Create ad error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @swagger
 * /api/ads:
 *   get:
 *     summary: Get all ads for the current advertiser
 *     tags: [Ads]
 *     responses:
 *       200:
 *         description: List of ads
 *       401:
 *         description: Not authenticated
 */
const getAdsHandler: RequestHandler = async (req: AuthRequest, res) => {
  try {
    if (!req.advertiserId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const ads = await getAdsByAdvertiserId(req.advertiserId);
    res.json(ads);
  } catch (error) {
    console.error('Get ads error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @swagger
 * /api/ads/analytics:
 *   get:
 *     summary: Get analytics data for advertiser's ads
 *     tags: [Ads]
 *     responses:
 *       200:
 *         description: Analytics data including total stats, daily stats, top ads, and user profile distribution
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
const getAnalyticsHandler: RequestHandler = async (req: AuthRequest, res) => {
  let client;
  try {
    if (!req.advertiserId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    client = await pool.connect();
    console.log('Connected to database');

    // First check if tables exist
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      AND table_name IN ('advertisers', 'ads', 'ad_impressions', 'ad_interactions', 'portfolios')
    `);
    
    console.log('Existing tables:', tables.rows.map(r => r.table_name));
    const existingTables = tables.rows.map(r => r.table_name);

    // Verify advertiser exists
    const advertiser = await client.query(
      'SELECT id FROM advertisers WHERE id = $1',
      [req.advertiserId]
    );

    if (advertiser.rows.length === 0) {
      console.log(`Advertiser with ID ${req.advertiserId} not found, returning empty response`);
      const emptyResponse = {
        totalStats: {
          total_impressions: 0,
          total_interactions: 0,
          total_remaining_balance: 0,
          total_balance: 0
        },
        dailyStats: [],
        topAds: [],
        profileDistribution: {
          avg_whale: 0,
          avg_hodler: 0,
          avg_flipper: 0,
          avg_defi_user: 0,
          avg_experienced: 0
        }
      };
      res.json(emptyResponse);
      return;
    }

    console.log(`Found advertiser with ID ${req.advertiserId}`);

    // Get total impressions and interactions
    const totalStats = await client.query(`
      SELECT 
        COALESCE(SUM(impressions), 0) as total_impressions,
        COALESCE(SUM(interactions), 0) as total_interactions,
        COALESCE(SUM(remaining_balance), 0) as total_remaining_balance,
        COALESCE(SUM(total_balance), 0) as total_balance
      FROM ads
      WHERE advertiser_id = $1
    `, [req.advertiserId]);
    console.log('Total stats query result:', totalStats.rows[0]);

    // Initialize empty daily stats
    let dailyStats = { rows: [] as DailyStat[] };
    if (existingTables.includes('ad_impressions') && existingTables.includes('ad_interactions')) {
      try {
        dailyStats = await client.query(`
          WITH RECURSIVE dates AS (
            SELECT generate_series(
              CURRENT_DATE - INTERVAL '30 days',
              CURRENT_DATE,
              '1 day'::interval
            )::date AS date
          ),
          daily_impressions AS (
            SELECT 
              DATE(created_at) as date,
              COUNT(*) as impressions
            FROM ad_impressions
            WHERE ad_id IN (SELECT id FROM ads WHERE advertiser_id = $1)
            AND created_at >= CURRENT_DATE - INTERVAL '30 days'
            GROUP BY DATE(created_at)
          ),
          daily_interactions AS (
            SELECT 
              DATE(created_at) as date,
              COUNT(*) as interactions
            FROM ad_interactions
            WHERE ad_id IN (SELECT id FROM ads WHERE advertiser_id = $1)
            AND created_at >= CURRENT_DATE - INTERVAL '30 days'
            GROUP BY DATE(created_at)
          )
          SELECT 
            d.date,
            COALESCE(di.impressions, 0) as impressions,
            COALESCE(din.interactions, 0) as interactions
          FROM dates d
          LEFT JOIN daily_impressions di ON d.date = di.date
          LEFT JOIN daily_interactions din ON d.date = din.date
          ORDER BY d.date
        `, [req.advertiserId]);
      } catch (error) {
        console.error('Error fetching daily stats:', error);
      }
    }

    // Get top performing ads
    const topAds = await client.query(`
      SELECT 
        id,
        name,
        impressions,
        interactions,
        remaining_balance,
        total_balance,
        CASE 
          WHEN impressions > 0 THEN (interactions::float / impressions) * 100
          ELSE 0
        END as interaction_rate
      FROM ads
      WHERE advertiser_id = $1
      ORDER BY impressions DESC
      LIMIT 5
    `, [req.advertiserId]);

    // Get user profile distribution
    const profileDistribution = await client.query(`
      SELECT 
        COALESCE(AVG((desired_profile->>'whale')::numeric), 0) as avg_whale,
        COALESCE(AVG((desired_profile->>'hodler')::numeric), 0) as avg_hodler,
        COALESCE(AVG((desired_profile->>'flipper')::numeric), 0) as avg_flipper,
        COALESCE(AVG((desired_profile->>'defi_user')::numeric), 0) as avg_defi_user,
        COALESCE(AVG((desired_profile->>'experienced')::numeric), 0) as avg_experienced
      FROM ads
      WHERE advertiser_id = $1
    `, [req.advertiserId]);

    const response = {
      totalStats: {
        total_impressions: parseInt(totalStats.rows[0].total_impressions) || 0,
        total_interactions: parseInt(totalStats.rows[0].total_interactions) || 0,
        total_remaining_balance: parseFloat(totalStats.rows[0].total_remaining_balance) || 0,
        total_balance: parseFloat(totalStats.rows[0].total_balance) || 0
      },
      dailyStats: dailyStats.rows.map(stat => ({
        date: stat.date,
        impressions: parseInt(stat.impressions.toString()) || 0,
        interactions: parseInt(stat.interactions.toString()) || 0
      })),
      topAds: topAds.rows.map(ad => ({
        ...ad,
        impressions: parseInt(ad.impressions.toString()) || 0,
        interactions: parseInt(ad.interactions.toString()) || 0,
        remaining_balance: parseFloat(ad.remaining_balance.toString()) || 0,
        total_balance: parseFloat(ad.total_balance.toString()) || 0,
        interaction_rate: parseFloat(ad.interaction_rate.toString()) || 0
      })),
      profileDistribution: {
        avg_whale: parseFloat(profileDistribution.rows[0].avg_whale.toString()) || 0,
        avg_hodler: parseFloat(profileDistribution.rows[0].avg_hodler.toString()) || 0,
        avg_flipper: parseFloat(profileDistribution.rows[0].avg_flipper.toString()) || 0,
        avg_defi_user: parseFloat(profileDistribution.rows[0].avg_defi_user.toString()) || 0,
        avg_experienced: parseFloat(profileDistribution.rows[0].avg_experienced.toString()) || 0
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    if (client) {
      client.release();
    }
  }
};

/**
 * @swagger
 * /api/ads/matching:
 *   get:
 *     summary: Get matching ads based on user's profile ratings
 *     tags: [Ads]
 *     parameters:
 *       - in: query
 *         name: walletAddress
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of matching ads
 *       400:
 *         description: Wallet address is required
 */
const getMatchingAdsHandler: RequestHandler = async (req, res) => {
  try {
    const walletAddress = req.query.walletAddress as string;
    if (!walletAddress) {
      res.status(400).json({ error: 'Wallet address is required' });
      return;
    }

    // Get user's portfolio data to get their profile ratings
    const portfolioDataArray = await getPortfolioData(walletAddress);
    if (!portfolioDataArray || portfolioDataArray.length === 0) {
      res.status(404).json({ error: 'Portfolio data not found' });
      return;
    }

    const userRatings = portfolioDataArray[0].profile_ratings;

    // Get all ads
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT a.*, adv.name as advertiser_name
        FROM ads a
        JOIN advertisers adv ON a.advertiser_id = adv.id
        WHERE (
          (a.desired_profile->>'whale')::numeric BETWEEN $1 AND $2 OR
          (a.desired_profile->>'hodler')::numeric BETWEEN $3 AND $4 OR
          (a.desired_profile->>'flipper')::numeric BETWEEN $5 AND $6 OR
          (a.desired_profile->>'defi_user')::numeric BETWEEN $7 AND $8 OR
          (a.desired_profile->>'experienced')::numeric BETWEEN $9 AND $10
        )
        AND a.remaining_balance > 0
        ORDER BY a.created_at DESC
      `, [
        userRatings.whale - 10, userRatings.whale + 10,
        userRatings.hodler - 10, userRatings.hodler + 10,
        userRatings.flipper - 10, userRatings.flipper + 10,
        userRatings.defi_user - 10, userRatings.defi_user + 10,
        userRatings.experienced - 10, userRatings.experienced + 10
      ]);

      // Parse decimal values to numbers
      const ads = result.rows.map((ad: any) => ({
        ...ad,
        total_balance: parseFloat(ad.total_balance),
        remaining_balance: parseFloat(ad.remaining_balance)
      }));

      res.json(ads);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error getting matching ads:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @swagger
 * /api/ads/{id}:
 *   get:
 *     summary: Get ad by ID
 *     tags: [Ads]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
const getAdHandler: RequestHandler = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid ID format' });
      return;
    }

    const ad = await getAdById(id);
    if (!ad) {
      res.status(404).json({ error: 'Ad not found' });
      return;
    }

    res.json(ad);
  } catch (error) {
    console.error('Get ad error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @swagger
 * /api/ads/{id}/stats:
 *   post:
 *     summary: Update ad statistics
 *     tags: [Ads]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               impressions:
 *                 type: number
 *               interactions:
 *                 type: number
 */
const updateStatsHandler: RequestHandler = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid ID format' });
      return;
    }

    const { impressions, interactions } = req.body;
    const ad = await updateAdStats(id, impressions, interactions);
    res.json(ad);
  } catch (error) {
    console.error('Update stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @swagger
 * /api/ads/{id}/balance:
 *   post:
 *     summary: Update ad remaining balance
 *     tags: [Ads]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 */
const updateBalanceHandler: RequestHandler = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid ID format' });
      return;
    }

    const { amount } = req.body;
    if (typeof amount !== 'number') {
      res.status(400).json({ error: 'Amount must be a number' });
      return;
    }

    const ad = await updateAdRemainingBalance(id, amount);
    if (!ad) {
      res.status(400).json({ error: 'Insufficient balance' });
      return;
    }

    res.json(ad);
  } catch (error) {
    console.error('Update balance error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @swagger
 * /api/ads/{id}/impression:
 *   post:
 *     summary: Track an impression for an ad
 *     tags: [Ads]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Impression tracked successfully
 *       404:
 *         description: Ad not found
 */
const trackImpressionHandler: RequestHandler = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const walletAddress = req.query.walletAddress as string;

    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid ID format' });
      return;
    }

    if (!walletAddress) {
      res.status(400).json({ error: 'Wallet address is required' });
      return;
    }

    const client = await pool.connect();
    try {
      // Start a transaction
      await client.query('BEGIN');

      // Check if this user has already viewed this ad
      const existingImpression = await client.query(
        'SELECT id FROM ad_impressions WHERE ad_id = $1 AND wallet_address = $2',
        [id, walletAddress]
      );

      if (existingImpression.rows.length === 0) {
        // Insert new impression
        await client.query(
          'INSERT INTO ad_impressions (ad_id, wallet_address) VALUES ($1, $2)',
          [id, walletAddress]
        );

        // Update total impressions count
        await client.query(
          'UPDATE ads SET impressions = impressions + 1 WHERE id = $1',
          [id]
        );
      }

      // Commit the transaction
      await client.query('COMMIT');
      res.status(200).json({ message: 'Impression tracked successfully' });
    } catch (error) {
      // Rollback the transaction on error
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error tracking impression:', error);
    res.status(500).json({ error: 'Failed to track impression' });
  }
};

/**
 * @swagger
 * /api/ads/{id}/interaction:
 *   post:
 *     summary: Track an interaction for an ad
 *     tags: [Ads]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Interaction tracked successfully
 *       404:
 *         description: Ad not found
 */
const trackInteractionHandler: RequestHandler = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const walletAddress = req.query.walletAddress as string;

    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid ID format' });
      return;
    }

    if (!walletAddress) {
      res.status(400).json({ error: 'Wallet address is required' });
      return;
    }

    const client = await pool.connect();
    try {
      // Start a transaction
      await client.query('BEGIN');

      // Check if this user has already interacted with this ad
      const existingInteraction = await client.query(
        'SELECT id FROM ad_interactions WHERE ad_id = $1 AND wallet_address = $2',
        [id, walletAddress]
      );

      if (existingInteraction.rows.length === 0) {
        // Insert new interaction
        await client.query(
          'INSERT INTO ad_interactions (ad_id, wallet_address) VALUES ($1, $2)',
          [id, walletAddress]
        );

        // Update total interactions count
        await client.query(
          'UPDATE ads SET interactions = interactions + 1 WHERE id = $1',
          [id]
        );
      }

      await client.query('COMMIT');
      res.status(200).json({ message: 'Interaction tracked successfully' });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error tracking interaction:', error);
    res.status(500).json({ error: 'Failed to track interaction' });
  }
};

// Define routes in correct order (specific routes before parameterized routes)
router.post('/', authenticateJWT, createAdHandler);
router.get('/', authenticateJWT, getAdsHandler);
router.get('/analytics', authenticateJWT, getAnalyticsHandler);
router.get('/matching', getMatchingAdsHandler);

// Parameterized routes should come after specific routes
router.get('/:id', getAdHandler);
router.post('/:id/stats', authenticateJWT, updateStatsHandler);
router.post('/:id/balance', authenticateJWT, updateBalanceHandler);
router.post('/:id/impression', trackImpressionHandler);
router.post('/:id/interaction', trackInteractionHandler);

export default router; 