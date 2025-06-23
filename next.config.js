const isProd = process.env.NODE_ENV === 'production';


/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  basePath: isProd ? '/lecciones_cuanti' : '',
  assetPrefix: isProd ? '/lecciones_cuanti/' : '',
  eslint: {
    // Warning: only use this in development
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig; 
