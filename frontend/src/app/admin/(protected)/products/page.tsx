// frontend/src/app/admin/(protected)/products/page.tsx
'use client';

import React, { useState, useEffect, FormEvent, ChangeEvent, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../contexts/AuthContext';

// Importa las funciones API y tipos necesarios
import { getProducts, createProduct, updateProduct, deleteProduct } from '../../../../services/products.api';
import { getCategories } from '../../../../services/categories.api';
import { getDesigns } from '../../../../services/designs.api';
import { getColors } from '../../../../services/colors.api';

import type { Product, CreateProductPayload, UpdateProductPayload, Category, Design, Color, CreateProductVariantDtoForApi } from '../../../../types';
import Link from 'next/link'; // Para enlaces si usas páginas separadas para editar/crear
import Image from 'next/image';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [designs, setDesigns] = useState<Design[]>([]);
  const [colors, setColors] = useState<Color[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para el modal/formulario de producto
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null); // Para editar
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productBasePrice, setProductBasePrice] = useState<number | ''>('');
  const [productIsActive, setProductIsActive] = useState(true);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(undefined);
  const [selectedDesignId, setSelectedDesignId] = useState<string | undefined>(undefined);
  
  // Estados para las variantes en el formulario
  const [formVariants, setFormVariants] = useState<Partial<CreateProductVariantDtoForApi>[]>([
    { colorId: '', size: '', stock_quantity: 0, additional_price: 0 }, // Variante inicial vacía
  ]);

  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { token } = useAuth();
  const router = useRouter();

  const fetchData = useCallback(async () => {
    if (!token) {
      setError("No autenticado.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      // Cargar todos los datos necesarios en paralelo
      const [productsData, categoriesData, designsData, colorsData] = await Promise.all([
        getProducts(),
        getCategories(),
        getDesigns(),
        getColors(),
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
      setDesigns(designsData);
      setColors(colorsData);
    } catch (err: any) {
      setError(err.message || 'Error al cargar datos iniciales.');
      console.error("Error fetching initial data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- Lógica para el formulario y variantes ---
  const handleVariantChange = (index: number, field: keyof CreateProductVariantDtoForApi, value: string | number) => {
    const updatedVariants = [...formVariants];
    const variantToUpdate = { ...updatedVariants[index] };
    
    if (field === 'stock_quantity' || field === 'additional_price') {
      variantToUpdate[field] = Number(value) || 0;
    } else {
      (variantToUpdate as any)[field] = value;
    }
    updatedVariants[index] = variantToUpdate;
    setFormVariants(updatedVariants);
  };

  const addVariantField = () => {
    setFormVariants([...formVariants, { colorId: '', size: '', stock_quantity: 0, additional_price: 0 }]);
  };

  const removeVariantField = (index: number) => {
    if (formVariants.length <= 1) { // Siempre mantener al menos una variante en el formulario
        alert("Debe haber al menos una variante de producto.");
        return;
    }
    const updatedVariants = formVariants.filter((_, i) => i !== index);
    setFormVariants(updatedVariants);
  };
  
  const resetFormStates = () => {
    setProductName('');
    setProductDescription('');
    setProductBasePrice('');
    setProductIsActive(true);
    setSelectedCategoryId(undefined);
    setSelectedDesignId(undefined);
    setFormVariants([{ colorId: '', size: '', stock_quantity: 0, additional_price: 0 }]);
    setFormError(null);
    setCurrentProduct(null);
  };

  const openModalForCreate = () => {
    resetFormStates();
    setIsModalOpen(true);
  };

  const openModalForEdit = (product: Product) => {
    resetFormStates(); // Reset primero
    setCurrentProduct(product);
    setProductName(product.name);
    setProductDescription(product.description || '');
    setProductBasePrice(Number(product.base_price));
    setProductIsActive(product.is_active);
    setSelectedCategoryId(product.category?.id || undefined);
    setSelectedDesignId(product.design?.id || undefined);
    
    // Poblar formVariants con las variantes existentes del producto
    if (product.variants && product.variants.length > 0) {
      setFormVariants(
        product.variants.map(v => ({
          colorId: v.color?.id || '', // Asume que 'color' es la entidad Color cargada
          size: v.size,
          stock_quantity: v.stock_quantity,
          additional_price: Number(v.additional_price),
          // Si tuvieras un ID de variante para actualizar, lo necesitarías aquí
        }))
      );
    } else {
      setFormVariants([{ colorId: '', size: '', stock_quantity: 0, additional_price: 0 }]);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetFormStates();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) {
      setFormError("No autenticado.");
      return;
    }
    setIsSubmitting(true);
    setFormError(null);

    // Validar que al menos una variante tenga datos significativos (ej. color y talle)
    const validVariants = formVariants.filter(v => v.colorId && v.size).map(v => ({
        colorId: v.colorId!, // Sabemos que no es undefined por el filter
        size: v.size!,
        stock_quantity: Number(v.stock_quantity) || 0,
        additional_price: Number(v.additional_price) || 0,
    })) as CreateProductVariantDtoForApi[]; // Cast al tipo correcto

    if (validVariants.length === 0) {
        setFormError("Debe añadir al menos una variante válida con color y talle.");
        setIsSubmitting(false);
        return;
    }

    const productPayload: CreateProductPayload | UpdateProductPayload = {
      name: productName,
      description: productDescription || undefined,
      base_price: Number(productBasePrice) || 0,
      is_active: productIsActive,
      categoryId: selectedCategoryId || undefined,
      designId: selectedDesignId || undefined,
      // Solo incluir 'variants' al crear. La actualización de variantes es más compleja.
      ...(currentProduct ? {} : { variants: validVariants }),
    };

    try {
      if (currentProduct) {
        await updateProduct(currentProduct.id, productPayload as UpdateProductPayload); // Asume que productPayload es el DTO
        alert('Producto actualizado con éxito!');
      } else {
        await createProduct(productPayload as CreateProductPayload);
        alert('Producto creado con éxito!');
      }
      router.refresh();       // 1. Intenta revalidar datos del servidor
      await fetchData();  // 2. Fuerza la actualización del estado local del componente
      closeModal();           // 3. Cierra el modal
    } catch (err: any) {
      setFormError(err.response?.data?.message || err.message || 'Error al guardar el producto.');
      console.error("Error saving product:", err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDelete = async (id: string) => {
    if (!token) return;
    if (window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      setIsLoading(true); // O un estado de carga específico para delete
      try {
        await deleteProduct(id);
        alert('Producto eliminado con éxito');
        router.refresh();
        await fetchData(); // Fuerza la actualización del estado local
      } catch (err: any) {
        setError(err.response?.data?.message || err.message || 'Error al eliminar el producto.');
        console.error("Error deleting product:", err);
      } finally {
        setIsLoading(false); // O el estado de carga específico para delete
      }
    }
  };


  // --- Renderizado ---
  if (isLoading && products.length === 0) return <p className="p-8 text-center">Cargando datos...</p>;
  if (error && products.length === 0) return <p className="p-8 text-red-500 text-center">Error: {error}</p>;

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-brand-black">Gestionar Productos</h1>
        <button
          onClick={openModalForCreate}
          className="bg-brand-red text-brand-white py-2 px-5 rounded-md hover:bg-brand-red-dark transition-colors font-semibold"
        >
          Nuevo Producto
        </button>
      </div>

      {/* Tabla de Productos */}
      <div className="bg-white shadow-lg rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Imagen</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diseño</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio Base</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activo</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {!isLoading && products.length === 0 && !error && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">No hay productos creados.</td>
              </tr>
            )}
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-4 py-4 whitespace-nowrap text-sm">
                {product.variants && product.variants.length > 0 && product.variants[0].mockup_image_url ? (
                    <div className="w-16 h-16 relative"> {/* Ajusta tamaño según necesidad */}
                    <Image
                        src={product.variants[0].mockup_image_url}
                        alt={product.name || 'Mockup del producto'}
                        fill
                        sizes="64px" // El tamaño del contenedor
                        style={{ objectFit: 'contain' }}
                    />
                    </div>
                ) : (
                    <div className="w-16 h-16 bg-gray-200 flex items-center justify-center text-xs text-gray-400">Sin Mockup</div>
                )}
                </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category?.name || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.design?.name || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${product.base_price}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {product.is_active ? 'Sí' : 'No'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                  <button onClick={() => openModalForEdit(product)} className="text-indigo-600 hover:text-indigo-800">Editar</button>
                  <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-800">Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal para Crear/Editar Producto */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 overflow-y-auto h-full w-full flex items-center justify-center z-50 p-4">
          <div className="relative bg-white p-6 md:p-8 rounded-lg shadow-xl w-full max-w-2xl mx-auto">
            <button onClick={closeModal} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-2xl">×</button>
            <h2 className="text-2xl font-bold text-brand-black mb-6">
              {currentProduct ? 'Editar Producto' : 'Nuevo Producto'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              {formError && <p className="mb-3 text-sm text-red-600 bg-red-100 p-3 rounded-md">{formError}</p>}
              
              {/* Campos del Producto Principal */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="product-name" className="block text-sm font-medium text-gray-700 mb-1">Nombre Producto <span className="text-red-500">*</span></label>
                  <input type="text" id="product-name" value={productName} onChange={(e) => setProductName(e.target.value)} required className="mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-brand-red focus:border-brand-red"/>
                </div>
                <div>
                  <label htmlFor="product-base-price" className="block text-sm font-medium text-gray-700 mb-1">Precio Base <span className="text-red-500">*</span></label>
                  <input type="number" id="product-base-price" value={productBasePrice} onChange={(e) => setProductBasePrice(parseFloat(e.target.value) || '')} required min="0" step="0.01" className="mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-brand-red focus:border-brand-red"/>
                </div>
                <div>
                  <label htmlFor="product-category" className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                  <select id="product-category" value={selectedCategoryId || ''} onChange={(e) => setSelectedCategoryId(e.target.value || undefined)} className="mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-brand-red focus:border-brand-red">
                    <option value="">-- Seleccionar Categoría --</option>
                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="product-design" className="block text-sm font-medium text-gray-700 mb-1">Diseño</label>
                  <select id="product-design" value={selectedDesignId || ''} onChange={(e) => setSelectedDesignId(e.target.value || undefined)} className="mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-brand-red focus:border-brand-red">
                    <option value="">-- Seleccionar Diseño --</option>
                    {designs.map(des => <option key={des.id} value={des.id}>{des.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="product-description" className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea id="product-description" value={productDescription} onChange={(e) => setProductDescription(e.target.value)} rows={3} className="mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-brand-red focus:border-brand-red"/>
              </div>
              <div className="flex items-center">
                <input id="product-isactive" type="checkbox" checked={productIsActive} onChange={(e) => setProductIsActive(e.target.checked)} className="h-4 w-4 text-brand-red border-gray-300 rounded focus:ring-brand-red"/>
                <label htmlFor="product-isactive" className="ml-2 block text-sm text-gray-900">Producto Activo</label>
              </div>

              {/* Sección de Variantes (Solo visible al crear por ahora) */}
              {!currentProduct && (
                <div className="pt-4 border-t">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Variantes del Producto</h3>
                  {formVariants.map((variant, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 p-3 border rounded-md">
                      <div>
                        <label htmlFor={`variant-color-${index}`} className="block text-xs font-medium text-gray-700">Color <span className="text-red-500">*</span></label>
                        <select id={`variant-color-${index}`} value={variant.colorId || ''} onChange={(e) => handleVariantChange(index, 'colorId', e.target.value)} required className="mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-brand-red focus:border-brand-red">
                          <option value="">Seleccionar</option>
                          {colors.map(col => <option key={col.id} value={col.id}>{col.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label htmlFor={`variant-size-${index}`} className="block text-xs font-medium text-gray-700">Talle <span className="text-red-500">*</span></label>
                        <input type="text" id={`variant-size-${index}`} placeholder="Ej: M" value={variant.size || ''} onChange={(e) => handleVariantChange(index, 'size', e.target.value)} required className="mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-brand-red focus:border-brand-red"/>
                      </div>
                      <div>
                        <label htmlFor={`variant-stock-${index}`} className="block text-xs font-medium text-gray-700">Stock <span className="text-red-500">*</span></label>
                        <input type="number" id={`variant-stock-${index}`} value={variant.stock_quantity || 0} onChange={(e) => handleVariantChange(index, 'stock_quantity', parseFloat(e.target.value))} required min="0" className="mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-brand-red focus:border-brand-red"/>
                      </div>
                      <div className="flex items-end">
                        {formVariants.length > 1 && (
                          <button type="button" onClick={() => removeVariantField(index)} className="text-red-500 hover:text-red-700 p-2">Eliminar</button>
                        )}
                      </div>
                      {/* Precio Adicional Opcional */}
                       <div className="md:col-span-4 mt-2"> {/* Ocupa todo el ancho en pantallas medianas y más */}
                        <label htmlFor={`variant-addprice-${index}`} className="block text-xs font-medium text-gray-700">Precio Adicional (Opcional)</label>
                        <input type="number" id={`variant-addprice-${index}`} value={variant.additional_price || 0} onChange={(e) => handleVariantChange(index, 'additional_price', parseFloat(e.target.value))} min="0" step="0.01" className="mt-1 block w-full md:w-1/2 p-2 border-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-brand-red focus:border-brand-red"/>
                      </div>
                    </div>
                  ))}
                  <button type="button" onClick={addVariantField} className="mt-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                    + Añadir Otra Variante
                  </button>
                </div>
              )}
              {currentProduct && (
                  <p className="text-sm text-gray-500 mt-4">Nota: La edición de variantes existentes (colores, talles, stock) se realizará en una sección dedicada o una futura actualización. Esta pantalla solo actualiza los datos principales del producto.</p>
              )}

              <div className="flex items-center justify-end space-x-3 pt-4 border-t mt-6">
                <button type="button" onClick={closeModal} disabled={isSubmitting} className="bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors font-medium disabled:opacity-70">Cancelar</button>
                <button type="submit" disabled={isSubmitting} className="bg-brand-red text-brand-white py-2 px-5 rounded-md hover:bg-brand-red-dark transition-colors font-semibold disabled:opacity-70">
                  {isSubmitting ? 'Guardando...' : (currentProduct ? 'Guardar Cambios Producto' : 'Crear Producto')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}