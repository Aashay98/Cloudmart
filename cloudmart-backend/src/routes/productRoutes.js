// routes/productRoutes.js
import express from 'express';
import {
  getAllProductsController,
  getProductByIdController,
  createProductController,
  updateProductController,
  deleteProductController,
  searchProductsController
} from '../controllers/productController.js';

const router = express.Router();

router.get('/', getAllProductsController);
router.get('/search', searchProductsController);
router.get('/:id', getProductByIdController);
router.post('/', createProductController);
router.put('/:id', updateProductController);
router.delete('/:id', deleteProductController);

export default router;