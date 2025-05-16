/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // O tu configuración existente
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'flipper-remeras.s3.us-east-2.amazonaws.com', // Tu hostname de S3
        // port: '', // Usualmente no se necesita para S3
        // pathname: '/my-bucket/**', // Opcional: si quieres restringir a una ruta específica dentro del bucket
      },
      // Puedes añadir más objetos aquí para otros dominios de imágenes
    ],
  },
};

module.exports = nextConfig;