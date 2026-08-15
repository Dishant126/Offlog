import { api } from './api';

export const mentorService = {
  getDashboard: () => api.get('/mentor/dashboard')
};
