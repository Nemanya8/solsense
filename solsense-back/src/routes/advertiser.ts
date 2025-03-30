import express, { RequestHandler, Router } from 'express';
import { registerAdvertiser, loginAdvertiser, getAdvertiserById } from '../models/advertiser';

// Extend Express Request type to include session
declare module 'express-session' {
  interface SessionData {
    advertiserId: number;
    isAuthenticated: boolean;
  }
}

const router: Router = express.Router();

/**
 * @swagger
 * /api/advertiser/register:
 *   post:
 *     summary: Register a new advertiser
 *     tags: [Advertisers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdvertiserRegistration'
 *     responses:
 *       201:
 *         description: Advertiser successfully registered
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdvertiserResponse'
 *       400:
 *         description: Invalid input or email already exists
 */
const registerHandler: RequestHandler = async (req, res) => {
  try {
    const { email, password, name, description } = req.body;

    // Basic validation
    if (!email || !password || !name) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const advertiser = await registerAdvertiser({
      email,
      password,
      name,
      description: description || ''
    });

    res.status(201).json(advertiser);
  } catch (error: any) {
    if (error.code === '23505') { // Unique violation
      res.status(400).json({ error: 'Email already exists' });
    } else {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

/**
 * @swagger
 * /api/advertiser/login:
 *   post:
 *     summary: Login an advertiser
 *     tags: [Advertisers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdvertiserLogin'
 *     responses:
 *       200:
 *         description: Successfully logged in
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdvertiserResponse'
 *       401:
 *         description: Invalid email or password
 */
const loginHandler: RequestHandler = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Missing email or password' });
      return;
    }

    const advertiser = await loginAdvertiser({ email, password });

    if (!advertiser) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    // Set session data
    req.session.advertiserId = advertiser.id;
    req.session.isAuthenticated = true;

    // Save session explicitly
    await new Promise<void>((resolve, reject) => {
      req.session.save((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });

    res.json(advertiser);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @swagger
 * /api/advertiser/profile:
 *   get:
 *     summary: Get current advertiser's profile
 *     tags: [Advertisers]
 *     responses:
 *       200:
 *         description: Successfully retrieved profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdvertiserResponse'
 *       401:
 *         description: Not authenticated
 */
const getProfileHandler: RequestHandler = async (req, res) => {
  try {
    if (!req.session.advertiserId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const advertiser = await getAdvertiserById(req.session.advertiserId);

    if (!advertiser) {
      res.status(404).json({ error: 'Advertiser not found' });
      return;
    }

    res.json(advertiser);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @swagger
 * /api/advertiser/logout:
 *   post:
 *     summary: Logout current advertiser
 *     tags: [Advertisers]
 *     responses:
 *       200:
 *         description: Successfully logged out
 */
const logoutHandler: RequestHandler = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      res.status(500).json({ error: 'Error logging out' });
      return;
    }
    res.json({ message: 'Successfully logged out' });
  });
};

/**
 * @swagger
 * /api/advertiser/{id}:
 *   get:
 *     summary: Get advertiser by ID
 *     tags: [Advertisers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Advertiser ID
 *     responses:
 *       200:
 *         description: Successfully retrieved advertiser
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdvertiserResponse'
 *       404:
 *         description: Advertiser not found
 */
const getAdvertiserHandler: RequestHandler = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid ID format' });
      return;
    }

    const advertiser = await getAdvertiserById(id);

    if (!advertiser) {
      res.status(404).json({ error: 'Advertiser not found' });
      return;
    }

    res.json(advertiser);
  } catch (error) {
    console.error('Get advertiser error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

router.post('/register', registerHandler);
router.post('/login', loginHandler);
router.get('/profile', getProfileHandler);
router.post('/logout', logoutHandler);
router.get('/:id', getAdvertiserHandler);

export default router; 