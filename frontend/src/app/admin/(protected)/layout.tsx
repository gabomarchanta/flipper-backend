// frontend/src/app/admin/(protected)/layout.tsx
'use client';

import { useEffect, ReactNode } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

// Opcional: Un componente de sidebar para el admin
const AdminSidebar = () => {
  return (
    <aside className="w-64 bg-gray-800 text-white p-4 space-y-2 min-h-screen">
      <h2 className="text-xl font-semibold mb-4">Admin Flipper</h2>
      <Link href="/admin/dashboard" className="block py-2 px-3 rounded hover:bg-gray-700">Dashboard</Link>
      <Link href="/admin/categories" className="block py-2 px-3 rounded hover:bg-gray-700">Categorías</Link>
      <Link href="/admin/designs" className="block py-2 px-3 rounded hover:bg-gray-700">Diseños</Link>
      <Link href="/admin/colors" className="block py-2 px-3 rounded hover:bg-gray-700">Colores</Link>
      <Link href="/admin/products" className="block py-2 px-3 rounded hover:bg-gray-700">Productos</Link>
      {/* Añade más enlaces según necesites */}
    </aside>
  );
};

export default function ProtectedAdminLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, user, isLoading: authIsLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname(); // Para evitar bucles de redirección desde la página de login

  useEffect(() => {
    // No redirigir si estamos cargando la info de Auth o si ya estamos en la página de login
    if (!authIsLoading && !isAuthenticated && pathname !== '/admin/login') {
      router.replace('/admin/login');
    } else if (!authIsLoading && isAuthenticated && user?.role !== 'admin') {
      // Si está autenticado pero no es admin, redirigir o mostrar mensaje
      // Podrías redirigirlo a una página de "acceso denegado" o a la home.
      // Por ahora, lo deslogueamos y lo mandamos al login con un mensaje (o podrías manejarlo diferente).
      alert('Acceso denegado. No tienes permisos de administrador.');
      logout(); // Esto ya redirige a /admin/login desde el AuthContext
    }
  }, [isAuthenticated, user, authIsLoading, router, pathname, logout]);

  if (authIsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Verificando acceso...
      </div>
    );
  }

  // Si no está autenticado y el efecto aún no ha redirigido (poco probable pero seguro)
  // o si no es admin y el efecto aún no ha redirigido
  if (!isAuthenticated || (isAuthenticated && user?.role !== 'admin')) {
     // Mostrar un loader o null mientras se redirige para evitar flash de contenido no autorizado
     // La redirección del useEffect debería manejar esto, pero como fallback:
    if (pathname !== '/admin/login') { // Evitar bucle si por alguna razón el redirect falla y sigue aquí
         return (
            <div className="flex items-center justify-center min-h-screen">
                Redirigiendo a login...
            </div>
        );
    }
    // Si está en /admin/login y no está autenticado, no debería llegar aquí debido al return anterior en AdminLoginPage.
    // Pero si llegara, no renderizar el layout de admin.
  }


  // Si está autenticado y es admin, muestra el layout del admin y el contenido de la página
  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-grow p-8 bg-gray-50">
        {children}
      </div>
    </div>
  );
}