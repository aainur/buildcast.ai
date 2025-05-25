/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['pdf-parse'],
  },
  // Ensure API routes work properly on Vercel
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
  // Environment variables validation
  env: {
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY,
  },
  images: {
    domains: ['localhost'],
  },
};

export default nextConfig; 