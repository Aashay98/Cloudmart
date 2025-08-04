import express from 'express';
import { addReviewController, getProductReviewsController } from '../controllers/reviewController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router({ mergeParams: true });

router.get('/:productId/reviews', getProductReviewsController);
router.post('/:productId/reviews', authenticateToken, addReviewController);

export default router;