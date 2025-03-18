import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import WalletDetection from '@/components/WalletDetection';
import MainNav from '@/components/MainNav';

const inter = Inter({ subsets: ['latin'] });

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
    <html lang="en">
      <body className={inter.className}>
        <WalletDetection />
        <MainNav />
        <div className="pt-16">{children}</div>
      </body>
    </html>
  );
}
