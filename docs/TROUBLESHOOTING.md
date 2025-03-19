# Troubleshooting Guide

This guide contains solutions for common issues you might encounter while working with our tech stack: Tailwind CSS v4, shadcn/ui, React 19, and Next.js 15.2.

## Table of Contents

- [UI Styling Issues](#ui-styling-issues)
- [Tailwind CSS v4 Upgrade Issues](#tailwind-css-v4-upgrade-issues)
- [React 19 Compatibility Issues](#react-19-compatibility-issues)
- [Next.js 15.2 Compatibility Issues](#next-js-152-compatibility-issues)
- [Dependency Conflicts](#dependency-conflicts)
- [Build and Performance Issues](#build-and-performance-issues)
- [TypeScript Configuration](#typescript-configuration)
- [DOM Nesting Issues](#dom-nesting-issues)
- [Image Loading Issues](#image-loading-issues)
- [Friend Leaderboard and Pagination Issues](#friend-leaderboard-and-pagination-issues)
- [React Server Component Issues](#react-server-component-issues)

## UI Styling Issues

### Issue: Missing styles for shadcn/ui components

**Symptoms:**

- Components appear without styling
- Basic HTML controls are visible instead of styled components
- Console errors about missing CSS

**Solutions:**

1. **Correct PostCSS configuration:**

   ```js
   // postcss.config.js
   export default {
     plugins: {
       '@tailwindcss/postcss': {}, // Not 'tailwindcss'
       autoprefixer: {},
     },
   };
   ```

2. **Proper CSS import:**

   ```css
   /* src/app/globals.css */
   @import 'tailwindcss';

   /* Define the cascading layers */
   @layer theme, base, components, utilities;
   ```

3. **Proper theme setup:**

   ```css
   /* In globals.css */
   @theme inline {
     --color-background: var(--background);
     --color-foreground: var(--foreground);
     /* other mappings */
   }
   ```

4. **Clearing cache:**
   ```bash
   rm -rf .next
   rm -rf node_modules/.cache
   npm run dev
   ```

### Issue: Missing UI component functionality

**Symptoms:**

- Components render but don't respond to interactions
- Dialog, popover, or dropdown components don't open

**Solutions:**

1. **Check that all required packages are installed:**

   ```bash
   npm install -D @radix-ui/react-dialog @radix-ui/react-slot class-variance-authority clsx tailwind-merge lucide-react --legacy-peer-deps
   ```

2. **Update component imports:**
   ```tsx
   import { Button } from '@/components/ui/button';
   import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
   ```

## Tailwind CSS v4 Upgrade Issues

### Issue: Incompatibility after upgrading to Tailwind CSS v4

**Symptoms:**

- Styles not working after upgrading from Tailwind CSS v3
- Missing CSS classes in compiled output
- Console errors about unresolved directives

**Solutions:**

1. **Follow the comprehensive upgrade guide:**

   For a step-by-step process, refer to our [Tailwind CSS v4 Upgrade Guide](./TAILWIND_V4_UPGRADE.md).

2. **Update PostCSS plugin:**

   ```bash
   npm install -D @tailwindcss/postcss --legacy-peer-deps
   ```

   ```js
   // postcss.config.js
   export default {
     plugins: {
       '@tailwindcss/postcss': {}, // Not 'tailwindcss'
       autoprefixer: {},
     },
   };
   ```

3. **Update CSS syntax:**

   ```css
   /* Old syntax (v3) */
   @tailwind base;
   @tailwind components;
   @tailwind utilities;

   /* New syntax (v4) */
   @import 'tailwindcss';
   @layer theme, base, components, utilities;
   ```

4. **Use the proper theming approach:**

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

### Issue: Missing CSS variables for colors

**Symptoms:**

- Colors not appearing properly
- Theme colors not changing as expected
- Errors about undefined variables

**Solutions:**

1. **Check your theme inline directive:**

   ```css
   @theme inline {
     --color-background: var(--background);
     /* All color mappings must be defined here */
   }
   ```

2. **Update tailwind.config.js:**

   ```js
   export default {
     // ... other config
     theme: {
       extend: {
         colors: {
           border: 'var(--color-border)',
           input: 'var(--color-input)',
           ring: 'var(--color-ring)',
           background: 'var(--color-background)',
           foreground: 'var(--color-foreground)',
           // ... other colors
         },
       },
     },
   };
   ```

3. **Clear caches and rebuild:**
   ```bash
   rm -rf .next
   rm -rf node_modules/.cache
   npm run dev
   ```

## React 19 Compatibility Issues

### Issue: forwardRef errors with shadcn/ui components

**Symptoms:**

- Errors about `forwardRef` being deprecated
- Components failing to render with React 19

**Solutions:**

1. **Use data-slot attributes instead of forwardRef:**

   ```tsx
   // Instead of forwardRef
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

2. **Update DialogContent component:**
   ```tsx
   function DialogContent({
     className,
     children,
     ...props
   }: React.ComponentProps<typeof DialogPrimitive.Content>) {
     return (
       <DialogPortal>
         <DialogOverlay />
         <DialogPrimitive.Content
           data-slot="dialog-content"
           className={cn('...', className)}
           {...props}
         >
           {children}
           <DialogPrimitive.Close className="...">
             <X className="h-4 w-4" />
             <span className="sr-only">Close</span>
           </DialogPrimitive.Close>
         </DialogPrimitive.Content>
       </DialogPortal>
     );
   }
   ```

### Issue: Module not found errors

**Symptoms:**

- Module not found errors for components or utilities
- React throws "Cannot find module" errors

**Solutions:**

1. **Check import paths:**

   ```tsx
   // Correct imports
   import { cn } from '@/lib/utils';
   ```

2. **Verify tsconfig.json paths:**
   ```json
   {
     "compilerOptions": {
       "paths": {
         "@/*": ["./src/*"]
       }
     }
   }
   ```

## Next.js 15.2 Compatibility Issues

### Issue: Type errors in API route handlers

**Symptoms:**

- Build errors for API routes indicating invalid types for the second argument in handlers
- Error messages like `Type "{ params: { id: string; }; }" is not a valid type for the function's second argument`
- TypeScript errors in route handlers

**Solutions:**

1. **Use proper type definitions for route handlers:**

   ```typescript
   // src/app/api/example/[id]/route.ts
   import { NextRequest, NextResponse } from 'next/server';

   export async function GET(request: NextRequest, context: { params: { id: string } }) {
     // ... handler code
   }
   ```

2. **Alternatively, use type assertion for complex cases:**

   If you're experiencing persistent type errors, you can use type assertions:

   ```typescript
   export async function GET(request: NextRequest, context: any) {
     const id = context.params.id;
     // ... handler code
   }
   ```

3. **Ensure consistent parameter names:**

   Next.js 15.2 is stricter about parameter naming. Use consistent parameter patterns:

   ```typescript
   // Preferred approach
   export async function GET(request: NextRequest, context: { params: { id: string } }) {
     const id = context.params.id;
     // ...
   }

   // Instead of destructuring like this:
   export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
     const id = params.id;
     // ...
   }
   ```

### Issue: Metadata streaming conflicts

**Symptoms:**

- Page loading delays or performance issues
- Metadata not appearing correctly in SEO tools
- Unexpected behavior with client-side transitions

**Solutions:**

1. **Ensure your metadata generation is optimized:**

   ```typescript
   // app/page.tsx
   export const generateMetadata = async () => {
     // Keep metadata generation fast and efficient
     return {
       title: 'My App',
       description: 'Description that loads quickly',
     };
   };
   ```

2. **Use static metadata when possible:**

   ```typescript
   // app/layout.tsx
   export const metadata = {
     title: {
       template: '%s | My App',
       default: 'My App',
     },
     description: 'My App Description',
   };
   ```

3. **Adjust bot behavior for metadata streaming:**

   ```js
   // next.config.js
   module.exports = {
     experimental: {
       // Customize which bots receive non-streamed metadata
       htmlLimitedBots: /Googlebot|Bingbot|Slurp|DuckDuckBot/i,
     },
   };
   ```

### Issue: Error overlay not showing or incomplete

**Symptoms:**

- Error messages difficult to understand
- Stack traces showing limited information
- Development experience regression

**Solutions:**

1. **Ensure dev tools preferences are configured:**

   The new dev tools can be customized via the preferences panel - click on the settings icon in the error overlay.

2. **Check browser console for additional information:**

   Some errors might still be logged in the browser console even if they don't appear in the overlay.

3. **Clear browser cache and restart dev server:**
   ```bash
   rm -rf .next
   npm run dev
   ```

## Dependency Conflicts

### Issue: Peer dependency conflicts

**Symptoms:**

- npm install fails with peer dependency errors
- Error message about React version conflicts

**Solutions:**

1. **Use --legacy-peer-deps flag:**

   ```bash
   npm install --legacy-peer-deps
   ```

2. **Update specific dependencies with version pinning:**

   ```bash
   npm install -D @testing-library/react@latest --legacy-peer-deps
   ```

3. **Check for outdated dependencies:**
   ```bash
   npm outdated
   ```

### Issue: ESM compatibility issues

**Symptoms:**

- "Cannot use import statement outside a module" errors
- "SyntaxError: Unexpected token 'export'"

**Solutions:**

1. **Ensure package.json has type module:**

   ```json
   {
     "type": "module"
   }
   ```

2. **Use proper import/export syntax:**

   ```js
   // Use this (ES modules)
   export default {
     // config
   };

   // Not this (CommonJS)
   module.exports = {
     // config
   };
   ```

## Build and Performance Issues

### Issue: Build fails or is extremely slow

**Symptoms:**

- Next.js build process takes too long
- Builds fail with out of memory errors

**Solutions:**

1. **Increase Node.js memory limit:**

   ```bash
   NODE_OPTIONS="--max-old-space-size=4096" npm run build
   ```

2. **Check for large dependencies:**

   ```bash
   npx cost-of-modules
   ```

3. **Use specific port if default is taken:**
   ```bash
   PORT=3007 npm run dev
   ```

### Issue: Hot reloading not working

**Symptoms:**

- Changes not reflected in browser
- Need to manually refresh to see changes

**Solutions:**

1. **Clear Next.js cache:**

   ```bash
   rm -rf .next
   ```

2. **Check for file watching limits on Linux:**
   ```bash
   echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p
   ```

## TypeScript Configuration

### Issue: Type errors with React 19

**Symptoms:**

- Type errors related to React components
- Incompatibility between TypeScript types and React 19

**Solutions:**

1. **Update TypeScript types:**

   ```bash
   npm install -D @types/react@latest @types/react-dom@latest --legacy-peer-deps
   ```

2. **Add specific types for component props:**

   ```tsx
   interface ButtonProps
     extends React.ButtonHTMLAttributes<HTMLButtonElement>,
       VariantProps<typeof buttonVariants> {
     asChild?: boolean;
   }
   ```

3. **Use proper JSX settings in tsconfig.json:**
   ```json
   {
     "compilerOptions": {
       "jsx": "preserve"
     }
   }
   ```

### Issue: Type errors with shadcn/ui components

**Symptoms:**

- Type errors related to shadcn/ui props or components
- TypeScript complaining about missing props

**Solutions:**

1. **Update component props to match data-slot pattern:**

   ```tsx
   function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
     return (
       <div
         data-slot="card"
         className={cn('rounded-lg border bg-card text-card-foreground shadow-sm', className)}
         {...props}
       />
     );
   }
   ```

2. **Use proper import for cn utility:**
   ```tsx
   import { cn } from '@/lib/utils';
   ```

## Common TypeScript and Linter Errors

### Issue: Unknown type errors in catch blocks

**Symptoms:**

- TypeScript errors like `Variable 'error' implicitly has an 'any' type`
- Linter warnings about untyped catch clause variables
- Type safety issues with error handling

**Solutions:**

1. **Properly type catch clause variables:**

   ```typescript
   try {
     // code that might throw
   } catch (error: unknown) {
     // Type error as unknown instead of any
     if (error instanceof Error) {
       console.error(error.message);
     } else {
       console.error('Unknown error:', error);
     }
   }
   ```

2. **Create reusable error handling utilities:**

   ```typescript
   // In a utils file
   export function formatErrorMessage(error: unknown): string {
     if (error instanceof Error) return error.message;
     return String(error);
   }
   ```

3. **Use custom error classes for better type safety:**

   ```typescript
   export class ValidationError extends Error {
     constructor(
       message: string,
       public statusCode = 400
     ) {
       super(message);
       this.name = 'ValidationError';
     }
   }

   // Then in your code
   try {
     if (!isValid(input)) throw new ValidationError('Invalid input');
   } catch (error: unknown) {
     if (error instanceof ValidationError) {
       return { status: error.statusCode, message: error.message };
     }
     // Handle other error types
   }
   ```

### Issue: Type safety with optional parameters

**Symptoms:**

- Type errors with nullable or optional values
- Errors about null not being assignable to a type
- Unexpected runtime errors when using optional parameters

**Solutions:**

1. **Use proper nullable type annotations:**

   ```typescript
   // Instead of this
   function processValue(value?: string) {
     return value.toUpperCase(); // Error: value might be undefined
   }

   // Do this
   function processValue(value?: string) {
     return value?.toUpperCase() ?? '';
   }
   ```

2. **Add runtime validation:**

   ```typescript
   function validateParam(param: unknown, name: string): string {
     if (typeof param !== 'string' || !param) {
       throw new Error(`${name} must be a non-empty string`);
     }
     return param;
   }
   ```

3. **Use type guards:**

   ```typescript
   function isString(value: unknown): value is string {
     return typeof value === 'string';
   }

   function processValue(value: unknown) {
     if (isString(value)) {
       return value.toUpperCase(); // TypeScript knows value is a string
     }
     return '';
   }
   ```

## DOM Nesting Issues

### Issue: DOM nesting validation errors in React components

**Symptoms:**

- Error: "In HTML, `<div>` cannot be a descendant of `<p>`"
- Error: "`<p>` cannot contain a nested `<div>`"
- Hydration errors when using shadcn/ui components

**Solutions:**

1. **Fix nesting in Card components:**

   When using `CardDescription` (which renders as a `<p>` element), avoid placing components that render as `<div>` elements inside it:

   ```tsx
   // Incorrect
   <CardDescription className="flex justify-between items-center">
     <span>Total votes: {totalVotes}</span>
     <Badge variant="outline">Closed</Badge> // Badge renders as a div
   </CardDescription>

   // Correct
   <div className="flex justify-between items-center mb-1">
     <CardTitle className="text-lg">{topic.title}</CardTitle>
     <Badge variant="outline">Closed</Badge>
   </div>
   <CardDescription>
     Total votes: {totalVotes}
   </CardDescription>
   ```

2. **Check component implementation:**

   Review shadcn/ui component implementations to understand which HTML elements they render as:

   - `CardDescription` → `<p>`
   - `Badge` → `<div>`
   - `Button` → `<button>` or specified element

3. **Use proper semantic HTML structure:**

   Follow HTML nesting rules:

   - `<p>` can only contain inline elements, not block elements
   - `<div>` cannot be nested inside `<p>`, `<h1>-<h6>`, `<a>`, etc.
   - Use `<span>` for inline elements inside paragraph tags

## Image Loading Issues

### Issue: Missing images causing 404 errors

**Symptoms:**

- 404 errors for image URLs in the console
- Missing avatar images in the UI
- Error: "The requested resource isn't a valid image"

**Solutions:**

1. **Use dynamic avatar services instead of local images:**

   Replace missing local avatar images with dynamic avatar services:

   ```tsx
   // Original
   avatar: '/images/avatars/alice.jpg'; // 404 if image doesn't exist

   // Fixed
   avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice';
   ```

2. **Check image paths and public directory structure:**

   Ensure your public directory contains the images at the expected paths:

   ```bash
   # Create directories for images
   mkdir -p public/images/avatars

   # Add default placeholder images
   cp placeholder.png public/images/avatars/default.png
   ```

3. **Add fallback for missing images:**

   ```tsx
   <Image
     src={avatar || '/images/default-avatar.png'}
     alt={username}
     width={32}
     height={32}
     className="rounded-full"
     onError={e => {
       e.currentTarget.src = '/images/default-avatar.png';
     }}
   />
   ```

4. **Validate image URLs in your data sources:**

   Ensure all image URLs in your database or mock data point to valid resources.

## Friend Leaderboard and Pagination Issues

### Missing Avatar Component

**Symptom:** When implementing the `FriendLeaderboard` component, you see the error: "Cannot find module '@/components/ui/avatar' or its corresponding type declarations."

**Solution:** Ensure the Avatar component is created at `src/components/ui/avatar.tsx`:

```tsx
// src/components/ui/avatar.tsx
import * as React from 'react';
import { cn } from '@/lib/utils';

const Avatar = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full', className)}
      {...props}
    />
  )
);
Avatar.displayName = 'Avatar';

const AvatarImage = React.forwardRef<HTMLImageElement, React.ImgHTMLAttributes<HTMLImageElement>>(
  ({ className, ...props }, ref) => (
    <img
      ref={ref}
      className={cn('aspect-square h-full w-full object-cover', className)}
      {...props}
    />
  )
);
AvatarImage.displayName = 'AvatarImage';

const AvatarFallback = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex h-full w-full items-center justify-center rounded-full bg-muted',
        className
      )}
      {...props}
    />
  )
);
AvatarFallback.displayName = 'AvatarFallback';

export { Avatar, AvatarImage, AvatarFallback };
```

### Missing Required Dependencies

**Symptom:** When using the `FriendLeaderboard` or related components, you get errors about missing dependencies like Radix UI components.

**Solution:** Install the required dependencies:

```bash
npm install @radix-ui/react-avatar @radix-ui/react-tabs
```

### Pagination Not Working with Server Data

**Symptom:** The Pagination component renders correctly but doesn't update the data when clicking page numbers.

**Solution:** Ensure you're properly handling the page change in your data fetching logic:

```tsx
// Client-side pagination
const [currentPage, setCurrentPage] = useState(1);

// Handler function
const handlePageChange = page => {
  setCurrentPage(page);
  // If using server-side pagination, fetch the new page data
  if (isServerPagination) {
    fetchData({ page });
  }
};

// Component usage
<Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />;
```

For server-side pagination with Next.js, update your URL parameters:

```tsx
// Example with Next.js App Router
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Pagination } from '@/components/ui/pagination';

export default function PaginatedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get('page') || '1');

  const handlePageChange = page => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    router.push(`?${params.toString()}`);
  };

  return <Pagination currentPage={currentPage} totalPages={10} onPageChange={handlePageChange} />;
}
```

### Leaderboard Data Not Updating

**Symptom:** Leaderboard data remains static and doesn't reflect user actions or updated scores.

**Solution:** Implement proper data fetching and state updates:

1. For client-side updates, use SWR or React Query for data fetching with automatic revalidation:

```tsx
import useSWR from 'swr';

function FriendLeaderboardPage() {
  const { data, error, mutate } = useSWR('/api/leaderboard', fetcher);

  // Manually revalidate after important actions
  const handleVoteSubmit = async () => {
    await submitVote();
    mutate(); // Refresh leaderboard data
  };

  return data ? (
    <FriendLeaderboard
      friends={data.friends}
      globalLeaders={data.global}
      currentUserRank={data.userRank}
    />
  ) : (
    <LoadingSkeleton />
  );
}
```

2. For server-side rendering in Next.js, use proper caching strategies and revalidation:

```tsx
// app/leaderboard/page.tsx
export const revalidate = 60; // Revalidate every 60 seconds

export default async function LeaderboardPage() {
  const data = await fetchLeaderboardData();

  return (
    <FriendLeaderboard
      friends={data.friends}
      globalLeaders={data.global}
      currentUserRank={data.userRank}
    />
  );
}
```

### Type Errors with Friend Data

**Symptom:** TypeScript errors related to the `FriendData` interface or missing properties.

**Solution:** Ensure your data matches the expected interface:

```tsx
// Define the expected interface
interface FriendData {
  fid: number; // Farcaster ID (required)
  username: string; // Display name (required)
  avatarUrl?: string; // URL to avatar image (optional)
  score: number; // Activity score (required)
  streak?: number; // Current streak (optional)
  rank: number; // Position (required)
  isFollowing: boolean; // Following status (required)
}

// Transform your API data to match the interface
const transformedData = apiData.map((item, index) => ({
  fid: item.user_id,
  username: item.name || `User ${item.user_id}`,
  avatarUrl: item.avatar,
  score: item.points || 0,
  streak: item.consecutive_days,
  rank: index + 1,
  isFollowing: Boolean(item.is_following),
}));
```

## React Server Component Issues

## Additional Resources

- [Tailwind CSS v4 Documentation](https://tailwindcss.com/docs)
- [Next.js 15 Documentation](https://nextjs.org/docs)
- [React 19 Documentation](https://react.dev)
- [shadcn/ui Documentation](https://ui.shadcn.com)

If you encounter an issue not covered in this guide, please add it along with the solution to help future developers.
