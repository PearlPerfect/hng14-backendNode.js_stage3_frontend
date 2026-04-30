/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  reactStrictMode: true,
  swcMinify: true,
  
  // Webpack configuration for better Fast Refresh
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Improve Fast Refresh stability
      config.optimization.moduleIds = 'named';
      config.optimization.chunkIds = 'named';
      
      // Ensure Fast Refresh works properly
      config.cache = {
        type: 'filesystem',
        buildDependencies: {
          config: [__filename],
        },
      };
    }
    return config;
  },
  
  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  
  // Transpile packages if needed
  transpilePackages: [],
  
  // Disable x-powered-by header for security
  poweredByHeader: false,
  
  // Compression
  compress: true,
  
  // Production source maps (optional)
  productionBrowserSourceMaps: false,
};

export default nextConfig;
