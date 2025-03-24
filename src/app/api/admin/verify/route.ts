import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAccess } from '@/lib/admin-auth';
import { getUserFromRequest } from '@/lib/auth-utils';

/**
 * API route to verify admin status and retrieve permissions
 */
export async function GET(req: NextRequest) {
  try {
    // Get FID from query parameter
    const url = new URL(req.url);
    const fidParam = url.searchParams.get('fid');
    
    if (!fidParam) {
      return NextResponse.json({ error: 'Missing FID parameter' }, { status: 400 });
    }
    
    const fid = parseInt(fidParam);
    
    // Get current authenticated user 
    const user = await getUserFromRequest(req);
    
    // Verify the user is authenticated and matches the requested FID
    if (!user || user.fid !== fid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Verify admin access
    const admin = await verifyAdminAccess(fid);
    
    if (!admin) {
      return NextResponse.json({ error: 'Not an admin' }, { status: 403 });
    }
    
    // Return admin details
    return NextResponse.json({
      isAdmin: true,
      role: admin.role,
      permissions: admin.permissions
    });
    
  } catch (error) {
    console.error('Error verifying admin status:', error);
    return NextResponse.json(
      { error: 'Failed to verify admin status' },
      { status: 500 }
    );
  }
} 