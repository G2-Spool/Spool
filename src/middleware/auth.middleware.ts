import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger.js';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: {
        sub: string;
        email: string;
        accessToken: string;
      };
    }
  }
}

interface JwtPayload {
  sub: string;
  email: string;
  email_verified: boolean;
  exp: number;
  iat: number;
  [key: string]: any;
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'No token provided',
      });
    }

    const token = authHeader.substring(7);
    
    // Decode token without verification (Cognito already verified it)
    const decoded = jwt.decode(token) as JwtPayload;
    
    if (!decoded || !decoded.sub || !decoded.email) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token',
      });
    }

    // Check token expiration
    if (decoded.exp && decoded.exp < Date.now() / 1000) {
      return res.status(401).json({
        success: false,
        error: 'Token expired',
      });
    }

    // Attach user info to request
    req.user = {
      sub: decoded.sub,
      email: decoded.email,
      accessToken: token,
    };

    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    res.status(401).json({
      success: false,
      error: 'Authentication failed',
    });
  }
}; 