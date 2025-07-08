import { Router } from 'express';
import { z } from 'zod';
import { CognitoService } from '../services/cognito.service.js';
import { validateRequest } from '../middleware/validation.middleware.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { 
  SignInRequest, 
  SignUpRequest, 
  ConfirmSignUpRequest, 
  ForgotPasswordRequest, 
  ResetPasswordRequest,
  RefreshTokenRequest 
} from '../types/auth.types.js';
import { logger } from '../utils/logger.js';

// Initialize Cognito service
const cognitoService = new CognitoService({
  region: process.env.AWS_REGION || 'us-east-1',
  userPoolId: process.env.COGNITO_USER_POOL_ID!,
  clientId: process.env.COGNITO_APP_CLIENT_ID!,
  clientSecret: process.env.COGNITO_APP_CLIENT_SECRET!,
});

// Create router
export const authRouter = Router();

// Validation schemas
const signInSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8),
  }),
});

const signUpSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
  }),
});

const confirmSignUpSchema = z.object({
  body: z.object({
    email: z.string().email(),
    code: z.string().length(6),
  }),
});

const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email(),
  }),
});

const resetPasswordSchema = z.object({
  body: z.object({
    email: z.string().email(),
    code: z.string().length(6),
    newPassword: z.string().min(8),
  }),
});

const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string(),
    email: z.string().email(),
  }),
});

/**
 * POST /auth/signin
 * Sign in a user
 */
authRouter.post('/signin', 
  validateRequest(signInSchema),
  async (req, res) => {
    try {
      const { email, password } = req.body as SignInRequest;
      const result = await cognitoService.signIn(email, password);

      if (!result.success) {
        return res.status(401).json({
          success: false,
          error: result.error,
          challengeName: result.challengeName,
          session: result.session,
        });
      }

      res.json({
        success: true,
        tokens: result.tokens,
      });
    } catch (error) {
      logger.error('Sign in route error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }
);

/**
 * POST /auth/signup
 * Sign up a new user
 */
authRouter.post('/signup',
  validateRequest(signUpSchema),
  async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body as SignUpRequest;
      
      const attributes: Record<string, string> = {};
      if (firstName) attributes.given_name = firstName;
      if (lastName) attributes.family_name = lastName;

      const result = await cognitoService.signUp(email, password, attributes);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: result.error,
        });
      }

      res.json({
        success: true,
        userId: result.userId,
        message: 'User created successfully. Please check your email for verification code.',
      });
    } catch (error) {
      logger.error('Sign up route error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }
);

/**
 * POST /auth/confirm
 * Confirm user sign up with verification code
 */
authRouter.post('/confirm',
  validateRequest(confirmSignUpSchema),
  async (req, res) => {
    try {
      const { email, code } = req.body as ConfirmSignUpRequest;
      const result = await cognitoService.confirmSignUp(email, code);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: result.error,
        });
      }

      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      logger.error('Confirm sign up route error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }
);

/**
 * POST /auth/forgot-password
 * Initiate forgot password flow
 */
authRouter.post('/forgot-password',
  validateRequest(forgotPasswordSchema),
  async (req, res) => {
    try {
      const { email } = req.body as ForgotPasswordRequest;
      const result = await cognitoService.forgotPassword(email);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: result.error,
        });
      }

      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      logger.error('Forgot password route error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }
);

/**
 * POST /auth/reset-password
 * Reset password with verification code
 */
authRouter.post('/reset-password',
  validateRequest(resetPasswordSchema),
  async (req, res) => {
    try {
      const { email, code, newPassword } = req.body as ResetPasswordRequest;
      const result = await cognitoService.confirmForgotPassword(email, code, newPassword);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: result.error,
        });
      }

      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      logger.error('Reset password route error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }
);

/**
 * POST /auth/refresh
 * Refresh access token
 */
authRouter.post('/refresh',
  validateRequest(refreshTokenSchema),
  async (req, res) => {
    try {
      const { refreshToken, email } = req.body as RefreshTokenRequest;
      const result = await cognitoService.refreshToken(refreshToken, email);

      if (!result.success) {
        return res.status(401).json({
          success: false,
          error: result.error,
        });
      }

      res.json({
        success: true,
        tokens: result.tokens,
      });
    } catch (error) {
      logger.error('Refresh token route error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }
);

/**
 * GET /auth/me
 * Get current user profile
 */
authRouter.get('/me',
  authenticate,
  async (req: any, res) => {
    try {
      const profile = await cognitoService.getUserProfile(req.user.accessToken);

      if (!profile) {
        return res.status(401).json({
          success: false,
          error: 'Invalid token',
        });
      }

      res.json({
        success: true,
        profile,
      });
    } catch (error) {
      logger.error('Get profile route error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }
);

/**
 * POST /auth/signout
 * Sign out user (invalidate all tokens)
 */
authRouter.post('/signout',
  authenticate,
  async (req: any, res) => {
    try {
      const result = await cognitoService.signOut(req.user.accessToken);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: result.error,
        });
      }

      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      logger.error('Sign out route error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }
); 