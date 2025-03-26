import type { Metadata } from 'next';
import { Inter as FontSans } from 'next/font/google';
import './globals.css';
import NavigationBar from '@/components/NavigationBar';
import { cn } from '@/lib/utils';
import { Analytics } from '@vercel/analytics/react';
import { Providers } from './providers';
import '@farcaster/auth-kit/styles.css';

// Import the error monitoring system initialization
import ErrorMonitoringInitializer from '@/components/ErrorMonitoringInitializer';

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'This or That - Frame Demo',
  description: 'A Farcaster Frames v2 demo app',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
};

// Global error handler for client-side code
function ErrorHandler() {
  if (typeof window !== 'undefined') {
    window.addEventListener('error', (event) => {
      console.error('Global error caught:', event.error);
    });
    
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Global unhandled rejection:', event.reason);
      // Prevent the error from propagating to Next.js error handler
      event.preventDefault();
    });
  }
  
  return null;
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={cn(
          'min-h-screen bg-gradient-to-b from-background via-background/95 to-background/90 font-sans antialiased',
          fontSans.variable
        )}
        style={{ overscrollBehaviorX: 'auto' }}
      >
        <Providers>
          {/* Add error monitoring initializer */}
          <ErrorMonitoringInitializer />
          {/* Add global error handler */}
          <ErrorHandler />
          <div className="relative flex min-h-screen flex-col">
            <NavigationBar />
            <main className="flex-1 pt-16">{children}</main>
            <footer className="border-t border-border/10 py-6 backdrop-blur-sm">
              <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
                <p className="text-center text-sm text-muted-foreground">
                  Built with Next.js 15.2, React 19, and shadcn/ui
                </p>
                <div className="flex items-center gap-4">
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    GitHub
                  </a>
                  <a
                    href="https://warpcast.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Warpcast
                  </a>
                </div>
              </div>
            </footer>
          </div>
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
