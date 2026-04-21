import axios from 'axios';

// Instancia base de axios apuntando a tu API
const api = axios.create({
  baseURL: 'http://localhost:5180/api',
});

// Interceptor: agrega el token JWT automáticamente a CADA request
// Sin esto tendrías que pegarlo manualmente en cada llamada
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
