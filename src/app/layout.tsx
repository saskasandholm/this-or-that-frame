import type { Metadata } from 'next';
import { Inter as FontSans } from 'next/font/google';
import './globals.css';
import WalletDetection from '@/components/WalletDetection';
import NavigationBar from '@/components/NavigationBar';
import { cn } from '@/lib/utils';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Analytics } from '@vercel/analytics/react';

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'This or That - Farcaster Frame',
  description: 'A daily choice game that reveals what the Farcaster community really thinks',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={cn(
          'min-h-screen bg-gradient-to-b from-background via-background/95 to-background/90 font-sans antialiased',
          fontSans.variable
        )}
        style={{ overscrollBehaviorX: 'auto' }}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          forcedTheme="dark"
        >
          <WalletDetection />
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
        </ThemeProvider>
      </body>
    </html>
  );
}
