import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// إنشاء instance من axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// إضافة token إلى الطلبات
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// معالجة الأخطاء
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (username, password) => api.post('/auth/login', { username, password }),
  getMe: () => api.get('/auth/me'),
  createLawyer: (data) => api.post('/auth/lawyers', data),
  getAllLawyers: () => api.get('/auth/lawyers'),
  toggleLawyerStatus: (id) => api.put(`/auth/lawyers/${id}/toggle`),
};

// Clients API
export const clientsAPI = {
  createClient: (formData) => api.post('/clients', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getMyClients: () => api.get('/clients'),
  getClientById: (id) => api.get(`/clients/${id}`),
  updateClient: (id, formData) => api.put(`/clients/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  deleteClient: (id) => api.delete(`/clients/${id}`),
  searchClients: (keyword) => api.get('/clients/search', { params: { keyword } }),
};

// Cases API
export const casesAPI = {
  createCase: (data) => api.post('/cases', data),
  getClientCases: (clientId) => api.get(`/cases/client/${clientId}`),
  getCaseById: (id) => api.get(`/cases/${id}`),
  updateCase: (id, data) => api.put(`/cases/${id}`, data),
  deleteCase: (id) => api.delete(`/cases/${id}`),
  addSession: (id, data) => api.post(`/cases/${id}/session`, data),
  analyzeCase: (id) => api.post(`/cases/${id}/analyze`),
};

// Documents API
export const documentsAPI = {
  uploadDocument: (formData) => api.post('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getClientDocuments: (clientId, category) => 
    api.get(`/documents/client/${clientId}`, { params: { category } }),
  getCaseDocuments: (caseId) => api.get(`/documents/case/${caseId}`),
  getDocumentById: (id) => api.get(`/documents/${id}`),
  updateDocument: (id, data) => api.put(`/documents/${id}`, data),
  deleteDocument: (id) => api.delete(`/documents/${id}`),
  searchDocuments: (keyword) => api.get('/documents/search', { params: { keyword } }),
  getStats: () => api.get('/documents/stats'),
};

export default api;
