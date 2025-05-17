// frontend/src/services/colors.api.ts
import apiClient from './apiClient';
import axios from 'axios';
import type { Color, CreateColorPayload, UpdateColorPayload } from '../types'; // Importa tipos

export const getColors = async (): Promise<Color[]> => {
  try {
    const response = await apiClient.get<Color[]>('/colors');
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || new Error(error.message || 'Error al obtener colores');
    }
    throw new Error('Error desconocido al obtener colores');
  }
};

export const getColorById = async (id: string): Promise<Color> => {
  try {
    const response = await apiClient.get<Color>(`/colors/${id}`);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || new Error(error.message || 'Error al obtener el color.');
    }
    throw new Error('Error desconocido al obtener el color.');
  }
};

export const createColor = async (data: CreateColorPayload): Promise<Color> => {
  try {
    const response = await apiClient.post<Color>('/colors', data);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || new Error(error.message || 'Error al crear color');
    }
    throw new Error('Error desconocido al crear color');
  }
};

export const updateColor = async (id: string, data: UpdateColorPayload): Promise<Color> => {
  try {
    const response = await apiClient.patch<Color>(`/colors/${id}`, data);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || new Error(error.message || 'Error al actualizar color');
    }
    throw new Error('Error desconocido al actualizar color');
  }
};

export const deleteColor = async (id: string): Promise<{ message: string } | void> => {
  try {
    const response = await apiClient.delete(`/colors/${id}`);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || new Error(error.message || 'Error al eliminar color');
    }
    throw new Error('Error desconocido al eliminar color');
  }
};