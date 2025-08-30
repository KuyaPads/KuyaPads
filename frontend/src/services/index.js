import apiClient from './api';

export const authService = {
  async login(email, password) {
    const response = await apiClient.post('/auth/login', { email, password });
    return response.data;
  },

  async register(userData) {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  },

  async getMe() {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

export const userService = {
  async getProfile() {
    const response = await apiClient.get('/users/profile');
    return response.data;
  },

  async updateProfile(userData) {
    const response = await apiClient.put('/users/profile', userData);
    return response.data;
  },

  async getAllUsers() {
    const response = await apiClient.get('/users');
    return response.data;
  },

  async getUserById(id) {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  }
};

export const padService = {
  async createPad(padData) {
    const response = await apiClient.post('/pads', padData);
    return response.data;
  },

  async getPads(type = 'owned') {
    const response = await apiClient.get(`/pads?type=${type}`);
    return response.data;
  },

  async getPad(id) {
    const response = await apiClient.get(`/pads/${id}`);
    return response.data;
  },

  async updatePad(id, padData) {
    const response = await apiClient.put(`/pads/${id}`, padData);
    return response.data;
  },

  async deletePad(id) {
    const response = await apiClient.delete(`/pads/${id}`);
    return response.data;
  },

  async addCollaborator(padId, userId, permission = 'write') {
    const response = await apiClient.post(`/pads/${padId}/collaborators`, {
      user_id: userId,
      permission
    });
    return response.data;
  },

  async removeCollaborator(padId, userId) {
    const response = await apiClient.delete(`/pads/${padId}/collaborators/${userId}`);
    return response.data;
  },

  async getVersions(padId) {
    const response = await apiClient.get(`/pads/${padId}/versions`);
    return response.data;
  }
};