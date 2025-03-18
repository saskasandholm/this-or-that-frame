'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface NavLink {
  href: string;
  label: string;
}

const navLinks: NavLink[] = [
  { href: '/', label: 'Home' },
  { href: '/ui-showcase', label: 'UI Showcase' },
];

const MainNav: React.FC = () => {
  const pathname = usePathname();

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-gray-800/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/">
              <div className="flex items-center gap-2">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-full w-8 h-8 flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold">T</span>
                </div>
                <span className="font-bold text-lg bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
                  This or That
                </span>
              </div>
            </Link>
          </div>

          <div className="hidden md:block">
            <nav className="flex items-center space-x-4">
              {navLinks.map(link => (
                <Link key={link.href} href={link.href}>
                  <Button
                    variant={pathname === link.href ? 'default' : 'ghost'}
                    className={cn(
                      pathname === link.href
                        ? 'bg-primary/80 text-primary-foreground'
                        : 'text-foreground hover:bg-primary/10'
                    )}
                  >
                    {link.label}
                  </Button>
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex md:hidden">
            <nav className="flex items-center space-x-2">
              {navLinks.map(link => (
                <Link key={link.href} href={link.href}>
                  <Button
                    variant={pathname === link.href ? 'default' : 'ghost'}
                    size="sm"
                    className={cn(
                      pathname === link.href
                        ? 'bg-primary/80 text-primary-foreground'
                        : 'text-foreground hover:bg-primary/10'
                    )}
                  >
                    {link.label}
                  </Button>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainNav;
