/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['pdf-parse', 'tesseract.js']
  },
  images: {
    domains: ['localhost'],
  },
};

export default nextConfig; 