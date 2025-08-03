const isProd = process.env.NODE_ENV === 'production';


/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  basePath: isProd ? '/lecciones' : '',
  assetPrefix: isProd ? '/lecciones/' : '',
  eslint: {
    // Warning: only use this in development
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig; 
