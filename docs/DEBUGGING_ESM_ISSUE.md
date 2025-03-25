# ESM/CommonJS Compatibility Issue

*Last Updated: March 25, 2025*


## Issue Description

The application is currently experiencing a critical error related to ES Modules compatibility with Next.js:

```
[Error: require() of ES Module /Users/saskasandholm/frame/.next/server/pages/_document.js from /Users/saskasandholm/frame/node_modules/next/dist/server/require.js not supported.
_document.js is treated as an ES module file as it is a .js file whose nearest parent package.json contains "type": "module" which declares all .js files in that package scope as ES modules.
```

This error occurs because:

1. Our project has `"type": "module"` in package.json, which marks all `.js` files as ES modules
2. Next.js special files like `_document.js` internally use CommonJS (require/module.exports)
3. This creates a conflict when Next.js tries to load these files using CommonJS in an ESM project

## Diagnosis

The root cause is that Next.js special pages (`_document.js`, `_app.js`) are required by Next.js using CommonJS's `require()` function, but our project is configured to treat all `.js` files as ES modules, which don't support `require()`.

This is confirmed by the detailed error message in the server logs:

```
code: 'ERR_REQUIRE_ESM',
page: '/'
```

This error is preventing the application from properly rendering and is affecting all routes.

## Potential Solutions

According to the error message and Farcaster Frames v2 documentation, there are three possible solutions:

1. **Rename special files to `.cjs` extension**

   - Change special Next.js files to use the `.cjs` extension to explicitly mark them as CommonJS
   - Example: `_document.js` → `_document.cjs`

2. **Use dynamic imports in Next.js**

   - Not feasible as we can't modify Next.js internal code

3. **Change module type in package.json (recommended)**
   - Change `"type": "module"` to `"type": "commonjs"` in package.json
   - Or remove the `"type"` field entirely (defaults to CommonJS)

## Recommended Solution

The recommended solution is option 3 - modifying the package.json file to change or remove the `"type": "module"` declaration.

This is the preferred approach because:

1. It's the least intrusive change
2. It maintains compatibility with Next.js conventions
3. It aligns with the Farcaster Frames v2 example which uses CommonJS
4. It doesn't require renaming files or changing import/export syntax

## Implementation Steps

1. Edit `package.json` and either:

   - Remove the `"type": "module"` line entirely, or
   - Change it to `"type": "commonjs"`

2. Clean the Next.js cache:

   ```bash
   rm -rf .next
   ```

3. Restart the development server:
   ```bash
   npm run dev
   ```

## Additional Recommendations

While fixing the ESM/CommonJS issue, we should also address the deprecated image configuration:

```
⚠ The "images.domains" configuration is deprecated. Please use "images.remotePatterns" configuration instead.
```

This requires updating the Next.js configuration in `next.config.js` to use the newer `remotePatterns` syntax for external images.

## Resolution Status

### ✅ Issue Fixed Successfully

We have successfully resolved the ESM/CommonJS compatibility issue by:

1. Changed `"type": "module"` to `"type": "commonjs"` in package.json
2. Updated all configuration files to use CommonJS syntax:
   - next.config.js
   - postcss.config.js
   - tailwind.config.js
   - eslint.config.js
3. Converted ES Module imports to CommonJS requires in multiple files:
   - sentry.client.config.js
   - sentry.edge.config.js
   - sentry.server.config.js
   - prisma/seed.js
   - scripts/verify-env.js

### Application Status

- The application is now running properly on http://localhost:3000
- All routes and pages are functioning correctly, including:
  - Homepage `/`
  - Wallet demonstration page `/wallet-demo`

### Lessons Learned

1. Next.js special files (like `_document.js`, `_app.js`) are required by Next.js using CommonJS require, which doesn't work with ES modules.
2. When using the Frame SDK in a Next.js project, it's safest to stick with CommonJS module format to avoid conflicts.
3. Besides changing package.json, all configuration files and server-side files need consistent module syntax.
4. Clearing the Next.js cache with `rm -rf .next` after configuration changes is crucial for testing changes properly.

## Next Steps

1. Complete the remaining image configuration update task:

   ```
   ⚠ The "images.domains" configuration is deprecated. Please use "images.remotePatterns" configuration instead.
   ```

2. Test the wallet integration functionality in the Farcaster Frame environment to ensure everything works as expected.

## Reference

This solution was based on:

1. The detailed error message from Node.js
2. Next.js documentation on module systems
3. Farcaster Frames v2 reference implementation
