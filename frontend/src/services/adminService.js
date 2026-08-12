import { api } from './api';

export const adminService = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  getTeams: (params) => api.get('/admin/teams', { params }),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteTeam: (id) => api.delete(`/admin/teams/${id}`),
  getActivityLogs: (params) => api.get('/admin/activity-logs', { params }),
  getMentorManagement: () => api.get('/admin/mentors'),
  createMentor: (data) => api.post('/admin/mentors', data),
  assignMentorToTeam: (data) => api.post('/admin/mentors/assign', data),
  removeMentorFromTeam: (teamId, mentorId) => api.delete(`/admin/mentors/${teamId}/${mentorId}`),
};
