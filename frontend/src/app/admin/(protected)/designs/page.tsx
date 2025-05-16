// frontend/src/app/admin/(protected)/designs/page.tsx
'use client';

import React, { useState, useEffect, FormEvent, ChangeEvent, useCallback } from 'react';
// import Link from 'next/link'; // Descomenta si lo necesitas
import {
  getDesigns,
  createDesign,
  updateDesign, // Implementaremos la edición de texto por ahora
  deleteDesign,
  Design, // Importa el tipo Design de apiService
} from '../../../../services/apiService'; // Ajusta la ruta
import { useAuth } from '../../../../contexts/AuthContext'; // Ajusta la ruta
import Image from 'next/image'; // Para mostrar las imágenes

export default function AdminDesignsPage() {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para el formulario de crear/editar
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentDesign, setCurrentDesign] = useState<Design | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null); // Para previsualizar la imagen a subir
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { token } = useAuth();

  const fetchDesigns = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await getDesigns();
      setDesigns(data);
    } catch (err: unknown) {
      let message = 'Error al cargar diseños.';
      if (err instanceof Error) message = err.message;
      else if (typeof err === 'object' && err !== null && 'message' in err && typeof (err as { message: string }).message === 'string') message = (err as { message: string }).message;
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchDesigns();
  }, [fetchDesigns]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedFile(null);
      setPreviewImage(null);
    }
  };

  const openModalForCreate = () => {
    setCurrentDesign(null);
    setName('');
    setDescription('');
    setSelectedFile(null);
    setPreviewImage(null);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openModalForEdit = (design: Design) => {
    setCurrentDesign(design);
    setName(design.name);
    setDescription(design.description || '');
    setSelectedFile(null); // Para editar, la subida de nueva imagen es opcional
    setPreviewImage(design.imageUrl); // Mostrar imagen actual
    setFormError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentDesign(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) {
      setFormError("No autenticado.");
      return;
    }
    
    if (!currentDesign && !selectedFile) { // Solo para creación nueva, el archivo es obligatorio
      setFormError('Por favor, selecciona un archivo de imagen para el nuevo diseño.');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    if (currentDesign) { // Editar (solo texto por ahora)
      try {
        const designDataToUpdate = { name, description };
        // Nota: La actualización de la IMAGEN es más compleja y no se implementa aquí.
        // Requeriría manejar el 'selectedFile' y llamar a un endpoint diferente o el mismo con FormData.
        await updateDesign(currentDesign.id, designDataToUpdate);
        fetchDesigns();
        closeModal();
      } catch (err: unknown) {
        let message = 'Error al actualizar el diseño.';
        if (err instanceof Error) message = err.message;
        else if (typeof err === 'object' && err !== null && 'message' in err && typeof (err as { message: string }).message === 'string') message = (err as { message: string }).message;
        setFormError(message);
      }
    } else { // Crear
      const formData = new FormData();
      formData.append('name', name);
      if (description) formData.append('description', description);
      if (selectedFile) formData.append('file', selectedFile); // 'file' debe coincidir con el nombre en FileInterceptor

      // Para debuggear FormData:
for (const [key, value] of formData.entries()) {
  console.log(`${key}:`, value);
}

      try {
        await createDesign(formData);
        fetchDesigns();
        closeModal();
      } catch (err: unknown) {
        let message = 'Error al crear el diseño.';
        if (err instanceof Error) message = err.message;
        else if (typeof err === 'object' && err !== null && 'message' in err && typeof (err as { message: string }).message === 'string') message = (err as { message: string }).message;
        setFormError(message);
      }
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (!token) return;
    if (window.confirm('¿Estás seguro de que quieres eliminar este diseño? Esto podría afectar productos existentes.')) {
      try {
        await deleteDesign(id);
        fetchDesigns();
      } catch (err: unknown) {
        let message = 'Error al eliminar el diseño.';
        if (err instanceof Error) message = err.message;
        else if (typeof err === 'object' && err !== null && 'message' in err && typeof (err as { message: string }).message === 'string') message = (err as { message: string }).message;
        setError(message);
      }
    }
  };

  if (isLoading) return <p className="p-8">Cargando diseños...</p>;
  if (error) return <p className="p-8 text-red-500">Error: {error}</p>;

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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {designs.length === 0 && (
          <p className="col-span-full text-center text-gray-500 py-10">No hay diseños creados.</p>
        )}
        {designs.map((design) => (
          <div key={design.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            {design.imageUrl && (
              <div className="w-full h-48 relative bg-gray-100"> {/* Contenedor con aspect ratio o altura fija */}
                <Image
                  src={design.imageUrl}
                  alt={design.name}
                  fill // o width/height si conoces las dimensiones y quieres optimización
                  style={{ objectFit: 'contain' }} // o "cover" según prefieras
                  priority={false} // Fondo mientras carga
                />
              </div>
            )}
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-800 truncate">{design.name}</h3>
              <p className="text-sm text-gray-600 truncate h-10">{design.description || 'Sin descripción'}</p>
              <div className="mt-4 flex justify-end space-x-2">
                <button
                  onClick={() => openModalForEdit(design)}
                  className="text-sm text-indigo-600 hover:text-indigo-900 font-medium"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(design.id)}
                  className="text-sm text-red-600 hover:text-red-900 font-medium"
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
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50 p-4">
          <div className="relative bg-white p-6 md:p-8 rounded-lg shadow-xl w-full max-w-lg mx-auto">
            <h2 className="text-2xl font-bold text-brand-black mb-6">
              {currentDesign ? 'Editar Diseño' : 'Nuevo Diseño'}
            </h2>
            <form onSubmit={handleSubmit}>
              {formError && <p className="mb-4 text-sm text-red-500 bg-red-100 p-2 rounded">{formError}</p>}
              <div className="mb-4">
                <label htmlFor="design-name" className="block text-sm font-medium text-gray-700 mb-1">Nombre del Diseño</label>
                <input
                  type="text"
                  id="design-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-red focus:border-brand-red sm:text-sm"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="design-file" className="block text-sm font-medium text-gray-700 mb-1">
                  Archivo de Imagen {currentDesign ? '(Opcional: solo si quieres reemplazar)' : ''}
                </label>
                <input
                  type="file"
                  id="design-file"
                  accept="image/png, image/jpeg, image/webp, image/svg+xml" // Tipos de archivo aceptados
                  onChange={handleFileChange}
                  className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-red file:text-brand-white hover:file:bg-brand-red-dark"
                />
                {previewImage && (
                  <div className="mt-4 border rounded-md p-2 inline-block relative w-24 h-24">
                    <Image src={previewImage} alt="Vista previa" fill style={{ objectFit: 'contain' }} />
                  </div>
                )}
              </div>
              <div className="mb-6">
                <label htmlFor="design-description" className="block text-sm font-medium text-gray-700 mb-1">Descripción (Opcional)</label>
                <textarea
                  id="design-description"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-red focus:border-brand-red sm:text-sm"
                />
              </div>
              <div className="flex items-center justify-end space-x-4">
                <button type="button" onClick={closeModal} className="bg-gray-200 text-gray-700 py-2 px-4 rounded hover:bg-gray-300 transition-colors font-medium">
                  Cancelar
                </button>
                <button type="submit" disabled={isSubmitting} className="bg-brand-red text-brand-white py-2 px-5 rounded hover:bg-brand-red-dark transition-colors font-semibold disabled:opacity-50">
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