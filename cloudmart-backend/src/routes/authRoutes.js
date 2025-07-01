import express from 'express';
import {
  registerController,
  loginController,
  refreshTokenController,
  getMeController,
  updatePasswordController,
  logoutController
} from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';
import { authLimiter, passwordResetLimiter } from '../middleware/rateLimiter.js';
import {
  validateRegistration,
  validateLogin,
  validatePasswordUpdate,
  handleValidationErrors
} from '../middleware/validation.js';

const router = express.Router();

// Public routes
router.post('/register', 
  authLimiter,
  validateRegistration,
  handleValidationErrors,
  registerController
);

router.post('/login',
  authLimiter,
  validateLogin,
  handleValidationErrors,
  loginController
);

router.post('/refresh-token', refreshTokenController);

// Protected routes
router.get('/me', authenticateToken, getMeController);

router.put('/password',
  authenticateToken,
  validatePasswordUpdate,
  handleValidationErrors,
  updatePasswordController
);

router.post('/logout', authenticateToken, logoutController);

export default router;