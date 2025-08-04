import axios from 'axios';

const sources = [
 {
    name: 'Amazon',
    buildRequest: (q) => {
      const key = process.env.RAPIDAPI_KEY;
      if (!key) return null;
      return {
        url: 'https://amazon-products1.p.rapidapi.com/search',
        config: {
          params: { query: q, page: '1' },
          headers: {
            'X-RapidAPI-Key': key,
            'X-RapidAPI-Host': 'amazon-products1.p.rapidapi.com',
          },
        },
      };
    },
    transform: (data) =>
      (data.results || []).map((p) => ({
        site: 'Amazon',
        title: p.title,
        price: p.price?.current_price,
        url: p.url,
      })),
  },
  {
    name: 'Walmart',
    buildRequest: (q) => {
      const key = process.env.RAPIDAPI_KEY;
      if (!key) return null;
      return {
        url: 'https://walmart2.p.rapidapi.com/search',
        config: {
          params: { q, page: '1', currency: 'USD' },
          headers: {
            'X-RapidAPI-Key': key,
            'X-RapidAPI-Host': 'walmart2.p.rapidapi.com',
          },
        },
      };
    },
    transform: (data) =>
      (data.results || data.products || []).map((p) => ({
        site: 'Walmart',
        title: p.title || p.name,
        price:
          p.price ||
          p.salePrice ||
          p.primary_offer?.offer_price ||
          p.priceInfo?.currentPrice,
        url: p.link || p.product_page_url || p.url,
      })),
  },
];

export const compareProductPrices = async (query) => {
  const results = await Promise.all(
    sources.map(async (source) => {
      const request = source.buildRequest(query);
      if (!request) return [];
      try {
        const response = await axios.get(request.url, request.config);
        return source.transform(response.data, query);
      } catch (err) {
        console.error(`Error fetching from ${source.name}:`, err.message);
        return [];
      }
    })
  );

  return results.flat();
};