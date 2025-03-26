import express, { Request, Response, Router } from 'express';
import { StepAPIClient } from '@stepfinance/step-api-sdk';
import axios from 'axios';
import { savePortfolioData, getPortfolioData } from '../models/portfolio';

const router: Router = express.Router();
const client = new StepAPIClient(process.env.STEP_API_KEY || '');

/**
 * @swagger
 * /api/portfolios/{address}:
 *   get:
 *     summary: Get latest portfolio information for a specific wallet address
 *     description: Retrieves the most recent portfolio data for a given Solana wallet address
 *     tags: [Portfolios]
 *     parameters:
 *       - in: path
 *         name: address
 *         required: true
 *         schema:
 *           type: string
 *         description: The Solana wallet address
 *     responses:
 *       200:
 *         description: Successfully retrieved latest portfolio data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PortfolioData'
 *       404:
 *         description: No portfolio data found for the address
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: No portfolio data found for this address
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.get('/portfolios/:address', async (req: Request, res: Response): Promise<void> => {
  try {
    const { address } = req.params;
    const portfolioHistory = await getPortfolioData(address);
    if (!portfolioHistory || portfolioHistory.length === 0) {
      res.status(404).json({ error: 'No portfolio data found for this address' });
      return;
    }

    // Return only the latest portfolio data
    res.status(200).json(portfolioHistory[0]);
  } catch (error) {
    console.error('Error fetching portfolio data:', error);
    res.status(500).json({ error: 'Failed to fetch portfolio data' });
  }
});

/**
 * @swagger
 * /api/portfolios/{address}:
 *   post:
 *     summary: Update portfolio data for a specific wallet address
 *     description: Fetches and saves the latest portfolio data and transaction history for a given Solana wallet address
 *     tags: [Portfolios]
 *     parameters:
 *       - in: path
 *         name: address
 *         required: true
 *         schema:
 *           type: string
 *         description: The Solana wallet address
 *     responses:
 *       200:
 *         description: Successfully updated portfolio data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Portfolio saved successfully
 *                 data:
 *                   $ref: '#/components/schemas/PortfolioData'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.post('/portfolios/:address', async (req: Request, res: Response): Promise<void> => {
  try {
    const { address } = req.params;
    const modules = 'token,lending,farm,liquidity';

    // Fetch portfolio data from Step Finance
    const portfolioData = await client.getPortfolioData(address, { modules });

    // Fetch transaction history from Helius
    const txHistoryResponse = await axios.post(
      `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`,
      {
        jsonrpc: '2.0',
        id: "1",
        method: "getSignaturesForAddress",
        params: [address]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    const timestamp = Date.now();
    const savedData = await savePortfolioData(
      address,
      timestamp,
      portfolioData,
      txHistoryResponse.data
    );

    res.status(200).json({ 
      message: 'Portfolio saved successfully', 
      data: savedData 
    });
  } catch (error) {
    console.error('Error saving portfolio position:', error);
    res.status(500).json({ error: 'Failed to save portfolio position' });
  }
});

export default router;
