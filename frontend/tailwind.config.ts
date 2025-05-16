// frontend/tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}', // Asegúrate que esta línea esté si usas App Router
  ],
  theme: {
    extend: {
      colors: {
        'brand-red': '#FF0000',        // TU ROJO EXACTO AQUÍ
        'brand-red-dark': '#CC0000',   // TU ROJO OSCURO EXACTO AQUÍ
        'brand-white': '#FFFFFF',      // TU BLANCO EXACTO AQUÍ (puede ser 'white' si es puro)
        'brand-black': '#000000',      // TU NEGRO/GRIS OSCURO EXACTO AQUÍ (puede ser 'black' si es puro)
      },
    },
  },
  plugins: [],
}
export default config