# This or That - Farcaster Frame

A daily choice game that reveals what the Farcaster community really thinks. Built with Next.js 15, React 19, Tailwind CSS v4, and shadcn/ui.

## Features

- Daily "This or That" choices for users to vote on
- Real-time results showing community preferences
- Streak tracking to reward consistent participation
- Achievement system with badges for various accomplishments
- First-Time User Experience (FTUE) with interactive tutorials
- Haptic feedback for enhanced user interaction
- Audio feedback for key interactions
- Frame discovery helpers for easy saving
- Optimized performance for mobile devices
- Comprehensive error handling
- Database integration with Prisma for persistent data

## Tech Stack

This project uses the latest web technologies:

- **Next.js 15**: For server-side rendering and routing
- **React 19**: For component-based UI
- **Tailwind CSS v4**: For utility-first styling
- **shadcn/ui**: For high-quality UI components
- **Prisma**: For database ORM
- **TypeScript**: For type safety
- **Framer Motion**: For smooth animations

## Getting Started

### Prerequisites

- Node.js 18+ (preferably v20+)
- npm or yarn

### Installation

1. Clone the repository

   ```bash
   git clone https://github.com/yourusername/this-or-that-frame.git
   cd this-or-that-frame
   ```

2. Install dependencies (use legacy-peer-deps to handle React 19 conflicts)

   ```bash
   npm install --legacy-peer-deps
   ```

3. Set up environment variables:

   ```bash
   cp .env.example .env
   ```

   Then edit the `.env` file to add your specific configuration.

4. Verify environment variables:

   ```bash
   npm run verify-env
   ```

   This script checks that all required environment variables are set.

5. Initialize the database and seed initial data:

   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   npm run seed
   ```

6. Run the development server

   ```bash
   npm run dev
   ```

7. Open [http://localhost:3000](http://localhost:3000) in your browser (port may vary if 3000 is in use)

## Important Configuration Details

### Tailwind CSS v4 Configuration

This project uses Tailwind CSS v4, which requires specific configuration:

1. **PostCSS Configuration**

   In `postcss.config.js`, we use the specific `@tailwindcss/postcss` plugin:

   ```js
   export default {
     plugins: {
       '@tailwindcss/postcss': {},
       autoprefixer: {},
     },
   };
   ```

2. **CSS Configuration**

   In `src/app/globals.css`, we use the new import syntax and layer structure:

   ```css
   @import 'tailwindcss';

   /* Define the cascading layers */
   @layer theme, base, components, utilities;
   ```

3. **Theme Configuration**

   We use the theme inline directive for CSS variables:

   ```css
   @theme inline {
     --color-background: var(--background);
     --color-foreground: var(--foreground);
     /* ... other mappings */
   }
   ```

For a comprehensive guide on migrating to Tailwind CSS v4 with React 19 and shadcn/ui, see our [Tailwind CSS v4 Upgrade Guide](./docs/TAILWIND_V4_UPGRADE.md).

### React 19 and shadcn/ui Compatibility

To ensure shadcn/ui components work with React 19:

1. All components use the `data-slot` attribute pattern instead of `forwardRef`
2. Component imports are structured to optimize for tree-shaking
3. Dependencies are installed with the `--legacy-peer-deps` flag to handle conflicts

## Troubleshooting

For common issues and solutions, see our [Troubleshooting Guide](./docs/TROUBLESHOOTING.md).

## Project Structure

- `src/app`: Next.js App Router pages and API routes
- `src/components`: React components, including shadcn/ui components
- `src/components/ui`: UI components from shadcn/ui
- `src/lib`: Utility functions and services
- `src/types`: TypeScript type definitions
- `prisma`: Database schema and migrations
- `docs`: Project documentation
- `__tests__`: Test files

## Development Tools

The project includes several development tools to improve workflow:

1. **Environment Validation**

   - Automatic verification of required environment variables
   - Run manually with `npm run verify-env`

2. **ESLint Configuration**

   - Uses ESLint v9 with new configuration format
   - Run manually with `npm run lint`

3. **Clearing Cache**
   - If you encounter UI or build issues, try clearing the cache:
   ```bash
   rm -rf .next
   rm -rf node_modules/.cache
   ```

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

## Documentation

For more detailed documentation, check the following files:

- [Setup Guide](./docs/SETUP.md): Detailed instructions for setting up the project
- [Troubleshooting Guide](./docs/TROUBLESHOOTING.md): Solutions for common issues
- [Technical Reliability](./docs/technical-reliability.md): Information about error handling and performance
- [Architecture](./docs/architecture.md): Overview of the project architecture

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Farcaster](https://www.farcaster.xyz/) for the Frame SDK
- [Next.js](https://nextjs.org/) for the React framework
- [Framer Motion](https://www.framer.com/motion/) for animations
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [shadcn/ui](https://ui.shadcn.com/) for UI components
- [Prisma](https://www.prisma.io/) for the database ORM
