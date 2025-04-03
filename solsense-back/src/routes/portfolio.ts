import express, { Request, Response, Router } from 'express';
import { StepAPIClient } from '@stepfinance/step-api-sdk';
import axios from 'axios';
import { savePortfolioData, getPortfolioData } from '../models/portfolio';

const router: Router = express.Router();
const client = new StepAPIClient(process.env.STEP_API_KEY || '');

interface HeliusTransaction {
  description: string;
  type: string;
  source: string;
  fee: number;
  feePayer: string;
  signature: string;
  slot: number;
  timestamp: number;
  nativeTransfers: {
    fromUserAccount: string;
    toUserAccount: string;
    amount: number;
  }[];
  tokenTransfers: {
    fromUserAccount: string;
    toUserAccount: string;
    fromTokenAccount: string;
    toTokenAccount: string;
    tokenAmount: number;
    mint: string;
  }[];
  accountData: {
    account: string;
    nativeBalanceChange: number;
    tokenBalanceChanges: {
      userAccount: string;
      tokenAccount: string;
      mint: string;
      rawTokenAmount: {
        tokenAmount: string;
        decimals: number;
      };
    }[];
  }[];
  transactionError?: {
    error: string;
  };
  instructions: {
    accounts: string[];
    data: string;
    programId: string;
    innerInstructions: {
      accounts: string[];
      data: string;
      programId: string;
    }[];
  }[];
  events?: {
    nft?: {
      description: string;
      type: string;
      source: string;
      amount: number;
      fee: number;
      feePayer: string;
      signature: string;
      slot: number;
      timestamp: number;
      saleType?: string;
      buyer?: string;
      seller?: string;
      staker?: string;
      nfts: {
        mint: string;
        tokenStandard: string;
      }[];
    };
    swap?: {
      nativeInput: {
        account: string;
        amount: string;
      };
      nativeOutput: {
        account: string;
        amount: string;
      };
      tokenInputs: {
        userAccount: string;
        tokenAccount: string;
        mint: string;
        rawTokenAmount: {
          tokenAmount: string;
          decimals: number;
        };
      }[];
      tokenOutputs: {
        userAccount: string;
        tokenAccount: string;
        mint: string;
        rawTokenAmount: {
          tokenAmount: string;
          decimals: number;
        };
      }[];
      tokenFees: {
        userAccount: string;
        tokenAccount: string;
        mint: string;
        rawTokenAmount: {
          tokenAmount: string;
          decimals: number;
        };
      }[];
      nativeFees: {
        account: string;
        amount: string;
      }[];
      innerSwaps: {
        tokenInputs: {
          fromUserAccount: string;
          toUserAccount: string;
          fromTokenAccount: string;
          toTokenAccount: string;
          tokenAmount: number;
          mint: string;
        }[];
        tokenOutputs: {
          fromUserAccount: string;
          toUserAccount: string;
          fromTokenAccount: string;
          toTokenAccount: string;
          tokenAmount: number;
          mint: string;
        }[];
        tokenFees: {
          fromUserAccount: string;
          toUserAccount: string;
          fromTokenAccount: string;
          toTokenAccount: string;
          tokenAmount: number;
          mint: string;
        }[];
        nativeFees: {
          fromUserAccount: string;
          toUserAccount: string;
          amount: number;
        }[];
        programInfo: {
          source: string;
          account: string;
          programName: string;
          instructionName: string;
        };
      }[];
    };
  };
}

