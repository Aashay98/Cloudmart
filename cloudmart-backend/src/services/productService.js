// services/productService.js
import { dynamoDb }from "../dbClient"
import { v4 as uuidv4 } from 'uuid';

const TABLE_NAME = 'cloudmart-products';

export const createProduct = async (product) => {
  const params = {
    TableName: TABLE_NAME,
    Item: {
      ...product,       
      id:uuidv4().split('-')[0],
      createdAt: new Date().toISOString()}
  };

  await dynamoDb.put(params).promise();
  return product;
};

export const getAllProducts = async () => {
  const params = {
    TableName: TABLE_NAME
  }; 

  const result = await dynamoDb.scan(params).promise();

  return result.Items;
};

export const getProductById = async (id) => {
  const params = {
    TableName: TABLE_NAME,
    Key: { id }
  };

  const result = await dynamoDb.get(params).promise();
  return result.Item;
};

export const updateProduct = async (id, updates) => {
  const updateExpr = [];
  const exprAttrNames = {};
  const exprAttrValues = {};

  Object.entries(updates).forEach(([key, value], index) => {
    const nameKey = `#key${index}`;
    const valueKey = `:val${index}`;
    updateExpr.push(`${nameKey} = ${valueKey}`);
    exprAttrNames[nameKey] = key;
    exprAttrValues[valueKey] = value;
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


export const deleteProduct = async (id) => {
  const params = {
    TableName: TABLE_NAME,
    Key: { id }
  };

  await dynamoDb.delete(params).promise();
};

export const searchProducts = async ({ searchTerm, category, minPrice, maxPrice }) => {
  const filterExpressions = [];
  const expressionAttributeNames = {};
  const expressionAttributeValues = {};

  if (searchTerm) {
    filterExpressions.push('contains(#name, :search)');
    expressionAttributeNames['#name'] = 'name';
    expressionAttributeValues[':search'] = searchTerm;
  }

  if (category) {
    filterExpressions.push('#category = :category');
    expressionAttributeNames['#category'] = 'category';
    expressionAttributeValues[':category'] = category;
  }

  if (minPrice) {
    filterExpressions.push('#price >= :minPrice');
    expressionAttributeNames['#price'] = 'price';
    expressionAttributeValues[':minPrice'] = Number(minPrice);
  }

  if (maxPrice) {
    if (!expressionAttributeNames['#price']) {
      expressionAttributeNames['#price'] = 'price';
    }
    filterExpressions.push('#price <= :maxPrice');
    expressionAttributeValues[':maxPrice'] = Number(maxPrice);
  }

  const params = {
    TableName: TABLE_NAME,
    FilterExpression: filterExpressions.join(' AND '),
    ExpressionAttributeNames:
      Object.keys(expressionAttributeNames).length > 0
        ? expressionAttributeNames
        : undefined,
    ExpressionAttributeValues:
      Object.keys(expressionAttributeValues).length > 0
        ? expressionAttributeValues
        : undefined,
  };

  const result = await dynamoDb.scan(params).promise();
  return result.Items;
};