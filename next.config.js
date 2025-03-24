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
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
        pathname: '/7.x/**',
      },
      {
        protocol: 'https',
        hostname: 'imagedelivery.net',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
    // Enable SVG support from trusted sources
    dangerouslyAllowSVG: true,
    // Apply security policies for SVGs
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

// Changed to CommonJS exports for compatibility with Next.js
module.exports = nextConfig;
