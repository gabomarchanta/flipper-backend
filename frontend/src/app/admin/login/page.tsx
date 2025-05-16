// frontend/src/app/admin/login/page.tsx
'use client';

import { useState, FormEvent, useEffect } from 'react'; // <--- AÑADE useEffect
import { useAuth } from '../../../contexts/AuthContext';
import { loginAdmin } from '../../../services/apiService';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login: contextLogin, isAuthenticated, isLoading: authIsLoading } = useAuth(); // Obtén isLoading del contexto también
  const router = useRouter();

  // Usar useEffect para manejar la redirección si ya está autenticado
  useEffect(() => {
    // Solo redirigir si la autenticación NO está cargando y el usuario SÍ está autenticado
    if (!authIsLoading && isAuthenticated) {
      router.replace('/admin/dashboard');
    }
  }, [isAuthenticated, authIsLoading, router]); // Dependencias del efecto

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const data = await loginAdmin({ email, password });
      if (data.accessToken && data.user) {
        if (data.user.role !== 'admin') {
            setError('Acceso denegado. No eres administrador.');
            setIsLoading(false);
            return;
        }
        contextLogin(data.accessToken, data.user);
        // La redirección ahora se maneja en el AuthContext o en el useEffect de arriba después de que isAuthenticated cambie
      } else {
        setError('Respuesta inválida del servidor.');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Error al iniciar sesión. Verifica tus credenciales.');
        console.error(err);
      } else {
        setError('Error al iniciar sesión. Verifica tus credenciales.');
        console.error(err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Si la autenticación aún está cargando, o si ya está autenticado y la redirección está en proceso,
  // podrías mostrar un loader o null para evitar renderizar el formulario innecesariamente.
  if (authIsLoading || (!authIsLoading && isAuthenticated)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p>Cargando...</p> {/* O un spinner más elegante */}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-brand-white shadow-xl rounded-lg w-full max-w-md">
        {/* ... resto del formulario ... */}
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