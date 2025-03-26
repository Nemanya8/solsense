import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT) || 5432,
});

pool.on('connect', () => {
  console.log('Connected to the PostgreSQL database');
});

export default {
  query: (text: string, params: any[]) => pool.query(text, params),
};
