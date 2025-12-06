/**
 * Next.js Configuration
 * 
 * To run on a custom port: npm run dev -- -p 3005
 * To change backend API URL: Set NEXT_PUBLIC_API_URL in .env.local
 * 
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8000',
        pathname: '/uploads/**',
      },
    ],
  },
}

module.exports = nextConfig
