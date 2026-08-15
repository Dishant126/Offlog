import { api } from './api';

export const taskService = {
  getProjects: (teamId) => api.get(`/tasks/teams/${teamId}/projects`),
  createProject: (teamId, data) => api.post(`/tasks/teams/${teamId}/projects`, data),
  createTask: (teamId, projectId, data) => api.post(`/tasks/teams/${teamId}/projects/${projectId}/tasks`, data),
  updateTaskStatus: (taskId, status, completionNotes = '', completionFile = null) => api.patch(`/tasks/tasks/${taskId}/status`, { status, completionNotes, completionFile }),
  uploadFile: (formData) => api.post('/tasks/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteTask: (taskId) => api.delete(`/tasks/tasks/${taskId}`),
  deleteProject: (projectId) => api.delete(`/tasks/projects/${projectId}`)
};
