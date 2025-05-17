// frontend/src/app/admin/(protected)/designs/page.tsx
'use client';

import React, { useState, useEffect, FormEvent, ChangeEvent, useCallback } from 'react';
import {
  getDesigns,
  createDesign,
  updateDesign,
  deleteDesign,
  // Design, // Quita Design de aquí si lo importas desde ../../types
  getDesignById,
} from '../../../../services/designs.api'; // Ruta al nuevo archivo
import type { Design } from '../../../../types';
import { useAuth } from '../../../../contexts/AuthContext'; // Ajusta la ruta si es necesario
import Image from 'next/image';
import { useRouter } from 'next/navigation'; // Para router.refresh()

// Si no tienes el tipo Design en apiService, puedes definirlo aquí o en un archivo types.ts
// interface Design {
//   id: string;
//   name: string;
//   description?: string;
//   imageUrl: string;
//   imageKey?: string; // Si lo devuelves del backend
//   createdAt?: string; // O Date
//   updatedAt?: string; // O Date
// }

export default function AdminDesignsPage() {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para el formulario de crear/editar modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentDesign, setCurrentDesign] = useState<Design | null>(null); // Para saber si estamos editando o creando
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null); // Para previsualizar la imagen actual o la nueva
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { token } = useAuth(); // Para asegurar que el usuario está autenticado
  const router = useRouter(); // Para usar router.refresh()

  const fetchDesigns = useCallback(async () => {
    if (!token) {
      // Podrías redirigir al login si no hay token, o el layout protector debería hacerlo
      setError("No autenticado. Por favor, inicia sesión.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await getDesigns();
      setDesigns(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al cargar diseños.';
      setError(message);
      console.error("Error fetching designs:", err);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchDesigns();
  }, [fetchDesigns]); // Se ejecuta al montar y cuando fetchDesigns (y por ende token) cambia

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string); // Muestra preview de la imagen seleccionada
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedFile(null);
      // Si se deselecciona un archivo, volver a mostrar la imagen actual del diseño si estamos editando
      setPreviewImage(currentDesign ? currentDesign.imageUrl : null);
    }
  };

  const openModalForCreate = () => {
    setCurrentDesign(null); // Indica que es creación
    setName('');
    setDescription('');
    setSelectedFile(null);
    setPreviewImage(null);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openModalForEdit = (design: Design) => {
    setCurrentDesign(design); // Indica que es edición y guarda el diseño actual
    setName(design.name);
    setDescription(design.description || '');
    setSelectedFile(null); // Limpiar selección de archivo anterior
    setPreviewImage(design.imageUrl); // Mostrar la imagen actual del diseño
    setFormError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    // Resetear estados del formulario al cerrar podría ser buena idea
    setCurrentDesign(null);
    setName('');
    setDescription('');
    setSelectedFile(null);
    setPreviewImage(null);
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

    const formData = new FormData();
    formData.append('name', name);
    if (description) { // Solo añadir si tiene valor, para no enviar 'undefined' como string
      formData.append('description', description);
    }

    if (currentDesign) { // --- MODO EDICIÓN ---
      if (selectedFile) { // Si se seleccionó un nuevo archivo para la edición
        formData.append('file', selectedFile);
      }
      // Si no hay selectedFile, el backend NO debería esperar un campo 'file'.
      // Tu backend `DesignsService.update` ya maneja 'file' como opcional.
      try {
        await updateDesign(currentDesign.id, formData);
        alert('Diseño actualizado con éxito!');
        // fetchDesigns(); // Vuelve a obtener la lista (Opción A)
        router.refresh(); // Revalida datos del servidor para esta ruta (Opción B - Preferida con App Router)
        await fetchDesigns();
        closeModal();
      } catch (err: any) {
        setFormError(err.response?.data?.message || err.message || 'Error al actualizar el diseño.');
        console.error("Error updating design:", err);
      }
    } else { // --- MODO CREACIÓN ---
      if (!selectedFile) {
        setFormError('Por favor, selecciona un archivo de imagen para el nuevo diseño.');
        setIsSubmitting(false);
        return;
      }
      formData.append('file', selectedFile);

      try {
        await createDesign(formData);
        alert('Diseño creado con éxito!');
        // fetchDesigns(); // Vuelve a obtener la lista (Opción A)
        router.refresh(); // Revalida datos del servidor (Opción B)
        await fetchDesigns();
        closeModal();
      } catch (err: any) {
        setFormError(err.response?.data?.message || err.message || 'Error al crear el diseño.');
        console.error("Error creating design:", err);
      }
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (!token) return;
    if (window.confirm('¿Estás seguro de que quieres eliminar este diseño? Esto podría afectar productos existentes.')) {
      setIsLoading(true); // Para feedback visual
      try {
        await deleteDesign(id);
        alert('Diseño eliminado con éxito');
        // fetchDesigns(); // (Opción A)
        router.refresh(); // (Opción B)
        await fetchDesigns();
      } catch (err: any) {
        setError(err.response?.data?.message || err.message || 'Error al eliminar el diseño.');
        console.error("Error deleting design:", err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Renderizado condicional mientras carga o si hay error
  if (isLoading && designs.length === 0) return <p className="p-8 text-center">Cargando diseños...</p>;
  if (error && designs.length === 0) return <p className="p-8 text-red-500 text-center">Error: {error}</p>;

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-brand-black">Gestionar Diseños</h1>
        <button
          onClick={openModalForCreate}
          className="bg-brand-red text-brand-white py-2 px-5 rounded hover:bg-brand-red-dark transition-colors font-semibold"
        >
          Nuevo Diseño
        </button>
      </div>

      {/* Lista de Diseños */}
      {isLoading && designs.length > 0 && <p className="text-center py-4">Actualizando lista...</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {!isLoading && designs.length === 0 && !error && (
          <p className="col-span-full text-center text-gray-500 py-10">No hay diseños creados. ¡Añade el primero!</p>
        )}
        {designs.map((design) => (
          <div key={design.id} className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col">
            {design.imageUrl ? (
              <div className="w-full h-56 relative bg-gray-200"> {/* Altura fija para consistencia */}
                <Image
                  src={design.imageUrl}
                  alt={design.name || 'Diseño sin nombre'}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw" // Ejemplo de sizes, ajusta
                  style={{ objectFit: 'contain' }} // 'contain' para ver todo el diseño, 'cover' para llenar
                  priority={designs.indexOf(design) < 4} // Carga prioritaria para las primeras imágenes
                  onError={(e) => { console.error(`Error cargando imagen: ${design.imageUrl}`, e.currentTarget.currentSrc); e.currentTarget.style.display = 'none'; /* O mostrar placeholder */ }}
                />
              </div>
            ) : (
              <div className="w-full h-56 bg-gray-200 flex items-center justify-center text-gray-400">
                Sin imagen
              </div>
            )}
            <div className="p-4 flex flex-col flex-grow">
              <h3 className="text-lg font-semibold text-gray-800 truncate mb-1" title={design.name}>{design.name}</h3>
              <p className="text-sm text-gray-600 mb-3 flex-grow min-h-[40px]"> {/* Altura mínima para alinear botones */}
                {design.description || 'Sin descripción'}
              </p>
              <div className="mt-auto pt-2 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => openModalForEdit(design)}
                  className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(design.id)}
                  className="text-sm text-red-600 hover:text-red-800 font-medium transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal para Crear/Editar Diseño */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 overflow-y-auto h-full w-full flex items-center justify-center z-50 p-4 transition-opacity duration-300 ease-in-out">
          <div className="relative bg-white p-6 md:p-8 rounded-lg shadow-xl w-full max-w-lg mx-auto transform transition-all duration-300 ease-in-out scale-100"> {/* Animación de entrada */}
            <button onClick={closeModal} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold">×</button>
            <h2 className="text-2xl font-bold text-brand-black mb-6">
              {currentDesign ? 'Editar Diseño' : 'Nuevo Diseño'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {formError && <p className="mb-4 text-sm text-red-600 bg-red-100 p-3 rounded-md">{formError}</p>}
              <div>
                <label htmlFor="design-name" className="block text-sm font-medium text-gray-700 mb-1">Nombre del Diseño <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  id="design-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-red focus:border-brand-red sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="design-file" className="block text-sm font-medium text-gray-700 mb-1">
                  Archivo de Imagen {currentDesign ? '(Opcional: solo si quieres reemplazar)' : <span className="text-red-500">*</span>}
                </label>
                <input
                  type="file"
                  id="design-file"
                  accept="image/png, image/jpeg, image/webp, image/svg+xml"
                  onChange={handleFileChange}
                  className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-brand-red file:text-brand-white hover:file:bg-brand-red-dark cursor-pointer"
                />
                {previewImage && (
                  <div className="mt-3 border rounded-md p-2 inline-block max-w-[150px] max-h-[150px] overflow-hidden">
                    <div style={{ position: 'relative', width: '100px', height: '100px' }}> {/* Ajusta tamaño del preview */}
                      <Image src={previewImage} alt="Vista previa de la imagen" fill style={{ objectFit: 'contain' }} sizes="100px" />
                    </div>
                  </div>
                )}
              </div>
              <div>
                <label htmlFor="design-description" className="block text-sm font-medium text-gray-700 mb-1">Descripción (Opcional)</label>
                <textarea
                  id="design-description"
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
                  {isSubmitting ? (currentDesign ? 'Guardando...' : 'Creando...') : (currentDesign ? 'Guardar Cambios' : 'Crear Diseño')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}