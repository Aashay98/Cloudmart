import { 
    createOrder, 
    getAllOrders, 
    getOrderById, 
    getOrdersByUserEmail, 
    updateOrder, 
    deleteOrder 
  } from '../services/orderService.js';
  
  export const createOrderController = async (req, res) => {
    try {
      // Use authenticated user's email instead of request body
      const orderData = {
        ...req.body,
        userEmail: req.user.email,
        userId: req.user.id
      };
      
      const newOrder = await createOrder(orderData);
      res.status(201).json(newOrder);
    } catch (error) {
      console.error('Create order error:', error);
      res.status(500).json({ 
        error: 'Error creating order',
        message: 'Failed to create order'
      });
    }
  };
  
  export const getAllOrdersController = async (req, res) => {
    try {
      // Only allow admin users to get all orders
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          error: 'Access denied',
          message: 'Admin access required'
        });
      }
      
      const orders = await getAllOrders();
      res.json(orders);
    } catch (error) {
      console.error('Get all orders error:', error);
      res.status(500).json({ 
        error: 'Error fetching orders',
        message: 'Failed to fetch orders'
      });
    }
  };
  
  export const getOrderByIdController = async (req, res) => {
    try {
      const order = await getOrderById(req.params.id);
      if (!order) {
        return res.status(404).json({ 
          error: 'Order not found',
          message: 'The requested order was not found'
        });
      }
      
      // Users can only access their own orders, admins can access all
      if (req.user.role !== 'admin' && order.userId !== req.user.id) {
        return res.status(403).json({
          error: 'Access denied',
          message: 'You can only access your own orders'
        });
      }
      
      res.json(order);
    } catch (error) {
      console.error('Get order error:', error);
      res.status(500).json({ 
        error: 'Error fetching order',
        message: 'Failed to fetch order'
      });
    }
  };
  
  export const getOrdersByUserEmailController = async (req, res) => {
    try {
      // Users can only get their own orders
      const email = req.user.role === 'admin' ? req.query.email : req.user.email;
      
      if (!email) {
        return res.status(400).json({ 
          error: 'Email parameter required',
          message: 'Email query parameter is required'
        });
      }
      
      const orders = await getOrdersByUserEmail(email);
      res.json(orders);
    } catch (error) {
      console.error('Get user orders error:', error);
      res.status(500).json({ 
        error: 'Error fetching orders by user email',
        message: 'Failed to fetch user orders'
      });
    }
  };
  
  export const updateOrderController = async (req, res) => {
    try {
      const order = await getOrderById(req.params.id);
      if (!order) {
        return res.status(404).json({ 
          error: 'Order not found',
          message: 'The requested order was not found'
        });
      }
      
      // Users can only update their own orders, admins can update all
      if (req.user.role !== 'admin' && order.userId !== req.user.id) {
        return res.status(403).json({
          error: 'Access denied',
          message: 'You can only update your own orders'
        });
      }
      
      const updatedOrder = await updateOrder(req.params.id, req.body);
      res.json(updatedOrder);
    } catch (error) {
      console.error('Update order error:', error);
      res.status(500).json({ 
        error: 'Error updating order',
        message: 'Failed to update order'
      });
    }
  };
  
  export const deleteOrderController = async (req, res) => {
    try {
      const order = await getOrderById(req.params.id);
      if (!order) {
        return res.status(404).json({ 
          error: 'Order not found',
          message: 'The requested order was not found'
        });
      }
      
      // Only admins can delete orders
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          error: 'Access denied',
          message: 'Admin access required to delete orders'
        });
      }
      
      await deleteOrder(req.params.id);
      res.json({ 
        message: 'Order deleted successfully'
      });
    } catch (error) {
      console.error('Delete order error:', error);
      res.status(500).json({ 
        error: 'Error deleting order',
        message: 'Failed to delete order'
      });
    }
  };