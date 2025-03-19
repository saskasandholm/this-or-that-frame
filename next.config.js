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

// For ES modules, we need to dynamically import Sentry
// Since we can't use require() in ES modules
let withSentryConfig;

// Skip Sentry if the environment variable is set
if (process.env.SKIP_SENTRY_SETUP) {
  withSentryConfig = (config) => config;
} else {
  // Use dynamic import for Sentry (commented out for now)
  // We'll bypass Sentry for now to get the build working
  withSentryConfig = (config) => config;
  
  // The dynamic import approach doesn't work in the build context
  // We'll need to convert this whole file to CommonJS later
}

// Temporarily skip Sentry to get the build working
export default nextConfig;
