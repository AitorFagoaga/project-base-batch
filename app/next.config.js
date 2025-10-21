/**
 * Next.js Configuration with optimizations for Base Sepolia dApp
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "ipfs.io",
      },
      {
        protocol: "https",
        hostname: "gateway.pinata.cloud",
      },
    ],
  },
  
  webpack: (config, { isServer }) => {
    // Existing fallbacks
    config.resolve.fallback = { 
      fs: false, 
      net: false, 
      tls: false,
      // Add React Native fallbacks to suppress MetaMask SDK warnings
      '@react-native-async-storage/async-storage': false,
      'react-native': false,
    };
    
    // Existing externals
    config.externals.push("pino-pretty", "lokijs", "encoding");
    
    // Suppress specific warnings
    if (!isServer) {
      config.ignoreWarnings = [
        { module: /@react-native-async-storage\/async-storage/ },
        { message: /Critical dependency: the request of a dependency is an expression/ },
      ];
    }
    
    return config;
  },

  // Performance optimizations
  swcMinify: true,
  productionBrowserSourceMaps: false,
};

module.exports = nextConfig;
