// frontend/src/services/apiService.ts
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- Tipos --- (Puedes moverlos a un archivo types.ts)
export interface Category {
  id: string;
  name: string;
  description?: string;
  slug?: string;
  // Añade otras propiedades si tu entidad las tiene, como createdAt, updatedAt
}

interface CreateCategoryPayload { // DTO para crear
  name: string;
  description?: string;
  slug?: string;
}

interface UpdateCategoryPayload { // DTO para actualizar
  name?: string;
  description?: string;
  slug?: string;
}

// --- Auth ---
export const loginAdmin = async (credentials: { email: string; password: string }) => {
  try {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || new Error(error.message || 'Error en el login');
    }
    throw new Error('Error en el login');
  }
};

// --- Categories ---
export const getCategories = async (): Promise<Category[]> => {
  try {
    const response = await apiClient.get('/categories');
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || new Error(error.message || 'Error al obtener categorías');
    }
    throw new Error('Error al obtener categorías');
  }
};

export const createCategory = async (data: CreateCategoryPayload): Promise<Category> => {
  try {
    const response = await apiClient.post('/categories', data);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || new Error(error.message || 'Error al crear categoría');
    }
    throw new Error('Error al crear categoría');
  }
};

export const updateCategory = async (id: string, data: UpdateCategoryPayload): Promise<Category> => {
  try {
    const response = await apiClient.patch(`/categories/${id}`, data);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || new Error(error.message || 'Error al actualizar categoría');
    }
    throw new Error('Error al actualizar categoría');
  }
};

export const deleteCategory = async (id: string): Promise<{ message: string } | void> => { // El backend puede devolver void o un mensaje
  try {
    const response = await apiClient.delete(`/categories/${id}`);
    return response.data; // O simplemente no devolver nada si el backend da 204
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || new Error(error.message || 'Error al eliminar categoría');
    }
    throw new Error('Error al eliminar categoría');
  }
};

export default apiClient;