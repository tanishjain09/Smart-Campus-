import API from '../api/axios';

export const authService = {
  login: (email, password) => API.post('/auth/login', { email, password }),
  register: (data) => API.post('/auth/register', data),
  getMe: () => API.get('/auth/me'),
};

export const issueServiceAPI = {
  create: (formData) =>
    API.post('/issues', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  list: (params) => API.get('/issues', { params }),
  getByTicketId: (ticketId) => API.get(`/issues/${ticketId}`),
  updateStatus: (ticketId, data) => API.patch(`/issues/${ticketId}/status`, data),
  assign: (ticketId, assignedTo) => API.patch(`/issues/${ticketId}/assign`, { assignedTo }),
  getAssigned: (params) => API.get('/issues/assigned/me', { params }),
};

export const dashboardServiceAPI = {
  getSummary: () => API.get('/dashboard'),
  getStaffDashboard: (params) => API.get('/dashboard/staff', { params }),
  getAnalytics: (params) => API.get('/dashboard/analytics', { params }),
};

export const userServiceAPI = {
  list: (params) => API.get('/users', { params }),
};
