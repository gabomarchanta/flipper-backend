// frontend/src/services/apiService.ts
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const apiClient = axios.create({
  baseURL: API_URL,
  // No establezcas Content-Type globalmente aquí si vas a enviar FormData y JSON
});

apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('adminToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- Tipos ---
export interface Category {
  id: string;
  name: string;
  description?: string;
  slug?: string;
  // createdAt?: string | Date;
  // updatedAt?: string | Date;
}

interface CreateCategoryPayload {
  name: string;
  description?: string;
  slug?: string;
}

interface UpdateCategoryPayload {
  name?: string;
  description?: string;
  slug?: string;
}

export interface Design {
  id: string;
  name: string;
  imageUrl: string;
  description?: string;
  imageKey?: string;
  // createdAt?: string | Date;
  // updatedAt?: string | Date;
}

// Ya no necesitamos UpdateDesignPayload si siempre enviamos FormData para la actualización de Design
// interface UpdateDesignPayload {
//     name?: string;
//     description?: string;
// }

// --- Auth ---
export const loginAdmin = async (credentials: { email: string; password: string }) => {
  try {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || new Error(error.message || 'Error en el login');
    }
    throw new Error('Error desconocido en el login');
  }
};

// --- Categories ---
export const getCategories = async (): Promise<Category[]> => {
  try {
    const response = await apiClient.get<Category[]>('/categories');
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || new Error(error.message || 'Error al obtener categorías');
    }
    throw new Error('Error desconocido al obtener categorías');
  }
};

export const createCategory = async (data: CreateCategoryPayload): Promise<Category> => {
  try {
    const response = await apiClient.post<Category>('/categories', data);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || new Error(error.message || 'Error al crear categoría');
    }
    throw new Error('Error desconocido al crear categoría');
  }
};

export const updateCategory = async (id: string, data: UpdateCategoryPayload): Promise<Category> => {
  try {
    const response = await apiClient.patch<Category>(`/categories/${id}`, data);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || new Error(error.message || 'Error al actualizar categoría');
    }
    throw new Error('Error desconocido al actualizar categoría');
  }
};

export const deleteCategory = async (id: string): Promise<{ message: string } | void> => {
  try {
    const response = await apiClient.delete(`/categories/${id}`);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || new Error(error.message || 'Error al eliminar categoría');
    }
    throw new Error('Error desconocido al eliminar categoría');
  }
};

// --- Designs ---
export const getDesigns = async (): Promise<Design[]> => {
  try {
    const response = await apiClient.get<Design[]>('/designs');
    return response.data;
  } catch (error: unknown) {
    const defaultMessage = 'Error al obtener diseños.';
    if (axios.isAxiosError(error)) {
      throw error.response?.data || new Error(error.message || defaultMessage);
    }
    throw new Error((error instanceof Error ? error.message : String(error)) || defaultMessage);
  }
};

// Función para obtener un diseño por ID (la necesitarás para la página de edición si cargas datos iniciales)
export const getDesignById = async (id: string): Promise<Design> => {
  try {
    const response = await apiClient.get<Design>(`/designs/${id}`);
    return response.data;
  } catch (error: unknown) {
    const defaultMessage = `Error al obtener el diseño ${id}.`;
    if (axios.isAxiosError(error)) {
      throw error.response?.data || new Error(error.message || defaultMessage);
    }
    throw new Error((error instanceof Error ? error.message : String(error)) || defaultMessage);
  }
};


export const createDesign = async (formData: FormData): Promise<Design> => {
  try {
    const response = await apiClient.post<Design>('/designs', formData, {
      // Axios establece Content-Type a multipart/form-data automáticamente para FormData
    });
    return response.data;
  } catch (error: unknown) {
    const defaultMessage = 'Error al crear diseño.';
    if (axios.isAxiosError(error)) {
      throw error.response?.data || new Error(error.message || defaultMessage);
    }
    throw new Error((error instanceof Error ? error.message : String(error)) || defaultMessage);
  }
};

// ----- ESTA ES LA FUNCIÓN CLAVE A MODIFICAR -----
export const updateDesign = async (id: string, data: FormData): Promise<Design> => {
  // Ahora 'data' es de tipo FormData
  try {
    const response = await apiClient.patch<Design>(`/designs/${id}`, data, {
      // Axios establece Content-Type a multipart/form-data automáticamente para FormData
    });
    return response.data;
  } catch (error: unknown) {
    const defaultMessage = `Error al actualizar el diseño ${id}.`;
    if (axios.isAxiosError(error)) {
      throw error.response?.data || new Error(error.message || defaultMessage);
    }
    throw new Error((error instanceof Error ? error.message : String(error)) || defaultMessage);
  }
};

export const deleteDesign = async (id: string): Promise<{ message: string } | void> => {
  try {
    const response = await apiClient.delete(`/designs/${id}`);
    return response.data;
  } catch (error: unknown) {
    const defaultMessage = `Error al eliminar el diseño ${id}.`;
    if (axios.isAxiosError(error)) {
      throw error.response?.data || new Error(error.message || defaultMessage);
    }
    throw new Error((error instanceof Error ? error.message : String(error)) || defaultMessage);
  }
};

export default apiClient;