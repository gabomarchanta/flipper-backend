// frontend/src/app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google' // O la fuente que prefieras
import './globals.css'
import Navbar from './(components)/layout/Navbar' // Crearemos este componente
import Footer from './(components)/layout/Footer' // Crearemos este componente

const inter = Inter({ subsets: ['latin'] }) // Configura tu fuente

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
      <body className={`${inter.className} bg-brand-white text-brand-black`}> {/* Aplica colores base */}
        <Navbar />
        <main className="min-h-screen pt-16"> {/* pt-16 para dejar espacio para un navbar fijo */}
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}