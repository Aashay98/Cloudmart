import { useEffect, useState } from "react";
import api from "../../config/axiosConfig";

const PriceComparisonModal = ({ productName, onClose }) => {
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await api.get("/products/compare", {
          params: { q: productName },
        });
        setPrices(response.data);
      } catch (err) {
        setError("Failed to fetch price comparison.");
      } finally {
        setLoading(false);
      }
    };

    fetchPrices();
  }, [productName]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded shadow-md w-96">
        <h2 className="text-xl font-bold mb-4">Price Comparison</h2>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <ul className="space-y-2 max-h-64 overflow-y-auto">
            {prices.map((p, idx) => (
              <li key={idx} className="flex justify-between">
                <span>{p.site}</span>
                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600"
                >
                  ${""}{p.price}
                </a>
              </li>
            ))}
          </ul>
        )}
        <button
          onClick={onClose}
          className="mt-4 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 w-full"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default PriceComparisonModal;