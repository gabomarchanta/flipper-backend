// frontend/src/services/categories.api.ts
import apiClient from './apiClient';
import axios from 'axios';
import type { Category, CreateCategoryPayload, UpdateCategoryPayload } from '../types'; // Importa tipos

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

export const getCategoryById = async (idOrSlug: string): Promise<Category> => {
  try {
    const response = await apiClient.get<Category>(`/categories/${idOrSlug}`);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || new Error(error.message || 'Error al obtener la categoría.');
    }
    throw new Error('Error desconocido al obtener la categoría.');
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
    return response.data; // O nada si es 204
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || new Error(error.message || 'Error al eliminar categoría');
    }
    throw new Error('Error desconocido al eliminar categoría');
  }
};