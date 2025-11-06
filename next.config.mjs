/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ["three"],
  },
  images: {
    unoptimized: true
  },
};

export default nextConfig;
