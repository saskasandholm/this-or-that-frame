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
    domains: ['localhost', 'api.dicebear.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
        pathname: '/7.x/**',
      },
    ],
    // Enable SVG support from trusted sources
    dangerouslyAllowSVG: true,
    // Apply security policies for SVGs
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  sentry: {
    // Disable the automatic instrumentation of source maps for deployment
    // to avoid certain issues. Source maps will still be generated and uploaded.
    disableServerWebpackPlugin: true,
    disableClientWebpackPlugin: true,
  },
};

// A more sustainable approach for ES modules
// If Sentry integration is needed in the future, the codebase should use a proper ESM approach
// or convert this file to .cjs extension

export default nextConfig;
