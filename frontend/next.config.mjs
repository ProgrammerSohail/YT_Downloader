
/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/:path*',
        destination: `${process.env.API_URL}/:path*`, // Proxy to backend
      },
    ];
  },
};

export default nextConfig;
