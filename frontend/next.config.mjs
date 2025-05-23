/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  // Enable static export
  env: {
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL
  },
  // Disable the favicon.ico route handling since we'll serve it as a static file
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };
    return config;
  }
};

export default nextConfig;
