import { createReview, getReviewsByProduct } from '../services/reviewService.js';

export const addReviewController = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const { productId } = req.params;
    if (!rating) {
      return res.status(400).json({ error: 'Rating is required' });
    }
    const review = await createReview(productId, req.user.id, rating, comment || '');
    res.status(201).json(review);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error creating review' });
  }
};

export const getProductReviewsController = async (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = await getReviewsByProduct(productId);
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching reviews' });
  }
};