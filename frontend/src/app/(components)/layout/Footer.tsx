// frontend/src/app/(components)/layout/Footer.tsx
export default function Footer() {
  return (
    <footer className="bg-brand-black text-brand-white p-8 text-center">
      <div className="container mx-auto">
        <p>© {new Date().getFullYear()} Flipper Remeras. Todos los derechos reservados.</p>
        <div className="mt-4">
          {/* Aquí podrías poner enlaces a redes sociales, etc. */}
          <a href="#" className="hover:text-brand-red mx-2">Instagram</a>
          <a href="#" className="hover:text-brand-red mx-2">Facebook</a>
        </div>
      </div>
    </footer>
  )
}