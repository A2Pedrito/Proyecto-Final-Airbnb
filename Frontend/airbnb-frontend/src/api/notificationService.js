import api from './axiosConfig';

// GET /api/notifications?onlyUnread=true/false
export const getNotifications = (onlyUnread = false) =>
  api.get('/notifications', { params: { onlyUnread } });

// PUT /api/notifications/{id}/read — sin body
export const markAsRead = (id) => api.put(`/notifications/${id}/read`);