# Troubleshooting Guide

This guide contains solutions for common issues you might encounter while working with our tech stack: Tailwind CSS v4, shadcn/ui, React 19, and Next.js 15.

## Table of Contents

- [UI Styling Issues](#ui-styling-issues)
- [Tailwind CSS v4 Upgrade Issues](#tailwind-css-v4-upgrade-issues)
- [React 19 Compatibility Issues](#react-19-compatibility-issues)
- [Dependency Conflicts](#dependency-conflicts)
- [Build and Performance Issues](#build-and-performance-issues)
- [TypeScript Configuration](#typescript-configuration)

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

## Additional Resources

- [Tailwind CSS v4 Documentation](https://tailwindcss.com/docs)
- [Next.js 15 Documentation](https://nextjs.org/docs)
- [React 19 Documentation](https://react.dev)
- [shadcn/ui Documentation](https://ui.shadcn.com)

If you encounter an issue not covered in this guide, please add it along with the solution to help future developers.
