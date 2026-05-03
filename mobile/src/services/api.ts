import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const api = axios.create({
  baseURL: Platform.OS === 'web' 
    ? 'http://127.0.0.1:5001/api/' 
    : 'http://192.168.0.101:5001/api/',
  timeout: 30000,
});

export const authApi = {
  sendOTP: (phoneNumber: string) => api.post('auth/otp/send', { phoneNumber }),
  verifyOTP: (phoneNumber: string, otp: string) => api.post('auth/otp/verify', { phoneNumber, otp }),
};

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('klb_token');
  const tenantId = await AsyncStorage.getItem('klb_tenant_id');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  if (tenantId) {
    config.headers['x-tenant-id'] = tenantId;
  }

  // Set default Content-Type for JSON if not already set (e.g. by FormData)
  if (!config.headers['Content-Type'] && !(config.data instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json';
  }
  
  console.log(`🚀 [API Request] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('❌ [API Error]', {
      message: error.message,
      url: `${error.config?.baseURL}${error.config?.url}`,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data
    });
    return Promise.reject(error);
  }
);

export const unitApi = {
  search: (query: string) => api.get(`admin/users/search?q=${query}`),
  list: () => api.get('admin/units'),
};

export const visitorApi = {
  create: (data: any) => api.post('visitors/entries', data),
  requestEntry: (data: any) => api.post('visitors/entries', data),
  approve: (data: { entryId: string, status: string }) => api.post('entries/approve', data),
  checkIn: (entryId: string) => api.post(`entries/${entryId}/checkin`),
  checkOut: (entryId: string) => api.post('entries/checkout', { entryId }),
  getPending: () => api.get('entries/pending'),
  getUnitEntries: (unit: string) => api.get(`entries/unit/${unit}`),
  getMyUnitEntries: () => api.get('entries/my-unit'),
  getAll: () => api.get('entries/all'),
  createPreApproved: (data: any) => api.post('visitors/pre-approved', data),
  getPreApproved: () => api.get('visitors/pre-approved'),
  verifyPreApproved: (code: string) => api.get(`visitors/pre-approved/verify/${code}`),
};

export const mediaApi = {
  upload: (formData: FormData) => api.post('media/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
};

export default api;
