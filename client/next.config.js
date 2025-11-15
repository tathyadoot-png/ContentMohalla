/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. ENVIRONMENT VARIABLES
  env: {
    STRAPI_BASE_URL: process.env.NEXT_PUBLIC_STRAPI_API || 'http://localhost:1337/api',
  },

  // 2. IMAGE CONFIGURATION
  images: {
    remotePatterns: [
      // ✅ FIX: Explicitly allowing HTTP protocol for localhost
      {
        protocol: 'http', 
        hostname: 'localhost',
        port: '1337',
        pathname: '/uploads/**',
      },
      // ... aapke baaki remote patterns yahan rahenge ...
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'tathyadoot.onrender.com',
      },
    ],
  },

  // 3. EXPERIMENTAL CONFIG (Optional, but useful)
  experimental: {
    serverComponentsExternalPackages: ['supports-color'],
  },

   transpilePackages: ['framer-motion'],
};

module.exports = nextConfig;
