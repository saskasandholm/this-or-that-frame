# Setup Guide

This document provides detailed instructions for setting up the "This or That" Farcaster Frame project.

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v18 or later, v20+ recommended)
- npm or yarn
- Git

## Installation Steps

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/this-or-that-frame.git
   cd this-or-that-frame
   ```

2. **Install dependencies**

   Use the `--legacy-peer-deps` flag to handle React 19 compatibility issues:

   ```bash
   npm install --legacy-peer-deps
   # or
   yarn install --legacy-peer-deps
   ```

3. **Set up environment variables**

   Copy the example environment file and update it with your settings:

   ```bash
   cp .env.example .env
   ```

   Edit the `.env` file to include:

   - `NEXT_PUBLIC_APP_URL`: Your application URL (e.g., http://localhost:3000 for development)
   - `DATABASE_URL`: Your database connection string (defaults to SQLite)
   - `NEXT_PUBLIC_FRAME_IMAGE_URL`: URL for frame images (defaults to http://localhost:3000/api/og)
   - `NEXT_PUBLIC_FRAME_POST_URL`: URL for frame POST endpoint (defaults to http://localhost:3000/api/frame)
   - Other optional variables as needed

4. **Verify environment variables**

   The project includes an environment validation script that checks for required variables:

   ```bash
   npm run verify-env
   ```

   This script will alert you if any required variables are missing. It is automatically run before the development and build processes.

5. **Initialize the database**

   ```bash
   # Generate Prisma client
   npx prisma generate

   # Create database and run migrations
   npx prisma migrate dev --name init

   # Seed the database with initial data
   npm run seed
   ```

6. **Start the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

   Your application should now be running at [http://localhost:3000](http://localhost:3000) (or another port if 3000 is in use).

## Next.js 15.2 Compatibility

This project uses Next.js 15.2, which includes several important features and changes:

1. **API Route Handler Types**

   Next.js 15.2 has stricter type requirements for API route handlers. Use the following pattern:

   ```typescript
   // src/app/api/route.ts
   import { NextRequest, NextResponse } from 'next/server';

   export async function GET(request: NextRequest) {
     // Handler code...
     return NextResponse.json({ data: 'example' });
   }

   // For dynamic routes (src/app/api/[id]/route.ts)
   export async function GET(request: NextRequest, context: { params: { id: string } }) {
     const id = context.params.id;
     // Handler code...
     return NextResponse.json({ id });
   }
   ```

2. **Streaming Metadata**

   Next.js 15.2 supports streaming metadata, which improves initial page load performance:

   ```typescript
   // app/page.tsx
   export const generateMetadata = async () => {
     // This no longer blocks initial UI render
     return {
       title: 'My App',
       description: 'Description',
     };
   };
   ```

3. **Redesigned Error UI**

   Take advantage of the improved error overlay by ensuring your code has proper error boundaries and error handlers.

4. **If Experiencing Type Errors**

   If you encounter persistent type errors in API routes, you can use the `any` type as a temporary solution:

   ```typescript
   export async function GET(request: NextRequest, context: any) {
     const id = context.params.id;
     // Handler code...
     return NextResponse.json({ id });
   }
   ```

For more details on Next.js 15.2 compatibility, see the [Troubleshooting Guide](./TROUBLESHOOTING.md#next-js-152-compatibility-issues).

## Tailwind CSS v4 Configuration

This project uses Tailwind CSS v4, which has some specific requirements:

1. **PostCSS Configuration**

   Ensure your `postcss.config.js` file uses the `@tailwindcss/postcss` plugin:

   ```js
   export default {
     plugins: {
       '@tailwindcss/postcss': {},
       autoprefixer: {},
     },
   };
   ```

2. **Tailwind CSS Import**

   In your `globals.css` file, use the new import syntax:

   ```css
   @import 'tailwindcss';

   /* Define the cascading layers */
   @layer theme, base, components, utilities;
   ```

3. **Theme Configuration**

   Configure your theme variables in `globals.css` using the layer system:

   ```css
   @layer theme {
     :root {
       --background: hsl(240 10% 3.9%);
       --foreground: hsl(0 0% 98%);
       /* other variables */
     }
   }

   @theme inline {
     --color-background: var(--background);
     --color-foreground: var(--foreground);
     /* other mappings */
   }
   ```

4. **Tailwind Configuration**

   The `tailwind.config.js` file should use ES module export syntax:

   ```js
   /** @type {import('tailwindcss').Config} */
   export default {
     content: [
       './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
       './src/components/**/*.{js,ts,jsx,tsx,mdx}',
       './src/app/**/*.{js,ts,jsx,tsx,mdx}',
     ],
     theme: {
       extend: {
         // Theme extensions
       },
     },
     plugins: [],
   };
   ```

For a comprehensive guide on upgrading to Tailwind CSS v4 in a project with React 19 and shadcn/ui, see the [Tailwind CSS v4 Upgrade Guide](./TAILWIND_V4_UPGRADE.md).

## React 19 and shadcn/ui Compatibility

To ensure shadcn/ui components work with React 19:

1. **Component Structure**

   Components should use the `data-slot` attribute pattern instead of `forwardRef`:

   ```tsx
   function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
     const Comp = asChild ? Slot : 'button';
     return (
       <Comp
         data-slot="button"
         className={cn(buttonVariants({ variant, size, className }))}
         {...props}
       />
     );
   }
   ```

2. **Required Dependencies**

   The following dependencies are required for shadcn/ui components:

   ```bash
   npm install -D @radix-ui/react-dialog @radix-ui/react-slot class-variance-authority clsx tailwind-merge lucide-react --legacy-peer-deps
   ```

3. **Utilities**

   Ensure the `cn` utility function is properly defined in `src/lib/utils.ts`:

   ```ts
   import { type ClassValue, clsx } from 'clsx';
   import { twMerge } from 'tailwind-merge';

   export function cn(...inputs: ClassValue[]) {
     return twMerge(clsx(...inputs));
   }
   ```

## Project Structure

- `src/app`: Next.js App Router pages and API routes
- `src/components`: React components
  - `src/components/ui`: shadcn/ui components
- `src/lib`: Utility functions and services
- `src/types`: TypeScript type definitions
- `prisma`: Database schema and migrations
- `docs`: Project documentation
- `__tests__`: Test files

## Module System & Configuration

- **ES Modules**: This project uses ES modules (`"type": "module"` in `package.json`)
- **Import/Export Syntax**: All files use ES module syntax (`import`/`export` instead of `require`/`module.exports`)
- **Build Scripts**: Configuration files like `next.config.js`, `postcss.config.js`, and `scripts/verify-env.js` use ES module syntax

## Troubleshooting Common Issues

If you encounter issues:

1. **Styling Issues**

   - Clear Next.js cache: `rm -rf .next`
   - Clear node_modules cache: `rm -rf node_modules/.cache`
   - Verify your PostCSS configuration is using `@tailwindcss/postcss`
   - Check your globals.css file for proper import and layer structure

2. **Component Issues**

   - Ensure components are not using `forwardRef`
   - Verify `data-slot` attributes are used correctly
   - Check for proper import paths and component exports

3. **Next.js 15.2 Type Issues**

   - For API route handler type errors, use the context pattern shown in the Next.js 15.2 Compatibility section
   - As a last resort, use `context: any` to bypass type checking issues
   - Check for proper parameter types in API route handlers

4. **Dependency Conflicts**
   - Use `--legacy-peer-deps` flag when installing new packages
   - Check for conflicting React versions in your dependencies

For more detailed troubleshooting, see the [Troubleshooting Guide](./TROUBLESHOOTING.md).

## Testing

Run tests using the following commands:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run end-to-end tests
npm run test:e2e
```

## Deployment

This project can be deployed to platforms like Vercel or Netlify. Make sure to:

1. Set up the required environment variables
2. Configure the database connection (PostgreSQL recommended for production)
3. Run database migrations before deployment

For detailed deployment instructions specific to each platform, refer to:

- [Vercel Deployment Guide](https://nextjs.org/docs/deployment)
- [Netlify Deployment Guide](https://www.netlify.com/blog/2020/11/30/how-to-deploy-next.js-sites-to-netlify/)
