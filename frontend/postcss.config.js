// frontend/postcss.config.js
module.exports = {
  plugins: [
    require('@tailwindcss/postcss'), // Usar el paquete explícito
    require('autoprefixer'),
  ],
}