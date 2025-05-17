// frontend/src/app/admin/(protected)/categories/page.tsx
'use client';

import React, { useState, useEffect, FormEvent, useCallback } from 'react';
import { useRouter } from 'next/navigation'; // Para router.refresh()
import { useAuth } from '../../../../contexts/AuthContext'; // Ajusta la ruta si es diferente

// Importa las funciones API específicas para categorías desde su nuevo archivo
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  // getCategoryById, // Descomenta si la necesitas para cargar datos en el modal de edición
} from '../../../../services/categories.api'; // <--- RUTA ACTUALIZADA

// Importa los TIPOS desde tu archivo global de tipos
import type { Category, CreateCategoryPayload, UpdateCategoryPayload } from '../../../../types'; // <--- RUTA AL ARCHIVO DE TIPOS

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para el formulario de crear/editar modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [slug, setSlug] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { token } = useAuth();
  const router = useRouter();

  const fetchCategories = useCallback(async () => {
    if (!token) {
      setError("No autenticado. Por favor, inicia sesión.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al cargar categorías.';
      setError(message);
      console.error("Error fetching categories:", err);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const openModalForCreate = () => {
    setCurrentCategory(null);
    setName('');
    setDescription('');
    setSlug('');
    setFormError(null);
    setIsModalOpen(true);
  };

  const openModalForEdit = (category: Category) => {
    setCurrentCategory(category);
    setName(category.name);
    setDescription(category.description || '');
    setSlug(category.slug || '');
    setFormError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    // Resetear estados al cerrar
    setCurrentCategory(null);
    setName('');
    setDescription('');
    setSlug('');
    setFormError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) {
      setFormError("No autenticado.");
      return;
    }
    setIsSubmitting(true);
    setFormError(null);

    // Usar los tipos importados para el payload
    const payload: CreateCategoryPayload | UpdateCategoryPayload = {
      name,
      description: description || undefined,
      slug: slug || undefined,
    };

    try {
      if (currentCategory) {
        await updateCategory(currentCategory.id, payload as UpdateCategoryPayload); // Cast a UpdateCategoryPayload
        alert('Categoría actualizada con éxito!');
      } else {
        await createCategory(payload as CreateCategoryPayload); // Cast a CreateCategoryPayload
        alert('Categoría creada con éxito!');
      }
      router.refresh(); // Revalida los datos del servidor para la ruta actual
      await fetchCategories();
      closeModal();
    } catch (err: any) {
      setFormError(err.response?.data?.message || err.message || 'Error al guardar la categoría.');
      console.error("Error saving category:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!token) return;
    if (window.confirm('¿Estás seguro de que quieres eliminar esta categoría?')) {
      setIsLoading(true); // Considera un estado de carga específico para la eliminación
      try {
        await deleteCategory(id);
        alert('Categoría eliminada con éxito');
        router.refresh();
        await fetchCategories();
      } catch (err: any) {
        setError(err.response?.data?.message || err.message || 'Error al eliminar la categoría.');
        console.error("Error deleting category:", err);
      } finally {
        // Si usaste un estado de carga específico para delete, ponlo en false aquí
        // setIsLoading(false); // Solo si isLoading se usa para esto específicamente
        // Si no, fetchCategories se llamará por router.refresh y manejará isLoading
      }
    }
  };

  if (isLoading && categories.length === 0) return <p className="p-8 text-center">Cargando categorías...</p>;
  if (error && categories.length === 0) return <p className="p-8 text-red-500 text-center">Error: {error}</p>;

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-brand-black">Gestionar Categorías</h1>
        <button
          onClick={openModalForCreate}
          className="bg-brand-red text-brand-white py-2 px-5 rounded-md hover:bg-brand-red-dark transition-colors font-semibold"
        >
          Nueva Categoría
        </button>
      </div>

      {isLoading && categories.length > 0 && <p className="text-center py-4">Actualizando lista...</p>}
      <div className="bg-white shadow-lg rounded-lg overflow-x-auto"> {/* overflow-x-auto para tablas anchas */}
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {!isLoading && categories.length === 0 && !error && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                  No hay categorías creadas. ¡Añade la primera!
                </td>
              </tr>
            )}
            {categories.map((category) => (
              <tr key={category.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{category.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{category.slug}</td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={category.description}>
                  {category.description || <span className="italic text-gray-400">Sin descripción</span>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                  <button
                    onClick={() => openModalForEdit(category)}
                    className="text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="text-red-600 hover:text-red-800 transition-colors"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal para Crear/Editar Categoría */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 overflow-y-auto h-full w-full flex items-center justify-center z-50 p-4 transition-opacity duration-300 ease-in-out">
          <div className="relative bg-white p-6 md:p-8 rounded-lg shadow-xl w-full max-w-lg mx-auto transform transition-all duration-300 ease-in-out scale-100">
            <button onClick={closeModal} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-2xl">×</button>
            <h2 className="text-2xl font-bold text-brand-black mb-6">
              {currentCategory ? 'Editar Categoría' : 'Nueva Categoría'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {formError && <p className="mb-3 text-sm text-red-600 bg-red-100 p-3 rounded-md">{formError}</p>}
              <div>
                <label htmlFor="cat-name" className="block text-sm font-medium text-gray-700 mb-1">Nombre <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  id="cat-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-red focus:border-brand-red sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="cat-slug" className="block text-sm font-medium text-gray-700 mb-1">Slug (Opcional)</label>
                <input
                  type="text"
                  id="cat-slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="ej: remeras-de-verano (se genera si se deja vacío)"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-red focus:border-brand-red sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="cat-desc" className="block text-sm font-medium text-gray-700 mb-1">Descripción (Opcional)</label>
                <textarea
                  id="cat-desc"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-red focus:border-brand-red sm:text-sm"
                />
              </div>
              <div className="flex items-center justify-end space-x-3 pt-4 border-t mt-6">
                <button type="button" onClick={closeModal} disabled={isSubmitting} className="bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors font-medium disabled:opacity-70">
                  Cancelar
                </button>
                <button type="submit" disabled={isSubmitting} className="bg-brand-red text-brand-white py-2 px-5 rounded-md hover:bg-brand-red-dark transition-colors font-semibold disabled:opacity-70">
                  {isSubmitting ? (currentCategory ? 'Guardando...' : 'Creando...') : (currentCategory ? 'Guardar Cambios' : 'Crear Categoría')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}