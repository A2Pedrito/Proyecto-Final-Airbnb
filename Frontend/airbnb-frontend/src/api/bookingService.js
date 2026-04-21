import api from './axiosConfig';

// POST /api/bookings — body: { propertyId, checkIn, checkOut }
// checkIn y checkOut en formato "YYYY-MM-DD"
export const createBooking = (data) => api.post('/bookings', data);

// POST /api/bookings/{id}/cancel — sin body
export const cancelBooking = (id) => api.post(`/bookings/${id}/cancel`);

// POST /api/bookings/{id}/complete — sin body
export const completeBooking = (id) => api.post(`/bookings/${id}/complete`);