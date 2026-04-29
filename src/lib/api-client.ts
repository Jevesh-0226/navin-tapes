// API client utilities for frontend
import axios, { AxiosError } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

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

// Production API
export const productionAPI = {
  getAll: () => api.get('/production'),
  getByDate: (date: string) => api.get(`/production?date=${date}`),
  getById: (id: number) => api.get(`/production/${id}`),
  create: (data: any) => api.post('/production', data),
  update: (id: number, data: any) => api.put(`/production/${id}`, data),
  delete: (id: number) => api.delete(`/production/${id}`),
  getSummary: (startDate: string, endDate: string) =>
    api.get(`/production?summary=true&startDate=${startDate}&endDate=${endDate}`),
};

// Inward API (deprecated - use purchaseAPI instead)
export const inwardAPI = {
  getAll: () => api.get('/purchase'),
  getByDate: (date: string) => api.get(`/purchase?date=${date}`),
  getById: (id: number) => api.get(`/purchase/${id}`),
  create: (data: any) => api.post('/purchase', data),
  update: (id: number, data: any) => api.put(`/purchase/${id}`, data),
  delete: (id: number) => api.delete(`/purchase/${id}`),
  getQCDefectSummary: (startDate: string, endDate: string) =>
    api.get(`/purchase?qcDefects=true&startDate=${startDate}&endDate=${endDate}`),
};

// Purchase API
export const purchaseAPI = {
  getAll: () => api.get('/purchase'),
  getByDate: (date: string) => api.get(`/purchase?date=${date}`),
  getById: (id: number) => api.get(`/purchase/${id}`),
  create: (data: any) => api.post('/purchase', data),
  update: (id: number, data: any) => api.put(`/purchase/${id}`, data),
  delete: (id: number) => api.delete(`/purchase/${id}`),
};

// Inventory API
export const inventoryAPI = {
  getAll: () => api.get('/inventory'),
  getByDate: (date: string) => api.get(`/inventory?date=${date}`),
  getById: (id: number) => api.get(`/inventory/${id}`),
  getCurrentStock: () => api.get('/inventory?current=true'),
  create: (data: any) => api.post('/inventory', data),
  update: (id: number, data: any) => api.put(`/inventory/${id}`, data),
  delete: (id: number) => api.delete(`/inventory/${id}`),
  initializeDay: (date: string) =>
    api.post('/inventory', { _action: 'initialize_day', date }),
  aggregateProduction: (date: string) =>
    api.post('/inventory', { _action: 'aggregate_production', date }),
  updateProduction: (id: number) =>
    api.put(`/inventory/${id}`, { _action: 'update_production' }),
  updateDelivery: (id: number, delivery: number) =>
    api.put(`/inventory/${id}`, { _action: 'update_delivery', delivery }),
  getReport: (startDate: string, endDate: string) =>
    api.get(`/inventory?report=true&startDate=${startDate}&endDate=${endDate}`),
};
