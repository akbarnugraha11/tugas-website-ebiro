// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Fallback for Node core modules that are not used client‑side
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        tls: false,
        child_process: false,
      };
    }
    return config;
  },
};
module.exports = nextConfig;
