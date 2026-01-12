import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from './config';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getItems = (skip = 0, limit = 100) => api.get(`${API_ENDPOINTS.ITEMS}?skip=${skip}&limit=${limit}`);

export const login = (email, password) => {
  const formData = new URLSearchParams();
  // FastAPI ожидает username и password в формате Form Data
  formData.append('username', email); 
  formData.append('password', password);

  return api.post(API_ENDPOINTS.LOGIN, formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
};

export const register = (email, password, full_name) => api.post(API_ENDPOINTS.REGISTER, { email, password, full_name });

export default api;