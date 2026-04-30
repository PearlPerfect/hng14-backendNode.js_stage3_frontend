/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable React Compiler for Vercel deployment stability
  reactCompiler: false,
  
  reactStrictMode: true,
  swcMinify: true,
  
  // Optimize for Vercel
  images: {
    domains: ['avatars.githubusercontent.com', 'github.com'],
    unoptimized: false,
  },
  
  // Environment variables that will be available at build time
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  
  // Production optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Ensure proper handling of client components
  experimental: {
    optimizeCss: true,
  },
};

export default nextConfig;