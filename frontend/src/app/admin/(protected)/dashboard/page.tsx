// frontend/src/app/admin/dashboard/page.tsx
'use client';

import { useAuth } from '../../../../contexts/AuthContext';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const { user, logout, isLoading, isAuthenticated } = useAuth();

  // Mientras carga o si no está autenticado, no mostrar contenido sensible
  // La protección de ruta se hará con un HOC/Layout más adelante
  if (isLoading) {
    return <div className="p-8">Cargando dashboard...</div>;
  }

  if (!isAuthenticated || !user) {
    // Esto no debería pasar si tenemos un layout protector, pero es una doble verificación
    return <div className="p-8">Acceso denegado. Por favor, <Link href="/admin/login" className="text-brand-red hover:underline">inicia sesión</Link>.</div>;
  }
  
  if (user.role !== 'admin') {
      return <div className="p-8">No tienes permisos de administrador. <button onClick={logout} className="text-brand-red hover:underline">Cerrar sesión</button></div>;
  }


  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold text-brand-red mb-6">Panel de Administrador</h1>
      <p className="mb-4">Bienvenido, <span className="font-semibold">{user.email}</span>!</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Link href="/admin/categories" className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold text-brand-black mb-2">Gestionar Categorías</h2>
            <p className="text-gray-600">Crear, editar y eliminar categorías de remeras.</p>
        </Link>
        <Link href="/admin/designs" className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold text-brand-black mb-2">Gestionar Diseños</h2>
            <p className="text-gray-600">Subir y administrar los diseños de las remeras.</p>
        </Link>
        <Link href="/admin/colors" className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold text-brand-black mb-2">Gestionar Colores</h2>
            <p className="text-gray-600">Definir la paleta de colores disponibles.</p>
        </Link>
        <Link href="/admin/products" className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold text-brand-black mb-2">Gestionar Productos</h2>
            <p className="text-gray-600">Crear y administrar las remeras y sus variantes.</p>
        </Link>
      </div>

      <button
        onClick={logout}
        className="bg-gray-500 text-white py-2 px-6 rounded hover:bg-gray-600 transition-colors"
      >
        Cerrar Sesión
      </button>
    </div>
  );
}