import { getCartByUserId, saveCart, clearCart, checkoutCart } from '../services/cartService.js';

export const getCartController = async (req, res) => {
  try {
    const items = await getCartByUserId(req.user.id);
    res.json({ items });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching cart' });
  }
};

export const updateCartController = async (req, res) => {
  try {
    const { items } = req.body;
    await saveCart(req.user.id, items || []);
    res.json({ message: 'Cart updated' });
  } catch (err) {
    res.status(500).json({ error: 'Error updating cart' });
  }
};

export const clearCartController = async (req, res) => {
  try {
    await clearCart(req.user.id);
    res.json({ message: 'Cart cleared' });
  } catch (err) {
    res.status(500).json({ error: 'Error clearing cart' });
  }
};

export const checkoutController = async (req, res) => {
  try {
    const { paymentStatus } = req.body;
    const order = await checkoutCart(req.user.id, paymentStatus || 'Pending');
    res.status(201).json(order);
  } catch (err) {
    console.error('Checkout error:', err);
    res.status(500).json({ error: 'Checkout failed' });
  }
};