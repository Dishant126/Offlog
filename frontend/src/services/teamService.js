import { api } from './api';

export const teamService = {
  create: (data) => api.post('/teams', data),
  getMyTeams: () => api.get('/teams/my-teams'),
  getPublic: (params) => api.get('/teams/public', { params }),
  getById: (id) => api.get(`/teams/${id}`),
  update: (id, data) => api.put(`/teams/${id}`, data),
  delete: (id) => api.delete(`/teams/${id}`),
  uploadLogo: (id, formData) => api.post(`/teams/${id}/logo`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  regenerateCode: (id) => api.post(`/teams/${id}/regenerate-code`),
  joinPublic: (id) => api.post(`/teams/${id}/join`),
  join: (joinCode, message) => api.post('/teams/join', { joinCode, message }),
  getJoinRequests: (id) => api.get(`/teams/${id}/join-requests`),
  respondJoinRequest: (teamId, requestId, status) => 
    api.put(`/teams/${teamId}/join-requests/${requestId}`, { status }),
  removeMember: (teamId, memberId) => api.delete(`/teams/${teamId}/members/${memberId}`),
  updateMemberRole: (teamId, memberId, role) => 
    api.put(`/teams/${teamId}/members/${memberId}/role`, { role }),
  transferLeadership: (teamId, newLeaderId) => 
    api.post(`/teams/${teamId}/transfer-leadership`, { newLeaderId }),
  leave: (teamId) => api.post(`/teams/${teamId}/leave`),
  getActivities: (id) => api.get(`/teams/${id}/activities`),
  cancelJoinRequest: (requestId) => api.delete(`/teams/join-requests/${requestId}`),
};
