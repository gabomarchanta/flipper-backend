// frontend/src/services/auth.api.ts
import apiClient from './apiClient'; // Importa la instancia configurada
import axios from 'axios'; // Para isAxiosError

// Tipos (puedes moverlos a un archivo types.ts global o específico del módulo)
interface AuthCredentials {
  email: string;
  password: string;
}
export interface AuthResponse { // Exporta si lo usas en componentes
  accessToken: string;
  user: { id: string; email: string; role: string };
}

export const loginAdmin = async (credentials: AuthCredentials): Promise<AuthResponse> => {
  try {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || new Error(error.message || 'Error en el login');
    }
    throw new Error('Error desconocido en el login');
  }
};