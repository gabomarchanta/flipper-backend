// frontend/src/services/products.api.ts
import apiClient from './apiClient';
import axios from 'axios';
import type { Product, CreateProductPayload, UpdateProductPayload } from '../types'; // Importa tipos

export const getProducts = async (): Promise<Product[]> => {
  try {
    const response = await apiClient.get<Product[]>('/products');
    return response.data;
  } catch (error: unknown) {
    const defaultMessage = 'Error al obtener productos.';
    if (axios.isAxiosError(error)) {
      throw error.response?.data || new Error(error.message || defaultMessage);
    }
    throw new Error((error instanceof Error ? error.message : String(error)) || defaultMessage);
  }
};

export const getProductById = async (id: string): Promise<Product> => {
  try {
    const response = await apiClient.get<Product>(`/products/${id}`);
    return response.data;
  } catch (error: unknown) {
    const defaultMessage = `Error al obtener el producto ${id}.`;
    if (axios.isAxiosError(error)) {
      throw error.response?.data || new Error(error.message || defaultMessage);
    }
    throw new Error((error instanceof Error ? error.message : String(error)) || defaultMessage);
  }
};

export const createProduct = async (data: CreateProductPayload): Promise<Product> => {
  // Nota: La creación de productos en el backend espera un DTO JSON,
  // y la subida de mockups se maneja internamente en el backend por ahora.
  // Si el endpoint de creación de productos esperara FormData para una imagen principal del producto,
  // este 'data' debería ser FormData.
  try {
    const response = await apiClient.post<Product>('/products', data);
    return response.data;
  } catch (error: unknown) {
    const defaultMessage = 'Error al crear producto.';
    if (axios.isAxiosError(error)) {
      throw error.response?.data || new Error(error.message || defaultMessage);
    }
    throw new Error((error instanceof Error ? error.message : String(error)) || defaultMessage);
  }
};

export const updateProduct = async (id: string, data: UpdateProductPayload): Promise<Product> => {
  // Similar a createProduct, asume que el backend espera JSON para actualizar datos del producto.
  // La actualización de imágenes de variantes o mockups se manejaría por separado o en el backend.
  try {
    const response = await apiClient.patch<Product>(`/products/${id}`, data);
    return response.data;
  } catch (error: unknown) {
    const defaultMessage = `Error al actualizar el producto ${id}.`;
    if (axios.isAxiosError(error)) {
      throw error.response?.data || new Error(error.message || defaultMessage);
    }
    throw new Error((error instanceof Error ? error.message : String(error)) || defaultMessage);
  }
};

export const deleteProduct = async (id: string): Promise<{ message: string } | void> => {
  try {
    const response = await apiClient.delete(`/products/${id}`);
    return response.data;
  } catch (error: unknown) {
    const defaultMessage = `Error al eliminar el producto ${id}.`;
    if (axios.isAxiosError(error)) {
      throw error.response?.data || new Error(error.message || defaultMessage);
    }
    throw new Error((error instanceof Error ? error.message : String(error)) || defaultMessage);
  }
};

// Aquí podrías añadir funciones para gestionar variantes de producto si tienes endpoints dedicados
// ej: addProductVariant(productId: string, variantData: CreateProductVariantDtoForApi): Promise<ProductVariant>
// ej: updateProductVariant(productId: string, variantId: string, variantData: UpdateProductVariantDto): Promise<ProductVariant>
// ej: deleteProductVariant(productId: string, variantId: string): Promise<void>