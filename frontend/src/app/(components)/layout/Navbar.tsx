// frontend/src/app/(components)/layout/Navbar.tsx
import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="bg-brand-black text-brand-white p-4 fixed w-full top-0 z-50 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-brand-red">
          FLIPPER
        </Link>
        <div className="space-x-4">
          <Link href="/remeras" className="hover:text-brand-red transition-colors">
            Remeras
          </Link>
          <Link href="/nosotros" className="hover:text-brand-red transition-colors">
            Nosotros
          </Link>
          <Link href="/contacto" className="hover:text-brand-red transition-colors">
            Contacto
          </Link>
          <Link href="/carrito" className="hover:text-brand-red transition-colors">
            {/* Icono de carrito aquí (puedes usar una librería de iconos o un SVG) */}
            Carrito (0)
          </Link>
        </div>
        <div>
          <Link href="/admin/login" className="bg-brand-red text-brand-white px-3 py-1 rounded hover:bg-brand-red-dark transition-colors text-sm">
            Admin
          </Link>
        </div>
      </div>
    </nav>
  )
}