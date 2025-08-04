import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../Header';
import Footer from '../Footer';
import api from '../../config/axiosConfig';

const ReviewForm = ({ productId, onNewReview }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post(`/products/${productId}/reviews`, { rating, comment });
      onNewReview(res.data);
      setComment('');
    } catch (err) {
      console.error('Add review failed', err);
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, revRes] = await Promise.all([
          api.get(`/products/${id}`),
          api.get(`/products/${id}/reviews`),
        ]);
        setProduct(prodRes.data);
        setReviews(revRes.data);
      } catch (err) {
        console.error('Load product failed', err);
      }
    };
    fetchData();
  }, [id]);

  const handleNewReview = (review) => {
    setReviews([review, ...reviews]);
  };

  if (!product) return null;

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />
      <main className="container mx-auto py-6 flex-grow">
        <h2 className="text-2xl font-bold mb-4">{product.name}</h2>
        <p className="mb-4">{product.description}</p>
        <p className="mb-6">${product.price.toFixed(2)}</p>
        <h3 className="text-xl font-semibold mb-2">Reviews</h3>
        <ReviewForm productId={id} onNewReview={handleNewReview} />
        <ul className="mt-4 space-y-3">
          {reviews.map(r => (
            <li key={r.id} className="border p-3 rounded">
              <div className="font-semibold">Rating: {r.rating}</div>
              <div>{r.comment}</div>
            </li>
          ))}
        </ul>
      </main>
      <Footer />
    </div>
  );
};

export default ProductPage;