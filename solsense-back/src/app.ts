import dotenv from 'dotenv';
import express, { Express, Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import cors from 'cors';
import session from 'express-session';
import db from './config/db';
import portfolioRoutes from './routes/portfolio';
import advertiserRoutes from './routes/advertiser';
import { createPortfolioTable } from './models/portfolio';
import { createAdvertiserTable } from './models/advertiser';
import { swaggerSpec } from './config/swagger';

dotenv.config();

const app: Express = express();
const PORT: number = parseInt(process.env.PORT || '4000', 10);

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// CORS configuration
const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:4000', 'http://localhost:8080'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/portfolio', portfolioRoutes);
app.use('/api/advertiser', advertiserRoutes);

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
    await createPortfolioTable();
    await createAdvertiserTable();
    console.log('Database tables initialized successfully');
  } catch (error) {
    console.error('Error initializing database tables:', error);
    process.exit(1);
  }
};

initializeDatabase();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API Documentation available at http://localhost:${PORT}/api-docs`);
});
