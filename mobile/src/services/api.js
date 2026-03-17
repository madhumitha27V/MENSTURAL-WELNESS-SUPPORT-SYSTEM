import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Add token to requests
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error reading token:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const authService = {
  login: (phone, password) =>
    api.post('/auth/login', { phone, password }),
  
  signup: (name, phone, password) =>
    api.post('/auth/signup', { name, phone, password }),
  
  logout: async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
  },
};

export const chatService = {
  sendMessage: (message) =>
    api.post('/chat', { message }),
  
  getHistory: () =>
    api.get('/chat/history'),
};

export const cycleService = {
  getActiveCycle: () =>
    api.get('/cycle/active'),
  
  updateCycle: (data) =>
    api.post('/cycle/active', data),
  
  getSymptoms: () =>
    api.get('/cycle/symptoms'),
  
  getActiveSuggestions: () =>
    api.get('/cycle/active/suggestions'),
};

export const preCycleService = {
  getPreCycleData: () =>
    api.get('/pre-cycle'),
  
  updatePreCycleData: (data) =>
    api.post('/pre-cycle', data),
  
  getPreSuggestions: () =>
    api.get('/pre-cycle/suggestions'),
};

export const healthService = {
  checkHealth: () =>
    api.get('/health'),
};

export default api;
