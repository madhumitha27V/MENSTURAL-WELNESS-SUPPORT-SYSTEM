import axios from 'axios';

export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

export const getAuthConfig = (token) => ({
  headers: {
    authorization: token ? `Bearer ${token}` : '',
  },
});

export const getApiErrorMessage = (error, fallbackMessage) => {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  if (error?.code === 'ECONNABORTED') {
    return 'Request timed out. Please try again.';
  }

  if (!error?.response) {
    return 'Unable to connect to the server. Please check if backend is running.';
  }

  return fallbackMessage;
};

export default api;