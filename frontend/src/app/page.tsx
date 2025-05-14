// frontend/src/app/page.tsx
import Link from 'next/link'

// Componente de ejemplo para una Card de Producto (Placeholder)
function ProductCardPlaceholder({ id }: { id: number }) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 shadow-lg hover:shadow-xl transition-shadow">
      <div className="bg-gray-300 h-64 w-full rounded-md mb-4 animate-pulse"></div> {/* Placeholder para imagen */}
      <h3 className="text-lg font-semibold mb-2 h-6 bg-gray-300 rounded animate-pulse w-3/4"></h3>
      <p className="text-brand-red font-bold mb-3 h-5 bg-gray-300 rounded animate-pulse w-1/2"></p>
      <Link
        href={`/remeras/${id}`}
        className="block text-center bg-brand-red text-brand-white py-2 px-4 rounded hover:bg-brand-red-dark transition-colors"
      >
        Ver Producto
      </Link>
    </div>
  )
}

export default function HomePage() {
  // Datos de ejemplo para los placeholders
  const featuredProductIds = [1, 2, 3, 4];

  return (
    <>
      {/* Sección Hero */}
      <section className="bg-brand-black text-brand-white py-20 text-center">
        <div className="container mx-auto">
          <h1 className="text-5xl font-bold mb-4">Diseños Únicos, Estilo Inigualable</h1>
          <p className="text-xl mb-8">Descubre la colección de remeras Flipper y expresa tu originalidad.</p>
          <Link
            href="/remeras"
            className="bg-brand-red text-brand-white py-3 px-8 rounded-lg text-lg font-semibold hover:bg-brand-red-dark transition-colors"
          >
            Ver Colección
          </Link>
        </div>
      </section>

      {/* Sección de Productos Destacados */}
      <section className="py-16">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Destacados</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {featuredProductIds.map((id) => (
              <ProductCardPlaceholder key={id} id={id} />
            ))}
          </div>
        </div>
      </section>

      {/* Otra sección (ej: Sobre Nosotros - breve) */}
      <section className="bg-gray-100 py-16">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Conoce Flipper</h2>
          <p className="max-w-2xl mx-auto mb-8">
            Somos un emprendimiento apasionado por el diseño y la calidad, creando remeras que te hacen destacar.
          </p>
          <Link
            href="/nosotros"
            className="text-brand-red font-semibold hover:underline"
          >
            Más sobre nosotros
          </Link>
        </div>
      </section>
    </>
  )
}