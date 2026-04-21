import api from './axiosConfig';

// GET /api/properties?location=&checkIn=&checkOut=&capacity=&maxPrice=
// filters es un objeto: { location, checkIn, checkOut, capacity, maxPrice }
// axios convierte el objeto en query params automáticamente con { params: filters }
export const getProperties = (filters = {}) => api.get('/properties', { params: filters });

// GET /api/properties/{id}
export const getPropertyById = (id) => api.get(`/properties/${id}`);

// POST /api/properties — requiere token de Host
// body: { title, description, location, pricePerNight, capacity }
export const createProperty = (data) => api.post('/properties', data);

// PUT /api/properties/{id} — requiere token de Host
// body: { title, description, pricePerNight, capacity }
export const updateProperty = (id, data) => api.put(`/properties/${id}`, data);

// DELETE /api/properties/{id} — requiere token de Host
export const deleteProperty = (id) => api.delete(`/properties/${id}`);

// POST /api/properties/{id}/block-dates — body: ["2025-08-10", "2025-08-11"]
export const blockDates = (id, dates) => api.post(`/properties/${id}/block-dates`, dates);

// POST /api/properties/{id}/unblock-dates — body: ["2025-08-10"]
export const unblockDates = (id, dates) => api.post(`/properties/${id}/unblock-dates`, dates);