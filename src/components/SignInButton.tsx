'use client';

import { SignInButton as FarcasterSignInButton } from '@farcaster/auth-kit';
import { useProfile } from '@farcaster/auth-kit';

export function SignInButton({ className }: { className?: string }) {
  const { isAuthenticated } = useProfile();
  
  // Don't show the button if already authenticated
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className={className}>
      <FarcasterSignInButton />
    </div>
  );
}
