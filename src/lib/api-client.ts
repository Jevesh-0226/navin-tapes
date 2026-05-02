// API client utilities for frontend
import axios, { AxiosError } from 'axios';

// Use relative URLs by default (works in both dev and production)
// Only use NEXT_PUBLIC_API_URL if explicitly set
const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Error handling
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.error || error.message || 'An error occurred';
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unknown error occurred';
}

// Purchase API - Raw material purchases
export const purchaseAPI = {
  getAll: () => api.get('/purchase'),
  getByDate: (date: string) => api.get(`/purchase?date=${date}`),
  getById: (id: number) => api.get(`/purchase/${id}`),
  create: (data: any) => api.post('/purchase', data),
  update: (id: number, data: any) => api.put(`/purchase/${id}`, data),
  delete: (id: number) => api.delete(`/purchase/${id}`),
};

// Sales API - Product distribution to customers
export const salesAPI = {
  getAll: () => api.get('/sales'),
  getByDate: (date: string) => api.get(`/sales?date=${date}`),
  getById: (id: number) => api.get(`/sales/${id}`),
  create: (data: any) => api.post('/sales', data),
  update: (id: number, data: any) => api.put(`/sales/${id}`, data),
  delete: (id: number) => api.delete(`/sales/${id}`),
};

// Stock API - Central inventory ledger
export const stockAPI = {
  getAll: () => api.get('/stock'),
  getByDate: (date: string) => api.get(`/stock?date=${date}`),
  getById: (id: number) => api.get(`/stock/${id}`),
  getCurrentStock: () => api.get('/stock?current=true'),
  create: (data: any) => api.post('/stock', data),
  update: (id: number, data: any) => api.put(`/stock/${id}`, data),
  delete: (id: number) => api.delete(`/stock/${id}`),
  getReport: (startDate: string, endDate: string) =>
    api.get(`/stock?report=true&startDate=${startDate}&endDate=${endDate}`),
};

// Product API - Finished goods production
export const productAPI = {
  getAll: () => api.get('/product'),
  getByDate: (date: string) => api.get(`/product?date=${date}`),
  create: (data: any) => api.post('/product', data),
  delete: (id: number) => api.delete(`/product/${id}`),
};

// Order API
export const orderAPI = {
  getAll: () => api.get('/order'),
  getByDate: (date: string) => api.get(`/order?date=${date}`),
  getById: (id: number) => api.get(`/order/${id}`),
  create: (data: any) => api.post('/order', data),
  update: (id: number, data: any) => api.put(`/order/${id}`, data),
  delete: (id: number) => api.delete(`/order/${id}`),
};


