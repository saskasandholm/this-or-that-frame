# Upgrading to Tailwind CSS v4 with Next.js 15 & React 19

This guide provides detailed instructions for upgrading a Next.js application from Tailwind CSS v3 to v4, while ensuring compatibility with React 19 and shadcn/ui components.

## Overview of Changes in Tailwind CSS v4

Tailwind CSS v4 introduces several key changes:

1. **New Plugin System**: The PostCSS plugin moved to a separate package `@tailwindcss/postcss`
2. **New Import Syntax**: Uses `@import "tailwindcss"` instead of `@tailwind` directives
3. **Native CSS Cascade Layers**: Uses standard CSS `@layer` functionality
4. **CSS Variables for Theming**: Exposes theme tokens as CSS variables
5. **Dynamic Utility Generation**: Supports arbitrary values for most utilities
6. **Modern CSS Features**: Leverages new CSS features like `cascade layers`, `registered custom properties`, and `color-mix()`

## Step-by-Step Upgrade Process

### 1. Install Required Dependencies

```bash
# Install the new PostCSS plugin for Tailwind CSS v4
npm install -D @tailwindcss/postcss --legacy-peer-deps

# Ensure other dependencies are up to date
npm install -D autoprefixer tailwindcss --legacy-peer-deps
```

### 2. Update PostCSS Configuration

Update your `postcss.config.js` file to use the new plugin:

```js
// postcss.config.js
export default {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
};
```

### 3. Update Tailwind Configuration

Make sure your `tailwind.config.js` file uses ES module syntax:

```js
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Your theme extensions using CSS variables
      colors: {
        border: 'var(--color-border)',
        input: 'var(--color-input)',
        ring: 'var(--color-ring)',
        background: 'var(--color-background)',
        foreground: 'var(--color-foreground)',
        primary: {
          DEFAULT: 'var(--color-primary)',
          foreground: 'var(--color-primary-foreground)',
        },
        // ... other colors
      },
      // ... other theme extensions
    },
  },
  plugins: [],
};
```

### 4. Update Global CSS

Replace your `globals.css` file with the new format:

```css
/* Import Tailwind CSS */
@import 'tailwindcss';

/* Define the cascading layers */
@layer theme, base, components, utilities;

/* Theme Variables */
@layer theme {
  :root {
    --background: hsl(240 10% 3.9%);
    --foreground: hsl(0 0% 98%);
    --card: hsl(240 10% 3.9%);
    --card-foreground: hsl(0 0% 98%);
    --popover: hsl(240 10% 3.9%);
    --popover-foreground: hsl(0 0% 98%);
    --primary: hsl(262.1 83.3% 57.8%);
    --primary-foreground: hsl(210 20% 98%);
    --secondary: hsl(217.2 32.6% 17.5%);
    --secondary-foreground: hsl(210 20% 98%);
    --muted: hsl(217.2 32.6% 17.5%);
    --muted-foreground: hsl(215 20.2% 65.1%);
    --accent: hsl(217.2 32.6% 17.5%);
    --accent-foreground: hsl(210 20% 98%);
    --destructive: hsl(0 62.8% 30.6%);
    --destructive-foreground: hsl(210 20% 98%);
    --border: hsl(217.2 32.6% 17.5%);
    --input: hsl(217.2 32.6% 17.5%);
    --ring: hsl(224.3 76.3% 48%);
    --radius: 0.5rem;
    --spacing: 0.25rem;

    /* Additional theme variables as needed */
  }

  /* Dark mode overrides if needed */
  @media (prefers-color-scheme: dark) {
    :root {
      /* Dark mode variable overrides */
    }
  }
}

/* Theme inline directive for mapping CSS variables */
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
}

/* Base styles */
@layer base {
  body {
    /* Your base styles */
  }
}

/* Custom components */
@layer components {
  /* Your component styles */
}

/* Custom utilities */
@layer utilities {
  /* Your utility styles */
}
```

### 5. Update shadcn/ui Components for React 19

To ensure shadcn/ui components work with React 19 and Tailwind CSS v4:

1. **Update each component to use `data-slot` instead of `forwardRef`**:

```tsx
// Before (with forwardRef)
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  }
);
Button.displayName = 'Button';

// After (with data-slot)
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

2. **Update Dialog components**:

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
        className={cn(
          'fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg',
          className
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}
```

3. **Apply this pattern to all shadcn/ui components**

### 6. Clear Cache and Start Development Server

```bash
# Clear Next.js cache
rm -rf .next

# Clear node_modules cache
rm -rf node_modules/.cache

# Start development server
npm run dev
```

## Common Issues and Solutions

### Issue: Styles not appearing

**Symptoms:**

- Components appear unstyled
- Basic HTML controls instead of styled components

**Solutions:**

1. Check that `postcss.config.js` uses `@tailwindcss/postcss` not `tailwindcss`
2. Verify your CSS has the proper import: `@import "tailwindcss";`
3. Check for proper layer definitions: `@layer theme, base, components, utilities;`
4. Verify the `@theme inline` directive is present for variable mapping
5. Clear the Next.js cache and restart the server

### Issue: React component errors

**Symptoms:**

- Errors about `forwardRef` being deprecated

**Solutions:**

1. Replace `forwardRef` with direct function components
2. Add `data-slot` attributes to components
3. Remove `.displayName` assignments (no longer needed)

### Issue: Console errors about peer dependencies

**Symptoms:**

- npm install fails with peer dependency errors

**Solutions:**

1. Use the `--legacy-peer-deps` flag for installations
2. Update dependencies with specific versions if needed

## Resources

- [Tailwind CSS v4 Documentation](https://tailwindcss.com/docs)
- [Tailwind CSS v4 Migration Guide](https://tailwindcss.com/docs/upgrade-guide)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [React 19 Documentation](https://react.dev)
