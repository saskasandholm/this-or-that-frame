'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export interface AdminState {
  isAdmin: boolean;
  role: string | null;
  permissions: Record<string, boolean>;
  isLoading: boolean;
  error: string | null;
}

const DEFAULT_ADMIN_STATE: AdminState = {
  isAdmin: false,
  role: null,
  permissions: {},
  isLoading: true,
  error: null
};

/**
 * Hook for accessing admin status and permissions
 * @returns AdminState object with admin status and permissions
 */
export function useAdmin(): AdminState {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [adminState, setAdminState] = useState<AdminState>(DEFAULT_ADMIN_STATE);

  useEffect(() => {
    // Reset loading when auth status changes
    if (authLoading) {
      setAdminState(prev => ({ ...prev, isLoading: true }));
      return;
    }
    
    // If not authenticated, not an admin
    if (!isAuthenticated || !user) {
      setAdminState({
        isAdmin: false,
        role: null,
        permissions: {},
        isLoading: false,
        error: null
      });
      return;
    }

    // Check admin status
    const checkAdminStatus = async () => {
      try {
        const res = await fetch(`/api/admin/verify?fid=${user.fid}`);
        
        if (res.ok) {
          const data = await res.json();
          setAdminState({
            isAdmin: true,
            role: data.role,
            permissions: data.permissions,
            isLoading: false,
            error: null
          });
        } else {
          // Not an admin or error
          const errorData = await res.json();
          setAdminState({
            isAdmin: false,
            role: null,
            permissions: {},
            isLoading: false,
            error: errorData.error || 'Failed to verify admin status'
          });
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setAdminState({
          isAdmin: false,
          role: null,
          permissions: {},
          isLoading: false,
          error: error instanceof Error ? error.message : 'Unknown error checking admin status'
        });
      }
    };

    checkAdminStatus();
  }, [isAuthenticated, authLoading, user]);

  return adminState;
}

/**
 * Check if the admin has a specific permission
 * @param adminState Current admin state
 * @param permission Permission to check
 * @returns Boolean indicating if permission is granted
 */
export function hasAdminPermission(adminState: AdminState, permission: string): boolean {
  if (!adminState.isAdmin) return false;
  
  // Super admins have all permissions
  if (adminState.role === 'SUPER_ADMIN') return true;
  
  // Check specific permission
  return adminState.permissions[permission] === true;
} 