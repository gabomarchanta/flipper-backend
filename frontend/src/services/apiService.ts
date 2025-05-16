// frontend/src/services/apiService.ts
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const apiClient = axios.create({
  baseURL: API_URL,
  // headers: {
  //  'Content-Type': 'application/json',
  //},
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

export interface Design { // Nuevo tipo para Design
  id: string;
  name: string;
  imageUrl: string;
  description?: string;
  imageKey?: string; // Útil si quieres implementar borrado de S3 desde el frontend/backend
}

// Para UpdateDesignPayload, podrías crear uno similar o reutilizar parte de CreateDesignPayload
// si la actualización de imagen se maneja por separado o no se implementa de inmediato.
interface UpdateDesignPayload {
    name?: string;
    description?: string;
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

// --- Designs ---
export const getDesigns = async (): Promise<Design[]> => {
  try {
    const response = await apiClient.get('/designs');
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data || new Error(error.message || 'Error al obtener diseños');
    }
    throw new Error((error instanceof Error ? error.message : String(error)) || 'Error al obtener diseños');
  }
};

export const createDesign = async (formData: FormData): Promise<Design> => {
  // Cuando envías FormData, axios y el navegador configuran el Content-Type automáticamente.
  // No necesitas 'Content-Type': 'application/json' para esta petición específica.
  // El interceptor aún añadirá el token de autorización si está presente.
  try {
    const response = await apiClient.post('/designs', formData, {
      headers: {
        // Deja que Axios/navegador establezcan el Content-Type para FormData
        // 'Content-Type': 'multipart/form-data', // No es necesario explícitamente con Axios y FormData
      },
    });
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data || new Error(error.message || 'Error al crear diseño');
    }
    throw new Error((error instanceof Error ? error.message : String(error)) || 'Error al crear diseño');
  }
};

export const updateDesign = async (id: string, data: UpdateDesignPayload /*, file?: File */): Promise<Design> => {
  // La actualización con archivo es más compleja, por ahora solo datos de texto
  try {
    // Si fueras a enviar un archivo también, necesitarías FormData aquí también
    const response = await apiClient.patch(`/designs/${id}`, data);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data || new Error(error.message || 'Error al actualizar diseño');
    }
    throw new Error((error instanceof Error ? error.message : String(error)) || 'Error al actualizar diseño');
  }
};

export const deleteDesign = async (id: string): Promise<{ message: string } | void> => {
  try {
    const response = await apiClient.delete(`/designs/${id}`);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data || new Error(error.message || 'Error al eliminar diseño');
    }
    throw new Error((error instanceof Error ? error.message : String(error)) || 'Error al eliminar diseño');
  }
};

export default apiClient;