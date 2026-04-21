import api from './axiosConfig';

// POST /api/reviews — body: { bookingId, rating, comment }
// rating: número entre 1 y 5
export const createReview = (data) => api.post('/reviews', data);

// GET /api/reviews/property/{propertyId} — público, no necesita token
// Responde: { averageRating, reviews: [...] }
export const getPropertyReviews = (propertyId) => api.get(`/reviews/property/${propertyId}`);