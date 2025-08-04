import { dynamoDb } from '../dbClient.js';
import { createOrder } from './orderService.js';
import { getUserById } from './userService.js';
import { sendConfirmationEmail } from '../utils/email.js';

const TABLE_NAME = 'cloudmart-carts';

export const getCartByUserId = async (userId) => {
  const params = { TableName: TABLE_NAME, Key: { userId } };
  const result = await dynamoDb.get(params).promise();
  return result.Item ? result.Item.items : [];
};

export const saveCart = async (userId, items) => {
  const params = {
    TableName: TABLE_NAME,
    Item: {
      userId,
      items,
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    }
  };
  await dynamoDb.put(params).promise();
  return items;
};

export const clearCart = async (userId) => {
  const params = { TableName: TABLE_NAME, Key: { userId } };
  await dynamoDb.delete(params).promise();
};

export const checkoutCart = async (userId, paymentStatus = 'Pending') => {
  const items = await getCartByUserId(userId);
  if (!items || items.length === 0) {
    throw new Error('Cart is empty');
  }
  const total = items.reduce((t, i) => t + i.price * i.quantity, 0);
  const user = await getUserById(userId);
  const order = await createOrder({
    userId,
    userEmail: user.email,
    items,
    total,
    status: 'Processing',
    paymentStatus
  });
  await clearCart(userId);
  try {
    await sendConfirmationEmail(user.email, order);
  } catch (e) {
    console.error('Email error:', e);
  }
  return order;
};