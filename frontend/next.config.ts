/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // O la configuración que ya tengas
  // ... otras configuraciones que puedas tener ...
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '', // Dejar vacío si es el puerto estándar (80 o 443)
        pathname: '/**', // Permite cualquier ruta dentro de este hostname
      },
      {
        protocol: 'https',
        // Ejemplo del hostname de tu bucket S3 (ajusta según tu bucket y región)
        // Si tu URL es https://flipper-remeras.s3.us-east-2.amazonaws.com/...
        hostname: 'flipper-remeras.s3.us-east-2.amazonaws.com', // <--- CAMBIA ESTO POR TU HOSTNAME DE S3
        port: '',
        pathname: '/**',
      },
      // Puedes añadir más patrones aquí para otros dominios si los necesitas
    ],
  },
  experimental: {
    // Tus configuraciones experimentales si las tienes, como:
    // webpackBuildWorker: true,
    // lightningCss: false,
  },
};

module.exports = nextConfig;