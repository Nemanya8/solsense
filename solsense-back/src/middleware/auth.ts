import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

export interface AuthRequest extends Request {
  advertiserId?: number;
  userRole?: string;
}

export const authenticateJWT = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ error: 'Authorization header required' });
    return;
  }

  const token = authHeader.split(' ')[1];

  jwt.verify(token, JWT_SECRET, (err, payload) => {
    if (err) {
      res.status(403).json({ error: 'Invalid or expired token' });
      return;
    }

    if (payload && typeof payload !== 'string') {
      req.advertiserId = payload.id;
      req.userRole = payload.role || 'advertiser';
      next();
    } else {
      res.status(403).json({ error: 'Invalid token payload' });
    }
  });
};

export const generateToken = (payload: { id: number, role?: string }): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}; 