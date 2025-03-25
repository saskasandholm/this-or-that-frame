'use client';

import { useProfile } from '@farcaster/auth-kit';
import Image from 'next/image';
import { useState, useEffect } from 'react';

export const UserProfile = ({ showDetails = true }: { showDetails?: boolean }) => {
  const {
    isAuthenticated,
    profile,
  } = useProfile();
  const [imageError, setImageError] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Force client-side rendering only to prevent hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // Add detailed logging to identify profile data issues
  useEffect(() => {
    if (mounted) {
      console.log('[UserProfile] Auth state:', { 
        isAuthenticated, 
        profile: profile ? {
          fid: profile.fid,
          username: profile.username,
          displayName: profile.displayName,
          pfpUrl: profile.pfpUrl,
          hasPfp: !!profile.pfpUrl
        } : null,
        profileObject: profile
      });
    }
  }, [isAuthenticated, profile, mounted]);

  // Don't render until client-side to prevent hydration issues
  if (!mounted) {
    return null;
  }

  if (!isAuthenticated) {
    return <p>You're not signed in.</p>;
  }

  // Ensure we have a profile object before using it
  if (!profile) {
    console.warn('[UserProfile] Profile is authenticated but profile data is missing');
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-500 text-white font-medium">
          U
        </div>
        <span className="font-medium">User</span>
      </div>
    );
  }

  // Minimal display mode (for header)
  if (!showDetails) {
    return (
      <div className="flex items-center gap-2">
        {profile.pfpUrl && !imageError ? (
          <div className="relative w-8 h-8 rounded-full overflow-hidden bg-secondary">
            <Image 
              src={profile.pfpUrl} 
              alt={profile.username || 'User'} 
              width={32} 
              height={32} 
              className="rounded-full"
              onError={() => setImageError(true)}
              priority
            />
          </div>
        ) : (
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-500 text-white font-medium">
            {profile.username ? profile.username.charAt(0).toUpperCase() : 'U'}
          </div>
        )}
        <span className="font-medium">{profile.displayName || profile.username || 'User'}</span>
      </div>
    );
  }

  // Full profile display
  return (
    <div className="flex items-center gap-4 p-4 bg-secondary/20 rounded-lg">
      {profile.pfpUrl && !imageError ? (
        <div className="relative w-16 h-16 rounded-full overflow-hidden bg-secondary">
          <Image 
            src={profile.pfpUrl} 
            alt={profile.username || 'User'} 
            width={64} 
            height={64} 
            className="rounded-full"
            onError={() => setImageError(true)}
            priority
          />
        </div>
      ) : (
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary-500 text-white text-xl font-medium">
          {profile.username ? profile.username.charAt(0).toUpperCase() : 'U'}
        </div>
      )}
      <div>
        <h3 className="text-lg font-bold">
          {profile.displayName || profile.username || 'User'}
        </h3>
        {profile.username && (
          <p className="text-muted-foreground">@{profile.username}</p>
        )}
        {profile.fid && (
          <p className="text-sm text-muted-foreground mt-1">FID: {profile.fid}</p>
        )}
      </div>
    </div>
  );
};

export default UserProfile; 