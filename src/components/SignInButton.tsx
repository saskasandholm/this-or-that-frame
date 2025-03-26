'use client';

import { SignInButton as FarcasterSignInButton } from '@farcaster/auth-kit';

export function SignInButton() {
  return (
    <FarcasterSignInButton
      onSuccess={({ fid, username }) => {
        console.log(`Successfully signed in with Farcaster! Username: ${username}, FID: ${fid}`);
      }}
    />
  );
}
