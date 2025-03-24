'use client';

import { LogOut } from 'lucide-react';

interface SignOutButtonProps {
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function SignOutButton({ children, className, onClick }: SignOutButtonProps) {
  
  const handleSignOut = async (event: React.MouseEvent<HTMLButtonElement>) => {
    // Prevent default button behavior
    event.preventDefault();
    
    try {
      console.log('[SignOutButton] Signing out...');
      
      // Clear Farcaster AuthKit session data
      if (typeof window !== 'undefined') {
        // Clear all auth-related data from localStorage
        localStorage.removeItem('fc:session:v1');
        localStorage.removeItem('fc:session:backup:v1');
        localStorage.removeItem('fc:authstate');
        
        // Remove any potential cookies as well (belt and suspenders approach)
        document.cookie = 'fc:session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      }
      
      // Call the optional callback
      if (onClick) onClick();
      
      console.log('[SignOutButton] Sign out successful, reloading page...');
      
      // Brief delay before reload to ensure everything is cleared
      setTimeout(() => {
        window.location.reload();
      }, 100);
    } catch (error) {
      console.error('[SignOutButton] Error signing out:', error);
    }
  };
  
  return (
    <button 
      className={className}
      onClick={handleSignOut}
      type="button"
    >
      {children || (
        <>
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </>
      )}
    </button>
  );
} 