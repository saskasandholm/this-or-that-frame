# Deployment Guide

*Last Updated: March 25, 2025*

## Prerequisites

- Node.js 18.0+
- npm or yarn
- Git
- Vercel account
- Farcaster account (for frame verification)

## Pre-Deployment Checklist

Before deploying, ensure:

1. **ESM/CommonJS Compatibility**: Verify the project uses consistent module syntax
   - Confirm `package.json` has the correct `"type": "commonjs"` setting
   - Check that config files use appropriate syntax
   - Run the app locally to confirm no module-related errors

2. **Error Handling**: The application includes robust error handling
   - Error boundaries on critical components
   - Proper API error handling with retry logic
   - User-friendly error messages for wallet operations
   - Error logging system configured and working

## Environment Variables

Ensure the following environment variables are set in your Vercel project:

```bash
# Required
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Optional but recommended
DATABASE_URL=your_database_url
FRAME_PUBLIC_KEY=your_frame_public_key
API_KEY=your_api_key

# Frame configuration
NEXT_PUBLIC_FRAME_IMAGE_URL=https://your-domain.com/api/og
NEXT_PUBLIC_FRAME_POST_URL=https://your-domain.com/api/frame
```

## Deployment Steps

### 1. Local Preparation

```bash
# Install dependencies
npm install

# Clean the build cache
rm -rf .next

# Build locally to test
npm run build

# Run tests
npm test
```

### 2. Git Setup

```bash
# Initialize Git (if not already done)
git init

# Add all files
git add .

# Commit changes
git commit -m "Initial commit"

# Add remote (if not already done)
git remote add origin your-repository-url

# Push to main branch
git push -u origin main
```

### 3. Vercel Deployment

### Deployment Date

- Last Production Deployment: March 21, 2024

### Current Deployment

- **Production URL**: [https://frame-lovat.vercel.app](https://frame-lovat.vercel.app)
- **Frame API URL**: [https://frame-lovat.vercel.app/api](https://frame-lovat.vercel.app/api)

### Environment Variables

The following environment variables must be set in your Vercel project settings:

- `DATABASE_URL`: Connection string to your Supabase PostgreSQL database
- `NEXT_PUBLIC_FARCASTER_HUB_URL`: URL for the Farcaster hub (e.g., `https://hub.farcaster.xyz`)
- `NEXT_PUBLIC_SITE_URL`: The URL where your application is deployed

### Build Settings

- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Node.js Version**: 18.x

### Post-Deployment Verification

After deploying your Frame, verify it works correctly:

1. Go to [https://warpcast.com/~/developers/frames](https://warpcast.com/~/developers/frames)
2. Enter your deployed Frame URL
3. Verify the frame renders correctly and interactions work as expected

See [FRAME_TESTING.md](./FRAME_TESTING.md) for more detailed testing procedures.

## Troubleshooting Deployment Issues

If you encounter deployment issues, check:

1. **Environment Variables**: Ensure all required environment variables are properly set
2. **Database Connection**: Verify the database connection string is correct 
3. **Build Logs**: Review the Vercel build logs for errors
4. **API Routes**: Test API endpoints directly to isolate frame-specific issues

For more specific troubleshooting, see [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

### 4. Post-Deployment Verification

1. Verify the frame works in Warpcast's frame validator
2. Test all API endpoints
3. Verify environment variables are properly set
4. Check frame discovery and interactions
5. Verify database connections (if applicable)
6. Test error handling by intentionally triggering errors

### 5. Monitoring

Monitor your deployment using:

- Vercel Analytics
- Application logs
- Error tracking
- Performance metrics

## Troubleshooting

### Common Issues

1. **Frame Not Detected**

   - Verify meta tags are correct
   - Check frame image URL is accessible
   - Validate frame post URL is responding correctly

2. **Environment Variables**

   - Double-check all required variables are set
   - Verify variable names match the application's expectations
   - Check for any missing or incorrect values

3. **Build Failures**

   - Check build logs for errors
   - Verify all dependencies are installed
   - Check for any TypeScript or ESLint errors
   
4. **Module Errors**

   - Ensure `package.json` has the correct `"type"` setting
   - Check that configuration files use the right module syntax
   - Verify that imported modules are compatible with your module system

5. **Error Handling Issues**

   - Verify error boundary components are properly implemented
   - Check API error handling with retry logic is working
   - Ensure error messages are user-friendly and informative

### Support

For additional support:

1. Check the [Troubleshooting Guide](./TROUBLESHOOTING.md)
2. Review [Farcaster Frame documentation](https://docs.farcaster.xyz/reference/frames/spec)
3. Contact the development team

## Maintenance

### Regular Tasks

1. Monitor error logs
2. Update dependencies regularly
3. Review and update documentation
4. Perform security audits
5. Monitor performance metrics

### Updates

When pushing updates:

1. Test thoroughly in staging environment
2. Follow the deployment checklist
3. Monitor the deployment for any issues
4. Update documentation as needed
