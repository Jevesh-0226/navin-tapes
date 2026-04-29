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

// Inward API
export const inwardAPI = {
  getAll: () => api.get('/inward'),
  getByDate: (date: string) => api.get(`/inward?date=${date}`),
  getById: (id: number) => api.get(`/inward/${id}`),
  create: (data: any) => api.post('/inward', data),
  update: (id: number, data: any) => api.put(`/inward/${id}`, data),
  delete: (id: number) => api.delete(`/inward/${id}`),
  getQCDefectSummary: (startDate: string, endDate: string) =>
    api.get(`/inward?qcDefects=true&startDate=${startDate}&endDate=${endDate}`),
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
