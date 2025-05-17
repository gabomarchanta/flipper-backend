// frontend/src/services/designs.api.ts
import apiClient from './apiClient';
import axios from 'axios';
import type { Design } from '../types';

// Tipos (considera un archivo types.ts)
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
    const response = await apiClient.post<Design>('/designs', formData);
    return response.data;
  } catch (error: unknown) {
    const defaultMessage = 'Error al crear diseño.';
    if (axios.isAxiosError(error)) {
      throw error.response?.data || new Error(error.message || defaultMessage);
    }
    throw new Error((error instanceof Error ? error.message : String(error)) || defaultMessage);
  }
};

export const updateDesign = async (id: string, formData: FormData): Promise<Design> => {
  try {
    const response = await apiClient.patch<Design>(`/designs/${id}`, formData);
    return response.data;
  } catch (error: unknown) {
    const defaultMessage = `Error al actualizar el diseño ${id}.`;
    if (axios.isAxiosError(error)) {
      throw error.response?.data || new Error(error.message || defaultMessage);
    }
    throw new Error((error instanceof Error ? error.message : String(error)) || defaultMessage);
  }
};

export const deleteDesign = async (id: string): Promise<void> => { // O { message: string }
  try {
    await apiClient.delete(`/designs/${id}`);
  } catch (error: unknown) {
    const defaultMessage = `Error al eliminar el diseño ${id}.`;
    if (axios.isAxiosError(error)) {
      throw error.response?.data || new Error(error.message || defaultMessage);
    }
    throw new Error((error instanceof Error ? error.message : String(error)) || defaultMessage);
  }
};