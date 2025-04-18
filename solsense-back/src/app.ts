import dotenv from 'dotenv';
import express, { Express, Request, Response, NextFunction } from 'express';
import swaggerUi from 'swagger-ui-express';
import cors from 'cors';
import db from './config/db';
import portfolioRoutes from './routes/portfolio';
import advertiserRoutes from './routes/advertiser';
import adRoutes from './routes/ad';
import { createPortfolioTable } from './models/portfolio';
import { createAdvertiserTable } from './models/advertiser';
import { createAdsTable, createAdImpressionsTable, createAdInteractionsTable } from './models/ad';
import { swaggerSpec } from './config/swagger';
import { runMigrations } from './db-migration';

dotenv.config();

const app: Express = express();
const PORT: number = parseInt(process.env.PORT || '4000', 10);

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Routes
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/advertiser', advertiserRoutes);
app.use('/api/ads', adRoutes);

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/', (_req: Request, res: Response) => {
  res.send('Solsense Backend is running! Visit /api-docs for API documentation.');
});

app.get('/tables', async (_req: Request, res: Response) => {
  try {
    const result = await db.query(
      `SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public'`,
      []
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching tables:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Initialize database tables
const initializeDatabase = async () => {
  try {
    await createAdvertiserTable();
    await createAdsTable();
    await createAdImpressionsTable();
    await createAdInteractionsTable();
    await createPortfolioTable();
    console.log('Database tables initialized successfully');
    
    // Run migrations after tables are created
    await runMigrations();
  } catch (error) {
    console.error('Error initializing database tables:', error);
    process.exit(1);
  }
};

initializeDatabase();

// Error handling middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`API Documentation available at http://localhost:${PORT}/api-docs`);
});
