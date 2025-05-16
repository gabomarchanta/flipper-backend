// frontend/src/app/admin/login/page.tsx
'use client';

import { useState, FormEvent } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { loginAdmin } from '../../../services/apiService'; // Importa tu función de login
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login: contextLogin, isAuthenticated } = useAuth(); // Renombra login para evitar conflicto
  const router = useRouter();

  // Si ya está autenticado, redirigir al dashboard
  if (typeof window !== 'undefined' && isAuthenticated) {
    router.replace('/admin/dashboard'); // O la página principal del admin
    return null; // O un loader
  }
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const data = await loginAdmin({ email, password });
      // data = { accessToken: string, user: { id, email, role } }
      if (data.accessToken && data.user) {
        if (data.user.role !== 'admin') {
            setError('Acceso denegado. No eres administrador.');
            setIsLoading(false);
            return;
        }
        contextLogin(data.accessToken, data.user); // Llama a la función login del AuthContext
        // La redirección se maneja dentro de contextLogin
      } else {
        setError('Respuesta inválida del servidor.');
      }
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión. Verifica tus credenciales.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-brand-white shadow-xl rounded-lg w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-brand-red mb-8">
          Admin Login
        </h1>
        <form onSubmit={handleSubmit}>
          {error && <p className="mb-4 text-center text-red-500 bg-red-100 p-2 rounded">{error}</p>}
          <div className="mb-6">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-brand-red focus:border-brand-red sm:text-sm"
            />
          </div>
          <div className="mb-8">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-brand-red focus:border-brand-red sm:text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-brand-white bg-brand-red hover:bg-brand-red-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-red disabled:opacity-50"
          >
            {isLoading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  );
}