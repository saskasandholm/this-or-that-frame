# Sentry Integration Guide for Next.js with ES Modules

This guide explains how to properly integrate Sentry with Next.js when your project is using ES modules (`"type": "module"` in `package.json`).

## Current Status

The application currently has Sentry partially integrated, but the build-time instrumentation is disabled to avoid conflicts with ES modules. The runtime error reporting functionality is still working through the direct use of Sentry's client API.

## Problem

When using ES modules, we encounter an issue with the standard Sentry setup in `next.config.js`:

```js
// This doesn't work with ES modules:
const { withSentryConfig } = require('@sentry/nextjs');
```

This is because `require()` is not available in ES modules, and the Sentry Next.js SDK currently doesn't provide a proper ES module interface for its webpack plugin.

## Solution Options

### Option 1: Convert the project to CommonJS (Preferred for full Sentry integration)

1. Remove `"type": "module"` from `package.json`
2. Rename any `.js` files using ES module syntax to use `.mjs` extension
3. Use the standard Sentry setup in `next.config.js`:

```js
// next.config.js
const { withSentryConfig } = require('@sentry/nextjs');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Your Next.js config
};

module.exports = process.env.SKIP_SENTRY_SETUP
  ? nextConfig
  : withSentryConfig(
      nextConfig,
      {
        // For all available options, see:
        // https://github.com/getsentry/sentry-webpack-plugin#options
        dryRun: false,
        silent: false,
      },
      {
        // For all available options, see:
        // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/
        transpileClientSDK: true,
        tunnelRoute: '/monitoring',
        hideSourceMaps: true,
        widenClientFileUpload: true,
      }
    );
```

### Option 2: Keep ES modules and use a hybrid approach

1. Rename `next.config.js` to `next.config.cjs` to indicate it's a CommonJS file
2. Use the standard Sentry setup in the CJS file:

```js
// next.config.cjs
const { withSentryConfig } = require('@sentry/nextjs');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Your Next.js config
};

module.exports = process.env.SKIP_SENTRY_SETUP
  ? nextConfig
  : withSentryConfig(
      nextConfig,
      {
        // Options
      },
      {
        // Options
      }
    );
```

### Option 3: Manual Sentry Integration (Without build-time instrumentation)

1. Keep the existing runtime Sentry integration for error reporting
2. Upload source maps manually:

```js
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Your Next.js config
};

export default nextConfig;
```

Then use a script to upload source maps post-build:

```bash
#!/bin/bash
# upload-sourcemaps.sh

# Install Sentry CLI if needed
npm install -g @sentry/cli

# Configure Sentry CLI
export SENTRY_ORG=your-org
export SENTRY_PROJECT=your-project

# Upload source maps
sentry-cli releases new $VERSION
sentry-cli releases files $VERSION upload-sourcemaps ./next/static
sentry-cli releases finalize $VERSION
```

## Current Implementation

We are currently using Option 3 (manual integration) for simplicity, with the following components:

1. Runtime error tracking through `@sentry/nextjs` client APIs:
   - `src/lib/error-tracking.ts` for utility functions
   - Runtime error capturing via `Sentry.captureException` and `Sentry.captureMessage`
   
2. Sentry configuration files are still in place but not used for build integration:
   - `sentry.client.config.js`
   - `sentry.server.config.js`
   - `sentry.edge.config.js`

## Re-enabling Full Sentry Integration

To re-enable full Sentry integration with build-time instrumentation:

1. Choose one of the solution options above
2. Update the project configuration accordingly
3. Remove the `SKIP_SENTRY_SETUP=true` environment variable
4. Test the build process

## Testing Sentry Integration

To verify Sentry is working properly:

1. Set up your `SENTRY_DSN` in your environment variables
2. Trigger a test error:

```jsx
function TestErrorButton() {
  return (
    <button 
      onClick={() => {
        try {
          throw new Error("Test error for Sentry");
        } catch (error) {
          Sentry.captureException(error);
        }
      }}
    >
      Test Sentry Error
    </button>
  );
}
```

3. Check your Sentry dashboard for the captured error 