import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdmin, initializeFirstAdmin } from '@/lib/utils';

/**
 * Get the admin status of a user or list all admins
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fid = searchParams.get('fid');
    const listAll = searchParams.get('list') === 'true';

    // Validate FID
    if (!fid) {
      return NextResponse.json({ error: 'Missing FID parameter' }, { status: 400 });
    }

    // Initialize first admin if none exists
    await initializeFirstAdmin(parseInt(fid));

    // For listing all admins, user must be an admin
    if (listAll) {
      const adminStatus = await isAdmin(parseInt(fid), 'full_admin');
      if (!adminStatus) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }

      // Get all active admins
      const admins = await prisma.admin.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'asc' },
      });

      return NextResponse.json({ admins });
    }

    // Just check admin status for the given FID
    const admin = await prisma.admin.findUnique({
      where: { fid: parseInt(fid) },
    });

    if (!admin || !admin.isActive) {
      return NextResponse.json({ isAdmin: false, permissions: null });
    }

    return NextResponse.json({
      isAdmin: true,
      permissions: admin.permissions,
    });
  } catch (error) {
    console.error('Error fetching admin status:', error);
    return NextResponse.json({ error: 'Failed to fetch admin status' }, { status: 500 });
  }
}

/**
 * Add a new admin (requires full_admin permissions)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { adminFid, newAdminFid, permissions = 'moderate' } = body;

    // Validate required fields
    if (!adminFid || !newAdminFid) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate permissions value
    if (!['moderate', 'full_admin'].includes(permissions)) {
      return NextResponse.json(
        { error: 'Invalid permissions value. Must be "moderate" or "full_admin"' },
        { status: 400 }
      );
    }

    // Initialize first admin if none exists
    await initializeFirstAdmin(parseInt(adminFid));

    // Check if user is a full_admin
    const adminStatus = await isAdmin(parseInt(adminFid), 'full_admin');
    if (!adminStatus) {
      return NextResponse.json(
        { error: 'Unauthorized. Full admin permissions required.' },
        { status: 403 }
      );
    }

    // Check if new admin already exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { fid: parseInt(newAdminFid) },
    });

    if (existingAdmin) {
      if (existingAdmin.isActive) {
        return NextResponse.json({ error: 'User is already an admin' }, { status: 400 });
      }

      // Reactivate inactive admin
      const reactivatedAdmin = await prisma.admin.update({
        where: { fid: parseInt(newAdminFid) },
        data: {
          isActive: true,
          permissions,
          updatedAt: new Date(),
        },
      });

      return NextResponse.json({
        message: 'Admin reactivated successfully',
        admin: reactivatedAdmin,
      });
    }

    // Create new admin
    const newAdmin = await prisma.admin.create({
      data: {
        fid: parseInt(newAdminFid),
        permissions,
        isActive: true,
        createdBy: parseInt(adminFid),
      },
    });

    return NextResponse.json({
      message: 'Admin added successfully',
      admin: newAdmin,
    });
  } catch (error) {
    console.error('Error adding admin:', error);
    return NextResponse.json({ error: 'Failed to add admin' }, { status: 500 });
  }
}

/**
 * Remove an admin (requires full_admin permissions)
 */
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const fid = url.searchParams.get('fid');
    const body = await request.json();
    const { targetFid } = body;

    // Validate required fields
    if (!fid || !targetFid) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if user is a full_admin
    const adminStatus = await isAdmin(parseInt(fid), 'full_admin');
    if (!adminStatus) {
      return NextResponse.json(
        { error: 'Unauthorized. Full admin permissions required.' },
        { status: 403 }
      );
    }

    // Check if target admin exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { fid: parseInt(targetFid) },
    });

    if (!existingAdmin || !existingAdmin.isActive) {
      return NextResponse.json({ error: 'Admin not found or already inactive' }, { status: 404 });
    }

    // Deactivate admin
    await prisma.admin.update({
      where: { fid: parseInt(targetFid) },
      data: {
        isActive: false,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ message: 'Admin removed successfully' });
  } catch (error) {
    console.error('Error removing admin:', error);
    return NextResponse.json({ error: 'Failed to remove admin' }, { status: 500 });
  }
}

/**
 * Update admin permissions (requires full_admin permissions)
 */
export async function PATCH(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const fid = url.searchParams.get('fid');
    const body = await request.json();
    const { targetFid, permissions } = body;

    // Validate required fields
    if (!fid || !targetFid || !permissions) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate permissions value
    if (!['moderate', 'full_admin'].includes(permissions)) {
      return NextResponse.json(
        { error: 'Invalid permissions value. Must be "moderate" or "full_admin"' },
        { status: 400 }
      );
    }

    // Check if user is a full_admin
    const adminStatus = await isAdmin(parseInt(fid), 'full_admin');
    if (!adminStatus) {
      return NextResponse.json(
        { error: 'Unauthorized. Full admin permissions required.' },
        { status: 403 }
      );
    }

    // Check if target admin exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { fid: parseInt(targetFid) },
    });

    if (!existingAdmin || !existingAdmin.isActive) {
      return NextResponse.json({ error: 'Admin not found or inactive' }, { status: 404 });
    }

    // Update admin permissions
    await prisma.admin.update({
      where: { fid: parseInt(targetFid) },
      data: {
        permissions,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ message: 'Admin permissions updated successfully' });
  } catch (error) {
    console.error('Error updating admin permissions:', error);
    return NextResponse.json({ error: 'Failed to update admin permissions' }, { status: 500 });
  }
}
