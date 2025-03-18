import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/utils';
import { Prisma } from '@prisma/client';

/**
 * Update admin permissions
 */
export async function PATCH(request: NextRequest, context: { params: { fid: string } }) {
  try {
    const body = await request.json();
    const { adminFid, permissions } = body;
    const targetFid = context.params.fid;

    // Validate required fields
    if (!adminFid || !permissions) {
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
    const adminStatus = await isAdmin(parseInt(adminFid), 'full_admin');
    if (!adminStatus) {
      return NextResponse.json(
        { error: 'Unauthorized. Full admin permissions required.' },
        { status: 403 }
      );
    }

    // Check if target admin exists
    const targetAdmin = await prisma.admin.findUnique({
      where: { fid: parseInt(targetFid) },
    });

    if (!targetAdmin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
    }

    // Update admin permissions
    const updatedAdmin = await prisma.admin.update({
      where: { fid: parseInt(targetFid) },
      data: {
        permissions,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      message: 'Admin permissions updated successfully',
      admin: updatedAdmin,
    });
  } catch (error) {
    console.error('Error updating admin permissions:', error);
    return NextResponse.json({ error: 'Failed to update admin permissions' }, { status: 500 });
  }
}

/**
 * Remove an admin (requires full_admin permissions)
 */
export async function DELETE(request: NextRequest, context: { params: { fid: string } }) {
  try {
    const targetFid = context.params.fid;
    const body = await request.json();
    const { adminFid } = body;

    // Validate required fields
    if (!adminFid) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if user is a full_admin
    const adminStatus = await isAdmin(parseInt(adminFid), 'full_admin');
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
