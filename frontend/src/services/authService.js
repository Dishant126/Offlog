import { api } from './api';

export const authService = {
  register: (name, email, password, role = 'USER') => api.post('/auth/register', { name, email, password, role }),
  login: (email, password) => api.post('/auth/login', { email, password }),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  changePassword: (currentPassword, newPassword) => 
    api.put('/auth/change-password', { currentPassword, newPassword }),
};
