import { jest } from '@jest/globals';
import { createProduct } from '../src/services/productService.js';

jest.mock('aws-sdk', () => ({
  DynamoDB: {
    DocumentClient: jest.fn().mockImplementation(() => ({
      put: jest.fn().mockReturnThis(),
      promise: jest.fn().mockResolvedValue({})
    }))
  }
}));

describe('createProduct', () => {
  it('returns object with id and createdAt', async () => {
    const product = { name: 'Book', price: 20 };
    const result = await createProduct(product);
    expect(result).toHaveProperty('id');
    expect(result).toHaveProperty('createdAt');
  });
});
