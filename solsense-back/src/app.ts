import dotenv from 'dotenv';
import express, { Express, Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import cors from 'cors';
import db from './config/db';
import portfolioRoutes from './routes/portfolio';
import { createPortfolioTable } from './models/portfolio';
import { swaggerSpec } from './config/swagger';

dotenv.config();

const app: Express = express();
const PORT: number = parseInt(process.env.PORT || '4000', 10);

// Enable CORS for all routes
app.use(cors());

app.use(express.json());

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api', portfolioRoutes);

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

// Initialize database table
createPortfolioTable()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`API Documentation available at http://localhost:${PORT}/api-docs`);
    });
  })
  .catch((error) => {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  });
