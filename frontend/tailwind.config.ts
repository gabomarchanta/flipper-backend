// frontend/tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}', // Corregido aquí
  ],
  theme: {
    extend: {
      colors: {
        'brand-red': '#FF0000',     // Reemplaza con tu rojo exacto
        'brand-red-dark': '#CC0000', // Reemplaza o ajusta
        'brand-white': '#FFFFFF',    // Blanco puro
        'brand-black': '#171717',    // Un negro/gris oscuro (puedes usar #000000 si prefieres negro puro)
                                     // o el que tenías en --foreground
      },
      // Si quieres usar una fuente específica globalmente a través de Tailwind:
      // fontFamily: {
      //   sans: ['Arial', 'Helvetica', 'sans-serif'], // O la que prefieras
      // },
    },
  },
  plugins: [],
}
export default config