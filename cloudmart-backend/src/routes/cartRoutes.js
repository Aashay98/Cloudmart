import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  getCartController,
  updateCartController,
  clearCartController,
  checkoutController
} from '../controllers/cartController.js';

const router = express.Router();

router.use(authenticateToken);
router.get('/', getCartController);
router.put('/', updateCartController);
router.delete('/', clearCartController);
router.post('/checkout', checkoutController);

export default router;