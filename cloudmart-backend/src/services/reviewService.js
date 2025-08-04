import { dynamoDb } from '../dbClient.js';
import { v4 as uuidv4 } from 'uuid';

const TABLE_NAME = 'cloudmart-reviews';

export const createReview = async (productId, userId, rating, comment) => {
  const review = {
    id: uuidv4(),
    productId,
    userId,
    rating,
    comment,
    createdAt: new Date().toISOString(),
  };

  const params = {
    TableName: TABLE_NAME,
    Item: review,
  };

  await dynamoDb.put(params).promise();
  return review;
};

export const getReviewsByProduct = async (productId) => {
  const params = {
    TableName: TABLE_NAME,
    IndexName: 'productId-index',
    KeyConditionExpression: 'productId = :pid',
    ExpressionAttributeValues: {
      ':pid': productId,
    },
  };

  try {
    const result = await dynamoDb.query(params).promise();
    return result.Items;
  } catch (err) {
    // Fallback to scan if index not available
    const scanParams = {
      TableName: TABLE_NAME,
      FilterExpression: 'productId = :pid',
      ExpressionAttributeValues: { ':pid': productId },
    };
    const result = await dynamoDb.scan(scanParams).promise();
    return result.Items;
  }
};