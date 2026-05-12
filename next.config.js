const isProd = process.env.NODE_ENV === 'production';


/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Solo exportación estática en producción (build). En `next dev` provoca manifiestos/.next incompletos.
  ...(isProd ? { output: 'export' } : {}),
  basePath: isProd ? '/lecciones' : '',
  assetPrefix: isProd ? '/lecciones/' : '',
  eslint: {
    // Warning: only use this in development
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig; 
