/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/:path*',
        destination: `http://127.0.0.1:5000/:path*`, // Proxy to backend
      },
    ];
  },
};

export default nextConfig;
