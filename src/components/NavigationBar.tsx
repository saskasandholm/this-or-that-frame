'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Menu,
  X,
  Home,
  Layout,
  Settings,
  Book,
  LayoutDashboard,
  Sparkles,
  Wallet,
  LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SignInButton } from '@/components/SignInButton';
import { useAuth } from '@/context/AuthContext';
import { useAdmin } from '@/hooks/useAdmin';
import UserProfile from '@/components/UserProfile';
import { useProfile } from '@farcaster/auth-kit';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SignOutButton } from '@/components/SignOutButton';

// Client-only component to safely use hooks
const ClientOnly = ({ children }: { children: React.ReactNode }) => {
  const [mounted, setMounted] = useState(false);
  
  React.useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) return null;
  
  return <>{children}</>;
};

export default function NavigationBar() {
  const [isOpen, setIsOpen] = useState(false);
  const { isAdmin, isLoading: isAdminLoading } = useAdmin();
  const { isAuthenticated } = useProfile();

  console.log('[NavigationBar] Auth state:', { isAuthenticated });

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  // Auth profile dropdown
  const AuthMenu = () => {
    const { profile } = useProfile();
    
    // Log profile details for debugging
    console.log('[NavigationBar:AuthMenu] Profile data:', {
      exists: !!profile,
      username: profile?.username,
      displayName: profile?.displayName,
      hasPfp: !!profile?.pfpUrl
    });
    
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="ml-2 p-1 sm:p-2 h-auto">
            <UserProfile showDetails={false} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Your Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <Link href="/profile">
            <DropdownMenuItem>Profile</DropdownMenuItem>
          </Link>
          <Link href="/settings">
            <DropdownMenuItem>Settings</DropdownMenuItem>
          </Link>
          <DropdownMenuSeparator />
          <Link href="/auth-test">
            <DropdownMenuItem>Auth Test Page</DropdownMenuItem>
          </Link>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <div className="w-full">
              <SignOutButton className="w-full text-left flex items-center" />
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  // Use a useEffect to monitor auth state changes
  useEffect(() => {
    console.log('[NavigationBar] Auth state changed:', { isAuthenticated });
  }, [isAuthenticated]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
                This or That
              </span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center justify-center space-x-1 flex-1">
            <Link href="/">
              <Button variant="ghost" size="sm" className="flex items-center">
                <Home className="mr-2 h-4 w-4" />
                Home
              </Button>
            </Link>

            <Link href="/demo">
              <Button variant="ghost" size="sm" className="flex items-center">
                <Sparkles className="mr-2 h-4 w-4" />
                Demos
              </Button>
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center">
                  <Layout className="mr-2 h-4 w-4" />
                  Features
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Component Demos</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link href="/demo/first-time">
                  <DropdownMenuItem>First Time Experience</DropdownMenuItem>
                </Link>
                <Link href="/demo/did-you-know">
                  <DropdownMenuItem>Did You Know</DropdownMenuItem>
                </Link>
                <Link href="/demo/direct-challenge">
                  <DropdownMenuItem>Direct Challenge</DropdownMenuItem>
                </Link>
                <Link href="/demo/frame-save">
                  <DropdownMenuItem>Frame Save Prompt</DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Wallet Features</DropdownMenuLabel>
                <Link href="/wallet-demo">
                  <DropdownMenuItem>Wallet Integration</DropdownMenuItem>
                </Link>
              </DropdownMenuContent>
            </DropdownMenu>

            {isAuthenticated && !isAdminLoading && isAdmin && (
              <Link href="/admin">
                <Button variant="ghost" size="sm" className="flex items-center">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Admin
                </Button>
              </Link>
            )}

            <Link href="/docs">
              <Button variant="ghost" size="sm" className="flex items-center">
                <Book className="mr-2 h-4 w-4" />
                Docs
              </Button>
            </Link>
          </nav>

          <div className="flex items-center">
            <div className="hidden md:block">
              {isAuthenticated ? <AuthMenu /> : <SignInButton />}
            </div>
            
            <div className="flex md:hidden items-center">
              {isAuthenticated ? 
                <AuthMenu /> : 
                <SignInButton className="mr-2" compact={true} />
              }
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMenu}
                aria-label="Toggle menu"
              >
                {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="md:hidden bg-background border-b border-border"
        >
          <div className="container mx-auto px-4 py-4 space-y-3">
            <Link href="/" onClick={closeMenu}>
              <Button variant="ghost" className="w-full justify-start">
                <Home className="mr-2 h-4 w-4" />
                Home
              </Button>
            </Link>

            <Link href="/demo" onClick={closeMenu}>
              <Button variant="ghost" className="w-full justify-start">
                <Sparkles className="mr-2 h-4 w-4" />
                Demos
              </Button>
            </Link>

            <div className="border-t border-border pt-2">
              <p className="px-3 py-1 text-sm font-medium text-muted-foreground">Component Demos</p>
            </div>

            <Link href="/demo/first-time" onClick={closeMenu}>
              <Button variant="ghost" className="w-full justify-start pl-6">
                First Time Experience
              </Button>
            </Link>

            <Link href="/demo/did-you-know" onClick={closeMenu}>
              <Button variant="ghost" className="w-full justify-start pl-6">
                Did You Know
              </Button>
            </Link>

            <Link href="/demo/direct-challenge" onClick={closeMenu}>
              <Button variant="ghost" className="w-full justify-start pl-6">
                Direct Challenge
              </Button>
            </Link>

            <Link href="/demo/frame-save" onClick={closeMenu}>
              <Button variant="ghost" className="w-full justify-start pl-6">
                Frame Save Prompt
              </Button>
            </Link>

            <Link href="/wallet-demo" onClick={closeMenu}>
              <Button variant="ghost" className="w-full justify-start pl-6">
                <Wallet className="mr-2 h-4 w-4" />
                Wallet Integration
              </Button>
            </Link>

            {isAuthenticated && !isAdminLoading && isAdmin && (
              <>
                <div className="border-t border-border pt-2">
                  <p className="px-3 py-1 text-sm font-medium text-muted-foreground">Admin</p>
                </div>

                <Link href="/admin" onClick={closeMenu}>
                  <Button variant="ghost" className="w-full justify-start">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Admin Dashboard
                  </Button>
                </Link>
              </>
            )}

            <Link href="/docs" onClick={closeMenu}>
              <Button variant="ghost" className="w-full justify-start">
                <Book className="mr-2 h-4 w-4" />
                Documentation
              </Button>
            </Link>

            <div className="border-t border-border pt-4 mt-2">
              {!isAuthenticated && <SignInButton className="w-full" />}
              {isAuthenticated && (
                <Link href="/auth-test" onClick={closeMenu}>
                  <Button variant="ghost" className="w-full justify-start">
                    <UserProfile showDetails={false} />
                    <span className="ml-2">View Profile</span>
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </header>
  );
}
