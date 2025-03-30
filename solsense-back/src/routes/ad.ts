import express, { RequestHandler, Router } from 'express';
import { createAd, getAdById, getAdsByAdvertiserId, updateAdStats, updateAdRemainingBalance } from '../models/ad';
import { CreateAdData } from '../models/ad';

const router: Router = express.Router();

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
const createAdHandler: RequestHandler = async (req, res) => {
  try {
    if (!req.session.advertiserId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const adData: CreateAdData = {
      advertiser_id: req.session.advertiserId,
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
const getAdsHandler: RequestHandler = async (req, res) => {
  try {
    if (!req.session.advertiserId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const ads = await getAdsByAdvertiserId(req.session.advertiserId);
    res.json(ads);
  } catch (error) {
    console.error('Get ads error:', error);
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

router.post('/', createAdHandler);
router.get('/', getAdsHandler);
router.get('/:id', getAdHandler);
router.post('/:id/stats', updateStatsHandler);
router.post('/:id/balance', updateBalanceHandler);

export default router; 