'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ThemeToggle } from './ThemeToggle';

interface NavLink {
  href: string;
  label: string;
  icon?: React.ReactNode;
}

const navLinks: NavLink[] = [
  { href: '/', label: 'Home', icon: '🏠' },
  { href: '/ui-showcase', label: 'UI Showcase', icon: '🎨' },
];

const MainNav: React.FC = () => {
  const pathname = usePathname();

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/20 shadow-sm">
      <div className="container mx-auto">
        <div className="flex items-center justify-between h-16">
          <motion.div
            className="flex-shrink-0 flex items-center"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link href="/">
              <div className="flex items-center gap-2 group">
                <div className="bg-gradient-to-r from-primary to-secondary rounded-full w-9 h-9 flex items-center justify-center shadow-lg group-hover:shadow-primary/20 transition-all">
                  <span className="text-white font-bold">T</span>
                </div>
                <span className="font-bold text-lg bg-gradient-to-r from-primary-500 via-secondary-500 to-primary-500 bg-clip-text text-transparent bg-size-200 group-hover:bg-pos-100 transition-all duration-500">
                  This or That
                </span>
              </div>
            </Link>
          </motion.div>

          <motion.nav
            className="flex items-center space-x-1"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {navLinks.map((link, index) => (
              <Link key={link.href} href={link.href} passHref>
                <Button
                  variant={pathname === link.href ? 'default' : 'ghost'}
                  size="sm"
                  className={cn(
                    pathname === link.href
                      ? 'bg-primary/90 text-primary-foreground'
                      : 'text-foreground hover:bg-primary/10',
                    'rounded-full px-4',
                    'transition-all duration-200'
                  )}
                >
                  <span className="mr-1">{link.icon}</span>
                  <span className="hidden sm:inline">{link.label}</span>
                </Button>
              </Link>
            ))}
            <div className="px-1.5 py-1 ml-1 bg-muted/50 rounded-full">
              <ThemeToggle />
            </div>
          </motion.nav>
        </div>
      </div>
    </div>
  );
};

export default MainNav;
