
import { v4 as uuidv4 } from 'uuid';
import { dynamoDb } from "../dbClient"

const TABLE_NAME = 'cloudmart-orders';

export const createOrder = async (order) => {
  const params = {
    TableName: TABLE_NAME,
    Item: {
      ...order,
      id: uuidv4().split('-')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  };

  await dynamoDb.put(params).promise();
  return params.Item;
};

export const getAllOrders = async () => {
  const params = {
    TableName: TABLE_NAME
  };

  const result = await dynamoDb.scan(params).promise();
  return result.Items;
};

export const getOrderById = async (id) => {
  const params = {
    TableName: TABLE_NAME,
    Key: { id }
  };

  const result = await dynamoDb.get(params).promise();
  return result.Item;
};

export const getOrdersByUserEmail = async (email) => {
  const params = {
    TableName: TABLE_NAME,
    IndexName: 'UserEmailIndex',
    KeyConditionExpression: 'userEmail = :email',
    ExpressionAttributeValues: {
      ':email': email,
    },
  };

  const result = await dynamoDb.query(params).promise();
  return result.Items;
};

export const getOrdersByUserId = async (userId) => {
  const params = {
    TableName: TABLE_NAME,
    FilterExpression: 'userId = :userId',
    ExpressionAttributeValues: {
      ':userId': userId
    }
  };

  const result = await dynamoDb.scan(params).promise();
  return result.Items;
};

export const updateOrder = async (id, updates) => {
  const allowedUpdates = ['status', 'items', 'total'];
  const updateExpression = [];
  const expressionAttributeNames = {};
  const expressionAttributeValues = {};

  Object.keys(updates).forEach(key => {
    if (allowedUpdates.includes(key)) {
      updateExpression.push(`#${key} = :${key}`);
      expressionAttributeNames[`#${key}`] = key;
      expressionAttributeValues[`:${key}`] = updates[key];
    }
  });

  if (updateExpression.length === 0) {
    throw new Error('No valid fields to update');
  }

  // Always update the updatedAt timestamp
  updateExpression.push('#updatedAt = :updatedAt');
  expressionAttributeNames['#updatedAt'] = 'updatedAt';
  expressionAttributeValues[':updatedAt'] = new Date().toISOString();

  const params = {
    TableName: TABLE_NAME,
    Key: { id },
    UpdateExpression: `SET ${updateExpression.join(', ')}`,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: 'ALL_NEW'
  };

  const result = await dynamoDb.update(params).promise();
  return result.Attributes;
};

export const deleteOrder = async (id) => {
  const params = {
    TableName: TABLE_NAME,
    Key: { id }
  };

  await dynamoDb.delete(params).promise();
};

export const cancelOrder = async (orderId) => {
  const params = {
    TableName: TABLE_NAME,
    Key: { id: orderId },
    UpdateExpression: 'set #status = :status, #updatedAt = :updatedAt',
    ExpressionAttributeNames: {
      '#status': 'status',
      '#updatedAt': 'updatedAt'
    },
    ExpressionAttributeValues: {
      ':status': 'Canceled',
      ':updatedAt': new Date().toISOString()
    },
    ReturnValues: 'ALL_NEW'
  };

  const result = await dynamoDb.update(params).promise();
  return result.Attributes;
};