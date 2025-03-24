import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifyAdminAccess } from '@/lib/admin-auth';
import { FarcasterUser } from '@/hooks/useAuthState';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Get auth cookie with proper async handling for Next.js 15
  const cookieStore = await cookies();
  const authCookie = cookieStore.get('farcaster_auth');
  
  // Get Farcaster auth cookie
  const farcasterAuthCookie = cookieStore.get('farcaster_user');
  
  let user: FarcasterUser | null = null;
  
  // Try to get user from Farcaster auth first
  if (farcasterAuthCookie?.value) {
    try {
      const farcasterUser = JSON.parse(farcasterAuthCookie.value);
      if (farcasterUser && typeof farcasterUser.fid === 'number') {
        user = {
          fid: farcasterUser.fid,
          username: farcasterUser.username || '',
          displayName: farcasterUser.displayName || farcasterUser.username || '',
          pfpUrl: farcasterUser.pfpUrl || '',
        };
      }
    } catch (error) {
      console.error('Error parsing Farcaster auth cookie:', error);
    }
  }
  
  // Fallback to legacy auth cookie if no Farcaster user
  if (!user && authCookie?.value) {
    try {
      user = JSON.parse(authCookie.value) as FarcasterUser;
    } catch (error) {
      console.error('Error parsing legacy auth cookie:', error);
    }
  }
  
  // If no authenticated user found, redirect to home
  if (!user) {
    redirect('/?login=required');
  }
  
  // Verify admin access
  const admin = await verifyAdminAccess(user.fid);
  
  if (!admin) {
    console.error('User not authorized as admin:', user.fid);
    redirect('/');
  }
  
  return (
    <div className="admin-layout flex h-screen bg-background text-foreground">
      <AdminSidebar role={admin.role} permissions={admin.permissions} />
      <main className="flex-1 overflow-y-auto p-6">
        {children}
      </main>
    </div>
  );
} 