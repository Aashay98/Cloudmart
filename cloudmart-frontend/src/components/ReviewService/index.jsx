import api from '../../config/axiosConfig';

export const createReview = async (productId, rating, comment) => {
  try {
    const response = await api.post(`/products/${productId}/reviews`, {
      rating,
      comment
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getReviewsByProduct = async (productId) => {
  try {
    const response = await api.get(`/products/${productId}/reviews`);
    return response.data;
  } catch (error) {
    throw error;
  }
};