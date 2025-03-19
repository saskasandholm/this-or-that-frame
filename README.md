# This or That - Farcaster Frame Application

A web application that presents binary choices to users, collects votes, and shows community results. Built as a Farcaster Frame with Next.js and Prisma.

## Features

- **Interactive Voting Interface**: Engaging UI for making binary choices
- **Real-time Results**: View community vote distributions after participating
- **First Time User Experience**: Guided onboarding for new users
- **Direct Challenges**: Challenge friends to answer the same questions
- **Educational Content**: "Did You Know" facts related to each topic
- **Admin Dashboard**: Manage topics and monitor engagement
- **Trending & Past Topics**: Browse popular topics and see voting history
- **Farcaster Authentication**: Sign in with your Farcaster account to track voting history and achievements

## Demo

Check out the various components of the application in our demo pages:

- [First Time User Experience](/demo/first-time)
- [Did You Know Facts](/demo/did-you-know)
- [Direct Challenge](/demo/direct-challenge)
- [Frame Save Prompt](/demo/frame-save)

## Tech Stack

- **Framework**: Next.js 15.2
- **Database**: SQLite with Prisma ORM
- **Styling**: Tailwind CSS v4 with shadcn/ui components
- **Animations**: Framer Motion
- **Integration**: Farcaster Frame SDK
- **Authentication**: Farcaster Auth-kit
- **Monitoring**: Sentry for error tracking, Vercel Analytics for performance

## Getting Started

### Prerequisites

- Node.js 18.0+
- npm or yarn

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/this-or-that.git
   cd this-or-that
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up the database:

   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Visit `http://localhost:3000` to see the application

### Environment Variables

Create a `.env` file in the root directory with:

```
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secret-key"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
SENTRY_DSN="your-sentry-dsn" # Optional, for error tracking
```

## Project Structure

- `/src/app` - Next.js application routes
- `/src/components` - Reusable UI components
- `/src/lib` - Utility functions and shared logic
- `/src/hooks` - Custom React hooks
- `/src/context` - React context providers
- `/prisma` - Database schema and migrations
- `/docs` - Project documentation and implementation notes

## Authentication

This project uses Farcaster Auth-kit for authentication. Users can sign in with their Farcaster accounts to track their voting history, earn achievements, and access protected features.

Key authentication features include:

- Sign in with Farcaster account
- Persistent sessions with secure cookies
- Protected routes with middleware
- User profile data from Farcaster

For more details, see the [Farcaster Authentication Documentation](/docs/FARCASTER_AUTH.md).

## Working with Components

### shadcn/ui Component Considerations

When working with shadcn/ui components, be aware of their underlying HTML structure:

- `CardDescription` renders as a `<p>` element
- `Badge` renders as a `<div>` element

This means you should avoid nesting components that render as block elements (like `Badge`) inside components that render as paragraph elements (like `CardDescription`). Instead, structure your components like this:

```tsx
<CardHeader>
  <div className="flex justify-between items-center mb-1">
    <CardTitle>Topic Title</CardTitle>
    <Badge>Closed</Badge>
  </div>
  <CardDescription>Total votes: 12,345</CardDescription>
</CardHeader>
```

### Image Handling

For avatars and user images, we recommend:

1. Using dynamic avatar services like DiceBear API
2. Adding fallback images for missing resources
3. Optimizing images for performance

## Farcaster Frame Implementation

This application implements the Farcaster Frame v2 specification, allowing it to be embedded in Farcaster clients. The frame implementation includes:

- Meta tags for frame definition
- API endpoints for frame interactions
- Frame state management
- Dynamic OG images for topics and results

For more details, see the [Frame Implementation Documentation](/docs/FRAME_IMPLEMENTATION.md).

## Troubleshooting

If you encounter issues during development, check our [Troubleshooting Guide](/docs/TROUBLESHOOTING.md) for solutions to common problems with:

- Tailwind CSS v4 configuration
- shadcn/ui components
- Next.js 15.2 compatibility
- React 19 features
- DOM nesting errors
- Image loading issues
- Authentication issues

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Farcaster](https://www.farcaster.xyz/) for the Frames specification and Auth-kit
- [shadcn/ui](https://ui.shadcn.com/) for the component system
- [Next.js](https://nextjs.org/) for the web framework
- [Prisma](https://www.prisma.io/) for the database ORM
