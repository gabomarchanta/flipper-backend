// frontend/src/types/index.ts

// --- Auth Types ---
export interface AuthUser {
  id: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}

// --- Category Types ---
export interface Category {
  id: string;
  name: string;
  description?: string;
  slug?: string;
  // createdAt?: string | Date; // Opcional, si los usas
  // updatedAt?: string | Date; // Opcional, si los usas
}

export interface CreateCategoryPayload {
  name: string;
  description?: string;
  slug?: string;
}

export interface UpdateCategoryPayload {
  name?: string;
  description?: string;
  slug?: string;
}

// --- Design Types ---
export interface Design {
  id: string;
  name: string;
  imageUrl: string;
  description?: string;
  imageKey?: string;
  // createdAt?: string | Date;
  // updatedAt?: string | Date;
}

// No necesitamos CreateDesignPayload o UpdateDesignPayload aquí si siempre usamos FormData
// y los campos de texto se extraen del FormData en el backend.
// Si necesitaras enviar JSON para actualizar solo texto, podrías definir un UpdateDesignTextPayload.

// --- Color Types ---
export interface Color {
  id: string;
  name: string;
  hex_code: string;
}

export interface CreateColorPayload {
  name: string;
  hex_code: string;
}

export interface UpdateColorPayload {
  name?: string;
  hex_code?: string;
}

// --- Product & Variant Types ---
export interface ProductVariant {
  id: string;
  // productId: string; // Usualmente no es necesario en el DTO de respuesta si está anidado
  color?: Color; // Si la relación es eager y se incluye el objeto Color
  colorId?: string; // O solo el ID
  size: string;
  stock_quantity: number;
  additional_price: number;
  mockup_image_url?: string;
  mockup_image_key?: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  base_price: number;
  category?: Category; // Si la relación es eager
  categoryId?: string;
  design?: Design; // Si la relación es eager
  designId?: string;
  variants: ProductVariant[];
  is_active: boolean;
  createdAt: string | Date; // O Date
  updatedAt: string | Date; // O Date
}

// DTOs para crear/actualizar productos
export interface CreateProductVariantDtoForApi { // Renombrado para evitar conflicto con el DTO del backend
  colorId: string;
  size: string;
  stock_quantity: number;
  additional_price?: number;
}

export interface CreateProductPayload {
  name: string;
  description?: string;
  base_price: number;
  categoryId?: string;
  designId?: string;
  variants: CreateProductVariantDtoForApi[];
  is_active?: boolean;
}

export interface UpdateProductPayload { // Muy similar a Create, pero campos opcionales
  name?: string;
  description?: string;
  base_price?: number;
  categoryId?: string | null; // Permitir null para desasociar
  designId?: string | null;   // Permitir null para desasociar
  // La actualización de variantes es compleja, usualmente se maneja con endpoints dedicados
  // o una lógica más elaborada en el servicio backend.
  // Por ahora, este DTO no incluye la actualización directa de variantes.
  is_active?: boolean;
}