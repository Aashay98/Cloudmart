import pkg from 'aws-sdk';
const { DynamoDB } = pkg;
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

const dynamoDb = new DynamoDB.DocumentClient({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const USERS_TABLE = 'cloudmart-users';

export const createUser = async (userData) => {
  const { email, password, firstName, lastName, phone } = userData;
  
  // Check if user already exists
  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  // Hash password
  const saltRounds = 12;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const user = {
    id: uuidv4(),
    email: email.toLowerCase(),
    password: hashedPassword,
    firstName,
    lastName,
    phone: phone || '',
    role: 'customer', // Default role
    isActive: true,
    emailVerified: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastLogin: null
  };

  const params = {
    TableName: USERS_TABLE,
    Item: user,
    ConditionExpression: 'attribute_not_exists(email)' // Ensure email uniqueness
  };

  try {
    await dynamoDb.put(params);
    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    if (error.code === 'ConditionalCheckFailedException') {
      throw new Error('User with this email already exists');
    }
    throw error;
  }
};

export const getUserByEmail = async (email) => {
  const params = {
    TableName: USERS_TABLE,
    IndexName: 'email-index', // You'll need to create this GSI
    KeyConditionExpression: 'email = :email',
    ExpressionAttributeValues: {
      ':email': email.toLowerCase()
    }
  };

  try {
    const result = await // The `.promise()` call might be on an JS SDK v2 client API.
    // If yes, please remove .promise(). If not, remove this comment.
    // The `.promise()` call might be on an JS SDK v2 client API.
    // If yes, please remove .promise(). If not, remove this comment.
    dynamoDb.query(params).promise();
    return result.Items[0] || null;
  } catch (error) {
    // If GSI doesn't exist, fall back to scan (less efficient)
    const scanParams = {
      TableName: USERS_TABLE,
      FilterExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': email.toLowerCase()
      }
    };
    const result = await // The `.promise()` call might be on an JS SDK v2 client API.
    // If yes, please remove .promise(). If not, remove this comment.
    // The `.promise()` call might be on an JS SDK v2 client API.
    // If yes, please remove .promise(). If not, remove this comment.
    dynamoDb.scan(scanParams).promise();
    return result.Items[0] || null;
  }
};

export const getUserById = async (id) => {
  const params = {
    TableName: USERS_TABLE,
    Key: { id }
  };

  const result = await // The `.promise()` call might be on an JS SDK v2 client API.
  // If yes, please remove .promise(). If not, remove this comment.
  // The `.promise()` call might be on an JS SDK v2 client API.
  // If yes, please remove .promise(). If not, remove this comment.
  dynamoDb.get(params).promise();
  return result.Item || null;
};

export const validatePassword = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

export const updateUser = async (id, updates) => {
  const allowedUpdates = ['firstName', 'lastName', 'phone'];
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
    TableName: USERS_TABLE,
    Key: { id },
    UpdateExpression: `SET ${updateExpression.join(', ')}`,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: 'ALL_NEW'
  };

  const result = await // The `.promise()` call might be on an JS SDK v2 client API.
  // If yes, please remove .promise(). If not, remove this comment.
  // The `.promise()` call might be on an JS SDK v2 client API.
  // If yes, please remove .promise(). If not, remove this comment.
  dynamoDb.update(params).promise();
  const { password: _, ...userWithoutPassword } = result.Attributes;
  return userWithoutPassword;
};

export const updatePassword = async (id, currentPassword, newPassword) => {
  const user = await getUserById(id);
  if (!user) {
    throw new Error('User not found');
  }

  const isCurrentPasswordValid = await validatePassword(currentPassword, user.password);
  if (!isCurrentPasswordValid) {
    throw new Error('Current password is incorrect');
  }

  const saltRounds = 12;
  const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

  const params = {
    TableName: USERS_TABLE,
    Key: { id },
    UpdateExpression: 'SET password = :password, updatedAt = :updatedAt',
    ExpressionAttributeValues: {
      ':password': hashedNewPassword,
      ':updatedAt': new Date().toISOString()
    },
    ReturnValues: 'ALL_NEW'
  };

  const result = await // The `.promise()` call might be on an JS SDK v2 client API.
  // If yes, please remove .promise(). If not, remove this comment.
  // The `.promise()` call might be on an JS SDK v2 client API.
  // If yes, please remove .promise(). If not, remove this comment.
  dynamoDb.update(params).promise();
  const { password: _, ...userWithoutPassword } = result.Attributes;
  return userWithoutPassword;
};

export const updateLastLogin = async (id) => {
  const params = {
    TableName: USERS_TABLE,
    Key: { id },
    UpdateExpression: 'SET lastLogin = :lastLogin',
    ExpressionAttributeValues: {
      ':lastLogin': new Date().toISOString()
    }
  };

  await // The `.promise()` call might be on an JS SDK v2 client API.
  // If yes, please remove .promise(). If not, remove this comment.
  // The `.promise()` call might be on an JS SDK v2 client API.
  // If yes, please remove .promise(). If not, remove this comment.
  dynamoDb.update(params).promise();
};

export const deactivateUser = async (id) => {
  const params = {
    TableName: USERS_TABLE,
    Key: { id },
    UpdateExpression: 'SET isActive = :isActive, updatedAt = :updatedAt',
    ExpressionAttributeValues: {
      ':isActive': false,
      ':updatedAt': new Date().toISOString()
    },
    ReturnValues: 'ALL_NEW'
  };

  const result = await // The `.promise()` call might be on an JS SDK v2 client API.
  // If yes, please remove .promise(). If not, remove this comment.
  // The `.promise()` call might be on an JS SDK v2 client API.
  // If yes, please remove .promise(). If not, remove this comment.
  dynamoDb.update(params).promise();
  const { password: _, ...userWithoutPassword } = result.Attributes;
  return userWithoutPassword;
};

export const updateUserRole = async (id, role) => {
  const allowedRoles = ['admin', 'customer', 'support'];
  if (!allowedRoles.includes(role)) {
    throw new Error('Invalid role');
  }

  const params = {
    TableName: USERS_TABLE,
    Key: { id },
    UpdateExpression: 'SET #role = :role, updatedAt = :updatedAt',
    ExpressionAttributeNames: {
      '#role': 'role'
    },
    ExpressionAttributeValues: {
      ':role': role,
      ':updatedAt': new Date().toISOString()
    },
    ReturnValues: 'ALL_NEW'
  };

  const result = await // The `.promise()` call might be on an JS SDK v2 client API.
  // If yes, please remove .promise(). If not, remove this comment.
  // The `.promise()` call might be on an JS SDK v2 client API.
  // If yes, please remove .promise(). If not, remove this comment.
  dynamoDb.update(params).promise();
  const { password: _, ...userWithoutPassword } = result.Attributes;
  return userWithoutPassword;
};