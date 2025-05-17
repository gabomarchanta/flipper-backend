// frontend/src/app/admin/(protected)/colors/page.tsx
'use client';

import React, { useState, useEffect, FormEvent, ChangeEvent, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../contexts/AuthContext';

// Importa las funciones API específicas para colores
import {
  getColors,
  createColor,
  updateColor,
  deleteColor,
} from '../../../../services/colors.api'; // Asegúrate que esta ruta sea correcta

// Importa los TIPOS desde tu archivo global de tipos
import type { Color, CreateColorPayload, UpdateColorPayload } from '../../../../types';

export default function AdminColorsPage() {
  const [colors, setColors] = useState<Color[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para el modal/formulario
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentColor, setCurrentColor] = useState<Color | null>(null);
  const [name, setName] = useState('');
  const [hexCode, setHexCode] = useState('#000000'); // Default a negro
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { token } = useAuth();
  const router = useRouter();

  const fetchColors = useCallback(async () => {
    if (!token) {
      setError("No autenticado.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await getColors();
      setColors(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar colores.');
      console.error("Error fetching colors:", err);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchColors();
  }, [fetchColors]);

  const openModalForCreate = () => {
    setCurrentColor(null);
    setName('');
    setHexCode('#000000'); // Reset a un color por defecto
    setFormError(null);
    setIsModalOpen(true);
  };

  const openModalForEdit = (color: Color) => {
    setCurrentColor(color);
    setName(color.name);
    setHexCode(color.hex_code);
    setFormError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentColor(null);
    setName('');
    setHexCode('#000000');
    setFormError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) {
      setFormError("No autenticado.");
      return;
    }
    if (!name.trim() || !hexCode.trim()) {
        setFormError("Nombre y código hexadecimal son requeridos.");
        return;
    }
    // Validación simple de formato hexadecimal (puedes mejorarla)
    if (!/^#([0-9A-Fa-f]{3}){1,2}$/.test(hexCode)) {
        setFormError("Formato de código hexadecimal inválido (ej: #RGB o #RRGGBB).");
        return;
    }

    setIsSubmitting(true);
    setFormError(null);

    const payload: CreateColorPayload | UpdateColorPayload = {
      name,
      hex_code: hexCode.toUpperCase(), // Guardar en mayúsculas por consistencia
    };

    try {
      if (currentColor) {
        await updateColor(currentColor.id, payload as UpdateColorPayload);
        alert('Color actualizado con éxito!');
      } else {
        await createColor(payload as CreateColorPayload);
        alert('Color creado con éxito!');
      }
      router.refresh(); // Revalida datos del servidor
      await fetchColors(); // Opcional: si router.refresh() no es suficiente
      closeModal();
    } catch (err: any) {
      setFormError(err.response?.data?.message || err.message || 'Error al guardar el color.');
      console.error("Error saving color:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!token) return;
    if (window.confirm('¿Estás seguro de que quieres eliminar este color? Esto podría afectar variantes de productos existentes.')) {
      setIsLoading(true);
      try {
        await deleteColor(id);
        alert('Color eliminado con éxito');
        router.refresh();
        await fetchColors(); // Opcional
      } catch (err: any) {
        setError(err.response?.data?.message || err.message || 'Error al eliminar el color.');
        console.error("Error deleting color:", err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (isLoading && colors.length === 0) return <p className="p-8 text-center">Cargando colores...</p>;
  if (error && colors.length === 0) return <p className="p-8 text-red-500 text-center">Error: {error}</p>;

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-brand-black">Gestionar Colores</h1>
        <button
          onClick={openModalForCreate}
          className="bg-brand-red text-brand-white py-2 px-5 rounded-md hover:bg-brand-red-dark transition-colors font-semibold"
        >
          Nuevo Color
        </button>
      </div>

      {isLoading && colors.length > 0 && <p className="text-center py-4">Actualizando lista...</p>}
      <div className="bg-white shadow-lg rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Muestra</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código Hex</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {!isLoading && colors.length === 0 && !error && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                  No hay colores creados. ¡Añade el primero!
                </td>
              </tr>
            )}
            {colors.map((color) => (
              <tr key={color.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div style={{ backgroundColor: color.hex_code, width: '24px', height: '24px', borderRadius: '50%', border: '1px solid #ccc' }}></div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{color.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{color.hex_code}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                  <button
                    onClick={() => openModalForEdit(color)}
                    className="text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(color.id)}
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

      {/* Modal para Crear/Editar Color */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 overflow-y-auto h-full w-full flex items-center justify-center z-50 p-4">
          <div className="relative bg-white p-6 md:p-8 rounded-lg shadow-xl w-full max-w-md mx-auto">
            <button onClick={closeModal} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-2xl">×</button>
            <h2 className="text-2xl font-bold text-brand-black mb-6">
              {currentColor ? 'Editar Color' : 'Nuevo Color'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {formError && <p className="mb-3 text-sm text-red-600 bg-red-100 p-3 rounded-md">{formError}</p>}
              <div>
                <label htmlFor="color-name" className="block text-sm font-medium text-gray-700 mb-1">Nombre del Color <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  id="color-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-red focus:border-brand-red sm:text-sm"
                />
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex-grow">
                  <label htmlFor="color-hex" className="block text-sm font-medium text-gray-700 mb-1">Código Hexadecimal <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    id="color-hex"
                    value={hexCode}
                    onChange={(e) => setHexCode(e.target.value.toUpperCase())}
                    required
                    placeholder="#RRGGBB"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-red focus:border-brand-red sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="color-picker" className="block text-sm font-medium text-gray-700 mb-1">Selector</label>
                  <input
                    type="color" // Input de tipo color para una selección visual
                    id="color-picker"
                    value={hexCode} // Enlaza con el estado hexCode
                    onChange={(e) => setHexCode(e.target.value.toUpperCase())}
                    className="mt-1 h-10 w-16 p-0 border border-gray-300 rounded-md cursor-pointer" // Estilos para el input color
                  />
                </div>
              </div>
              <div className="flex items-center justify-end space-x-3 pt-4 border-t mt-6">
                <button type="button" onClick={closeModal} disabled={isSubmitting} className="bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors font-medium disabled:opacity-70">
                  Cancelar
                </button>
                <button type="submit" disabled={isSubmitting} className="bg-brand-red text-brand-white py-2 px-5 rounded-md hover:bg-brand-red-dark transition-colors font-semibold disabled:opacity-70">
                  {isSubmitting ? (currentColor ? 'Guardando...' : 'Creando...') : (currentColor ? 'Guardar Cambios' : 'Crear Color')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}