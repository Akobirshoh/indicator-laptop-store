import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from './config';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Интерцептор для добавления токена к каждому запросу
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Интерцептор для обработки ошибок
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// ===== AUTH API =====
export const login = (email, password) => {
  const formData = new URLSearchParams();
  formData.append('username', email);
  formData.append('password', password);

  return api.post(API_ENDPOINTS.LOGIN, formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
};

export const register = (email, password, full_name) => 
  api.post(API_ENDPOINTS.REGISTER, { email, password, full_name });

export const getCurrentUser = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return { email: payload.sub, id: payload.id };
  } catch {
    return null;
  }
};

// ===== ITEMS API =====
export const getItems = (skip = 0, limit = 100, category_id = null, min_price = null, max_price = null) => {
  const params = new URLSearchParams();
  params.append('skip', skip);
  params.append('limit', limit);
  if (category_id) params.append('category_id', category_id);
  if (min_price) params.append('min_price', min_price);
  if (max_price) params.append('max_price', max_price);

  return api.get(`${API_ENDPOINTS.ITEMS}?${params.toString()}`);
};

export const getItemById = (id) => api.get(`${API_ENDPOINTS.ITEMS}${id}`);

export const createItem = (itemData) => api.post(API_ENDPOINTS.ITEMS, itemData);

export const updateItem = (id, itemData) => api.put(`${API_ENDPOINTS.ITEMS}${id}`, itemData);

export const deleteItem = (id) => api.delete(`${API_ENDPOINTS.ITEMS}${id}`);

// ===== CATEGORIES API =====
export const getCategories = () => api.get(API_ENDPOINTS.CATEGORIES);

export const createCategory = (categoryData) => api.post(API_ENDPOINTS.CATEGORIES, categoryData);

// ===== CART API =====
export const addToCart = (itemId, quantity = 1) => {
  const params = new URLSearchParams();
  params.append('item_id', itemId);
  return api.post(`${API_ENDPOINTS.CART}?${params.toString()}`);
};

export const getCart = () => api.get(API_ENDPOINTS.CART);

export const removeFromCart = (itemId) =>
  api.delete(`${API_ENDPOINTS.CART}${itemId}`);

export const clearCart = () =>
  api.delete(API_ENDPOINTS.CART);

// ===== ORDERS API =====
export const createOrder = (orderData) =>
  api.post(API_ENDPOINTS.ORDERS, orderData);

export const getOrders = () =>
  api.get(API_ENDPOINTS.ORDERS);

export const getOrderById = (id) =>
  api.get(`${API_ENDPOINTS.ORDERS}${id}`);

// ===== SEARCH API =====
export const searchItems = (query) =>
  api.get(`${API_ENDPOINTS.ITEMS}search?q=${encodeURIComponent(query)}`);

// ===== ADMIN API =====
export const getAdminReports = () =>
  api.get('/admin/reports/items');

export const getAdminStats = () =>
  api.get('/admin/reports/stats');

export default api;