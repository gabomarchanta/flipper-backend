// frontend/src/services/apiClient.ts
import axios from 'axios'; // axios es un valor y un tipo

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const apiClient = axios.create({
  baseURL: API_URL,
});

apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('adminToken');
      if (token) {
        // AxiosRequestConfig['headers'] es el tipo, pero aquí estamos modificando el objeto config
        if (config.headers) { // Asegurarse de que headers exista
            config.headers.Authorization = `Bearer ${token}`;
        }
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient;