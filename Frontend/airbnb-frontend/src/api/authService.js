import api from './axiosConfig';

// POST /api/auth/register — { name, email, password, role }
// role: 0 = Host, 1 = Guest  (número entero, así lo espera C#)
export const register = (data) => api.post('/auth/register', data);

// POST /api/auth/login — { email, password }
// Responde: { token, name, email, role }
export const login = (data) => api.post('/auth/login', data);

// GET /api/auth/confirm/{token} — el token va en la URL, no en el body
export const confirmAccount = (token) => api.get(`/auth/confirm/${token}`);

// POST /api/auth/resend-confirmation/{email} — el email va en la URL
export const resendConfirmation = (email) => api.post(`/auth/resend-confirmation/${email}`);