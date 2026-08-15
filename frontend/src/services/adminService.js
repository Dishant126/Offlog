import { api } from './api';

export const adminService = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  createUser: (data) => api.post('/admin/users', data),
  getTeams: (params) => api.get('/admin/teams', { params }),
  assignMentor: (teamId, userId) => api.post(`/admin/teams/${teamId}/mentor`, { userId }),
  getMentorAssignments: () => api.get('/admin/mentor-assignments'),
  removeMentor: (teamId, userId) => api.delete(`/admin/teams/${teamId}/mentor/${userId}`),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteTeam: (id) => api.delete(`/admin/teams/${id}`),
  getActivityLogs: (params) => api.get('/admin/activity-logs', { params }),
};