/**
 * @swagger
 * components:
 *   schemas:
 *     HeliusTransaction:
 *       type: object
 *       properties:
 *         description:
 *           type: string
 *           description: Human-readable description of the transaction
 *         type:
 *           type: string
 *           description: Type of transaction
 *         source:
 *           type: string
 *           description: Source of the transaction
 *         fee:
 *           type: number
 *           description: Transaction fee in SOL
 *         feePayer:
 *           type: string
 *           description: Address of the fee payer
 *         signature:
 *           type: string
 *           description: Transaction signature
 *         slot:
 *           type: number
 *           description: Slot number
 *         timestamp:
 *           type: number
 *           description: Unix timestamp
 *         nativeTransfers:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               fromUserAccount:
 *                 type: string
 *               toUserAccount:
 *                 type: string
 *               amount:
 *                 type: number
 *         tokenTransfers:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               fromUserAccount:
 *                 type: string
 *               toUserAccount:
 *                 type: string
 *               fromTokenAccount:
 *                 type: string
 *               toTokenAccount:
 *                 type: string
 *               tokenAmount:
 *                 type: number
 *               mint:
 *                 type: string
 *         accountData:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               account:
 *                 type: string
 *               nativeBalanceChange:
 *                 type: number
 *               tokenBalanceChanges:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     userAccount:
 *                       type: string
 *                     tokenAccount:
 *                       type: string
 *                     mint:
 *                       type: string
 *                     rawTokenAmount:
 *                       type: object
 *                       properties:
 *                         tokenAmount:
 *                           type: string
 *                         decimals:
 *                           type: number
 *         transactionError:
 *           type: object
 *           properties:
 *             error:
 *               type: string
 *         instructions:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               accounts:
 *                 type: array
 *                 items:
 *                   type: string
 *               data:
 *                 type: string
 *               programId:
 *                 type: string
 *               innerInstructions:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     accounts:
 *                       type: array
 *                       items:
 *                         type: string
 *                     data:
 *                       type: string
 *                     programId:
 *                       type: string
 *         events:
 *           type: object
 *           properties:
 *             nft:
 *               type: object
 *               properties:
 *                 description:
 *                   type: string
 *                 type:
 *                   type: string
 *                 source:
 *                   type: string
 *                 amount:
 *                   type: number
 *                 fee:
 *                   type: number
 *                 feePayer:
 *                   type: string
 *                 signature:
 *                   type: string
 *                 slot:
 *                   type: number
 *                 timestamp:
 *                   type: number
 *                 saleType:
 *                   type: string
 *                 buyer:
 *                   type: string
 *                 seller:
 *                   type: string
 *                 staker:
 *                   type: string
 *                 nfts:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       mint:
 *                         type: string
 *                       tokenStandard:
 *                         type: string
 *             swap:
 *               type: object
 *               properties:
 *                 nativeInput:
 *                   type: object
 *                   properties:
 *                     account:
 *                       type: string
 *                     amount:
 *                       type: string
 *                 nativeOutput:
 *                   type: object
 *                   properties:
 *                     account:
 *                       type: string
 *                     amount:
 *                       type: string
 *                 tokenInputs:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       userAccount:
 *                         type: string
 *                       tokenAccount:
 *                         type: string
 *                       mint:
 *                         type: string
 *                       rawTokenAmount:
 *                         type: object
 *                         properties:
 *                           tokenAmount:
 *                             type: string
 *                           decimals:
 *                             type: number
 *                 tokenOutputs:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       userAccount:
 *                         type: string
 *                       tokenAccount:
 *                         type: string
 *                       mint:
 *                         type: string
 *                       rawTokenAmount:
 *                         type: object
 *                         properties:
 *                           tokenAmount:
 *                             type: string
 *                           decimals:
 *                             type: number
 *                 tokenFees:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       userAccount:
 *                         type: string
 *                       tokenAccount:
 *                         type: string
 *                       mint:
 *                         type: string
 *                       rawTokenAmount:
 *                         type: object
 *                         properties:
 *                           tokenAmount:
 *                             type: string
 *                           decimals:
 *                             type: number
 *                 nativeFees:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       account:
 *                         type: string
 *                       amount:
 *                         type: string
 *                 innerSwaps:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       tokenInputs:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             fromUserAccount:
 *                               type: string
 *                             toUserAccount:
 *                               type: string
 *                             fromTokenAccount:
 *                               type: string
 *                             toTokenAccount:
 *                               type: string
 *                             tokenAmount:
 *                               type: number
 *                             mint:
 *                               type: string
 *                       tokenOutputs:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             fromUserAccount:
 *                               type: string
 *                             toUserAccount:
 *                               type: string
 *                             fromTokenAccount:
 *                               type: string
 *                             toTokenAccount:
 *                               type: string
 *                             tokenAmount:
 *                               type: number
 *                             mint:
 *                               type: string
 *                       tokenFees:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             fromUserAccount:
 *                               type: string
 *                             toUserAccount:
 *                               type: string
 *                             fromTokenAccount:
 *                               type: string
 *                             toTokenAccount:
 *                               type: string
 *                             tokenAmount:
 *                               type: number
 *                             mint:
 *                               type: string
 *                       nativeFees:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             fromUserAccount:
 *                               type: string
 *                             toUserAccount:
 *                               type: string
 *                             amount:
 *                               type: number
 *                       programInfo:
 *                         type: object
 *                         properties:
 *                           source:
 *                             type: string
 *                           account:
 *                             type: string
 *                           programName:
 *                             type: string
 *                           instructionName:
 *                             type: string
 */

/**
 * @swagger
 * /api/portfolio/{address}:
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
router.get('/:address', async (req: Request, res: Response): Promise<void> => {
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
 * /api/portfolio/{address}:
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
router.post('/:address', async (req: Request, res: Response): Promise<void> => {
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

/**
 * @swagger
 * /api/portfolio/{address}/transactions:
 *   get:
 *     summary: Get paginated transactions for a wallet
 *     parameters:
 *       - in: path
 *         name: address
 *         required: true
 *         schema:
 *           type: string
 *         description: Solana wallet address
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: before
 *         schema:
 *           type: string
 *         description: Timestamp to fetch transactions before
 *       - in: query
 *         name: until
 *         schema:
 *           type: string
 *         description: Timestamp to fetch transactions until
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filter by transaction type
 *       - in: query
 *         name: source
 *         schema:
 *           type: string
 *         description: Filter by transaction source
 *     responses:
 *       200:
 *         description: List of transactions with pagination info
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 transactions:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/HeliusTransaction'
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *       500:
 *         description: Server error
 */
router.get('/:address/transactions', async (req: Request, res: Response): Promise<void> => {
  try {
    const { address } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = 25;
    const before = req.query.before as string;
    const until = req.query.until as string;
    const type = req.query.type as string;
    const source = req.query.source as string;

    // Build query parameters
    const queryParams = new URLSearchParams({
      'api-key': process.env.HELIUS_API_KEY || '',
      limit: limit.toString()
    });

    if (before) queryParams.append('before', before);
    if (until) queryParams.append('until', until);
    if (type) queryParams.append('type', type);
    if (source) queryParams.append('source', source);

    // Fetch transaction history from Helius v0 API
    const response = await axios.get<HeliusTransaction[]>(
      `https://api.helius.xyz/v0/addresses/${address}/transactions?${queryParams.toString()}`
    );

    const transactions = response.data;
    const total = transactions.length;
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      transactions,
      total,
      page,
      totalPages
    });
  } catch (error: any) {
    console.error('Error fetching transactions:', error);
    const status = error.response?.status || 500;
    const message = error.response?.data?.message || 'Failed to fetch transactions';
    res.status(status).json({ error: message });
  }
});

export default router;
