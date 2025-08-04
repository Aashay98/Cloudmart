import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Header from '../Header';
import Footer from '../Footer';
import LoadingSpinner from '../LoadingSpinner';
import { addToCart } from '../../utils/cartUtils';
import { isAuthenticated } from '../../utils/authUtils';
import api from '../../config/axiosConfig';

const ReviewForm = ({ productId, onNewReview }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated()) {
      toast.error('Please log in to submit a review');
      return;
    }
    
    setSubmitting(true);
    try {
      const res = await api.post(`/products/${productId}/reviews`, { rating, comment });
      onNewReview(res.data);
      setComment('');
      toast.success('Review submitted successfully!');
    } catch (err) {
      console.error('Add review failed', err);
      toast.error('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div>
        <label className="block mb-1">Rating</label>
        <select value={rating} onChange={(e) => setRating(Number(e.target.value))} className="border p-2 rounded">
          {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>
      <div>
        <label className="block mb-1">Comment</label>
        <textarea value={comment} onChange={(e) => setComment(e.target.value)} className="w-full border p-2 rounded" />
      </div>
      <button disabled={submitting} className="bg-blue-600 text-white px-4 py-2 rounded">
        Submit
      </button>
    </form>
  );
};

const ProductPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [prodRes, revRes] = await Promise.all([
          api.get(`/products/${id}`),
          api.get(`/products/${id}/reviews`),
        ]);
        setProduct(prodRes.data);
        setReviews(revRes.data);
      } catch (err) {
        console.error('Load product failed', err);
        setError('Failed to load product details');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleNewReview = (review) => {
    setReviews([review, ...reviews]);
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart(product);
      toast.success('Product added to cart!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-100">
        <Header />
        <main className="container mx-auto py-6 flex-grow">
          <LoadingSpinner />
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-100">
        <Header />
        <main className="container mx-auto py-6 flex-grow">
          <div className="text-center text-red-500">
            {error || 'Product not found'}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />
      <main className="container mx-auto py-6 flex-grow px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-96 object-contain rounded-lg"
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
              <p className="text-gray-600 mb-4">{product.description}</p>
              <p className="text-2xl font-bold text-blue-600 mb-6">
                ${product.price.toFixed(2)}
              </p>
              <button
                onClick={handleAddToCart}
                className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors w-full md:w-auto"
              >
                Add to Cart
              </button>
            </div>
          </div>
          
          <div className="border-t pt-8">
            <h3 className="text-2xl font-semibold mb-4">Customer Reviews</h3>
            {isAuthenticated() && (
              <div className="mb-6">
                <h4 className="text-lg font-medium mb-2">Write a Review</h4>
                <ReviewForm productId={id} onNewReview={handleNewReview} />
              </div>
            )}
            
            {reviews.length === 0 ? (
              <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
            ) : (
              <div className="space-y-4">
                {reviews.map(r => (
                  <div key={r.id} className="border border-gray-200 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={i < r.rating ? 'text-yellow-400' : 'text-gray-300'}>
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="ml-2 font-semibold">({r.rating}/5)</span>
                    </div>
                    {r.comment && <p className="text-gray-700">{r.comment}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductPage;