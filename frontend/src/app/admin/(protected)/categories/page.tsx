// frontend/src/app/admin/(protected)/categories/page.tsx
'use client';

import React, { useState, useEffect, FormEvent } from 'react';
// Asumiremos que crearás estas funciones en apiService.ts
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  Category, // Importa el tipo Category si lo defines en apiService o en un archivo de tipos
} from '../../../../services/apiService'; // Ajusta la ruta a tu apiService
import { useAuth } from '../../../../contexts/AuthContext'; // Ajusta la ruta

// Define el tipo Category aquí o impórtalo si lo tienes centralizado
// export interface Category {
//   id: string;
//   name: string;
//   description?: string;
//   slug?: string;
// }

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para el formulario de crear/editar
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null); // Para editar
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [slug, setSlug] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { token } = useAuth(); // Para verificar si el token está disponible antes de las llamadas

  const fetchCategories = React.useCallback(async () => {
    if (!token) return; // No hacer fetch si no hay token (aunque el layout debería proteger)
    setIsLoading(true);
    setError(null);
    try {
      const data = await getCategories(); // Asume que getCategories ya usa el token del interceptor
      setCategories(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Error al cargar categorías.');
      } else {
        setError('Error al cargar categorías.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]); // Vuelve a hacer fetch si el token cambia (ej. después del login)
  
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
    setCurrentCategory(null); // Limpiar
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) {
        setFormError("No autenticado.");
        return;
    }
    setIsSubmitting(true);
    setFormError(null);
    const categoryData = { name, description, slug: slug || undefined }; // Enviar slug solo si tiene valor

    try {
      if (currentCategory) {
        // Editar
        await updateCategory(currentCategory.id, categoryData);
      } else {
        // Crear
        await createCategory(categoryData);
      }
      fetchCategories(); // Recargar la lista
      closeModal();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setFormError(err.message || 'Error al guardar la categoría.');
      } else {
        setFormError('Error al guardar la categoría.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!token) return;
    if (window.confirm('¿Estás seguro de que quieres eliminar esta categoría?')) {
      try {
        await deleteCategory(id);
        fetchCategories(); // Recargar la lista
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message || 'Error al eliminar la categoría.');
        } else {
          setError('Error al eliminar la categoría.');
        }
      }
    }
  };

  if (isLoading) return <p className="p-8">Cargando categorías...</p>;
  if (error) return <p className="p-8 text-red-500">Error: {error}</p>;

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-brand-black">Gestionar Categorías</h1>
        <button
          onClick={openModalForCreate}
          className="bg-brand-red text-brand-white py-2 px-5 rounded hover:bg-brand-red-dark transition-colors font-semibold"
        >
          Nueva Categoría
        </button>
      </div>

      {/* Lista de Categorías */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {categories.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                  No hay categorías creadas.
                </td>
              </tr>
            )}
            {categories.map((category) => (
              <tr key={category.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{category.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{category.slug}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate">
                  {category.description || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => openModalForEdit(category)}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="text-red-600 hover:text-red-900"
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
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
          <div className="relative bg-white p-8 rounded-lg shadow-xl w-full max-w-lg mx-auto">
            <h2 className="text-2xl font-bold text-brand-black mb-6">
              {currentCategory ? 'Editar Categoría' : 'Nueva Categoría'}
            </h2>
            <form onSubmit={handleSubmit}>
              {formError && <p className="mb-4 text-sm text-red-500 bg-red-100 p-2 rounded">{formError}</p>}
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-red focus:border-brand-red sm:text-sm"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">Slug (Opcional)</label>
                <input
                  type="text"
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="ej: remeras-verano (se genera si se deja vacío)"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-red focus:border-brand-red sm:text-sm"
                />
              </div>
              <div className="mb-6">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Descripción (Opcional)</label>
                <textarea
                  id="description"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-red focus:border-brand-red sm:text-sm"
                />
              </div>
              <div className="flex items-center justify-end space-x-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="bg-gray-200 text-gray-700 py-2 px-4 rounded hover:bg-gray-300 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-brand-red text-brand-white py-2 px-5 rounded hover:bg-brand-red-dark transition-colors font-semibold disabled:opacity-50"
                >
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