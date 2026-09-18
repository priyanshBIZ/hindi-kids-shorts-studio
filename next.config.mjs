/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Allow Vercel Blob URLs in images
  // Large file uploads are handled by Vercel Blob SDK directly
};

export default nextConfig;
