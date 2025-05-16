// frontend/src/services/apiService.ts
import axios from 'axios'; // Necesitarás instalar axios: npm install axios

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'; // Ajusta '/api' si tu base es otra

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir el token a las peticiones
apiClient.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Funciones específicas de la API
export const loginAdmin = async (credentials: { email: string; password: string }) => {
  try {
    const response = await apiClient.post('/auth/login', credentials); // Ajusta la ruta si es solo /auth/login
    return response.data; // { accessToken: string, user: { id, email, role } }
  } catch (error: any) {
    throw error.response?.data || new Error('Error en el login');
  }
};

// Aquí añadirás más funciones para categorías, diseños, etc.
// export const getCategories = async () => { ... }
// export const createCategory = async (data) => { ... }

export default apiClient;