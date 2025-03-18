/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Disable integrated ESLint check (we're using our own ESLint configuration)
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Ensure .well-known routes are handled properly
  async rewrites() {
    return [
      {
        source: '/.well-known/farcaster.json',
        destination: '/api/well-known/farcaster',
      },
    ];
  },
  images: {
    // Configure image domains if needed
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
