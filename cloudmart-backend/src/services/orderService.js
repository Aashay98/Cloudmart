
import { v4 as uuidv4 } from 'uuid';
import { dynamoDb } from "../dbClient"

const TABLE_NAME = 'cloudmart-orders';

export const createOrder = async (order) => {
  const params = {
    TableName: TABLE_NAME,
    Item: {
      ...order,
      id: uuidv4().split('-')[0],
      createdAt: new Date().toISOString()
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

export const updateOrder = async (id, updates) => {
  const updateExpr = [];
  const exprAttrNames = {};
  const exprAttrValues = {};

  Object.entries(updates).forEach(([key, value], index) => {
    const attrName = `#key${index}`;
    const attrValue = `:val${index}`;
    updateExpr.push(`${attrName} = ${attrValue}`);
    exprAttrNames[attrName] = key;
    exprAttrValues[attrValue] = value;
  });

  const params = {
    TableName: TABLE_NAME,
    Key: { id },
    UpdateExpression: `set ${updateExpr.join(', ')}`,
    ExpressionAttributeNames: exprAttrNames,
    ExpressionAttributeValues: exprAttrValues,
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
    UpdateExpression: 'set #status = :status',
    ExpressionAttributeNames: {
      '#status': 'status',
    },
    ExpressionAttributeValues: {
      ':status': 'Canceled',
    },
    ReturnValues: 'ALL_NEW'
  };

  const result = await dynamoDb.update(params).promise();
  return result.Attributes;
};