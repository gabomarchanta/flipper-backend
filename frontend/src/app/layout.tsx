// frontend/src/app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google' // O la fuente que prefieras
import './globals.css'
import Navbar from './(components)/layout/Navbar'
import Footer from './(components)/layout/Footer'
import { AuthProvider } from '../contexts/AuthContext';

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Flipper - Remeras con Diseño', // Título por defecto para tu app
  description: 'Encuentra remeras únicas con diseños originales.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={`${inter.className} bg-brand-white text-brand-black`}>
        <AuthProvider> {/* <--- ENVOLVER AQUÍ */}
          <Navbar />
          <main className="min-h-screen pt-16">
            {children}
          </main>
          <Footer />
        </AuthProvider> {/* <--- CIERRE DEL PROVIDER */}
      </body>
    </html>
  );
}