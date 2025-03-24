'use client';

import { SignInButton } from './SignInButton';
import UserProfile from './UserProfile';
import { useProfile } from '@farcaster/auth-kit';
import { SignOutButton } from './SignOutButton';
import { useState, useEffect } from 'react';

export default function TestAuthPage() {
  const { isAuthenticated, profile } = useProfile();
  const [sessionData, setSessionData] = useState<string | null>(null);
  
  // Get session data from localStorage for debugging
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const fcSession = localStorage.getItem('fc:session:v1');
        setSessionData(fcSession);
      } catch (error) {
        console.error('Error reading session data:', error);
      }
    }
  }, []);
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Farcaster Auth Test</h1>
      
      <div className="mb-6 p-4 border rounded-lg">
        <h2 className="text-xl mb-4">Authentication Status</h2>
        <div className="mb-4">
          <p className="mb-1"><strong>isAuthenticated:</strong> {String(isAuthenticated)}</p>
          {isAuthenticated && profile && (
            <div className="mt-2">
              <p className="mb-1"><strong>FID:</strong> {profile.fid}</p>
              <p className="mb-1"><strong>Username:</strong> {profile.username}</p>
              <p className="mb-1"><strong>Display Name:</strong> {profile.displayName}</p>
              {profile.pfpUrl && (
                <p className="mb-1"><strong>Profile Image:</strong> {profile.pfpUrl}</p>
              )}
            </div>
          )}
        </div>
        
        <UserProfile />
        
        {isAuthenticated && (
          <div className="mt-4">
            <SignOutButton className="flex items-center px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md" />
          </div>
        )}
      </div>
      
      <div className="mb-6">
        <h2 className="text-xl mb-2">Sign In</h2>
        <SignInButton />
      </div>
      
      {sessionData && (
        <div className="mb-6 p-4 border rounded-lg">
          <h2 className="text-xl mb-2">Debug: Session Data</h2>
          <div className="overflow-auto max-h-60 p-4 bg-gray-900 text-gray-100 rounded-md">
            <pre className="whitespace-pre-wrap break-all text-xs">
              {sessionData}
            </pre>
          </div>
        </div>
      )}
      
      <div className="mb-6 p-4 border rounded-lg">
        <h2 className="text-xl mb-2">Quick Navigation</h2>
        <div className="flex gap-2 flex-wrap">
          <a href="/" className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md">
            Home
          </a>
          <a href="#" onClick={() => window.location.reload()} className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md">
            Reload Page
          </a>
        </div>
      </div>
    </div>
  );
} 