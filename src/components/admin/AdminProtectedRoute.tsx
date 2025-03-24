'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAdmin, hasAdminPermission } from '@/hooks/useAdmin';
import { Loader2 } from 'lucide-react';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
}

/**
 * Component that protects routes that require admin access
 * Redirects to home page if user is not an admin or doesn't have the required permission
 */
export default function AdminProtectedRoute({
  children,
  requiredPermission
}: AdminProtectedRouteProps) {
  const adminState = useAdmin();
  const router = useRouter();
  
  useEffect(() => {
    // Wait for admin status to load
    if (adminState.isLoading) return;
    
    // If not an admin, redirect to home
    if (!adminState.isAdmin) {
      router.push('/');
      return;
    }
    
    // If permission required but not granted, redirect to admin home
    if (requiredPermission && !hasAdminPermission(adminState, requiredPermission)) {
      router.push('/admin');
    }
  }, [adminState, router, requiredPermission]);
  
  // Show loading indicator while checking admin status
  if (adminState.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Verifying admin access...</span>
      </div>
    );
  }
  
  // Not an admin, don't render anything while redirecting
  if (!adminState.isAdmin) {
    return null;
  }
  
  // Has required permission, render children
  if (!requiredPermission || hasAdminPermission(adminState, requiredPermission)) {
    return <>{children}</>;
  }
  
  // Missing required permission, don't render anything while redirecting
  return null;
} 