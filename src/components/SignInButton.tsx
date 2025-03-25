'use client';

import { SignInButton as FarcasterSignInButton } from '@farcaster/auth-kit';
import { useProfile } from '@farcaster/auth-kit';
import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';

export function SignInButton({ className, compact = false }: { className?: string, compact?: boolean }) {
  const { isAuthenticated } = useProfile();
  
  // Don't show the button if already authenticated
  if (isAuthenticated) {
    return null;
  }

  if (compact) {
    return (
      <Button size="sm" variant="ghost" className={className}>
        <LogIn className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <div className={className}>
      <FarcasterSignInButton />
    </div>
  );
}
