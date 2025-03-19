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

// Sentry webpack plugin is added by @sentry/nextjs automatically
// Using a conditional to wrap Sentry setup to allow disabling in specific environments
const { withSentryConfig } = process.env.SKIP_SENTRY_SETUP 
  ? { withSentryConfig: config => config } 
  : require('@sentry/nextjs');

export default process.env.SKIP_SENTRY_SETUP
  ? nextConfig
  : withSentryConfig(
      nextConfig,
      {
        // For all available options, see:
        // https://github.com/getsentry/sentry-webpack-plugin#options

        // Upload sourcemaps regardless of NODE_ENV
        dryRun: false,
        silent: false,
      },
      {
        // For all available options, see:
        // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

        // Upload sourcemaps only when building for production
        transpileClientSDK: true,
        tunnelRoute: '/monitoring',
        hideSourceMaps: true,
        widenClientFileUpload: true,
      }
    );
