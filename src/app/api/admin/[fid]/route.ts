import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/utils';

type RouteContext = {
  params: {
    fid: string;
  };
};

/**
 * Update admin permissions
 */
export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const body = await req.json();
    const { adminFid, permissions } = body;
    const targetFid = parseInt(context.params.fid);

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
    // @ts-expect-error - Working around Prisma type issue
    const targetAdmin = await prisma.admin.findUnique({
      where: { fid: targetFid },
    });

    if (!targetAdmin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
    }

    // Update admin permissions
    // @ts-expect-error - Working around Prisma type issue
    const updatedAdmin = await prisma.admin.update({
      where: { fid: targetFid },
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
export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const body = await req.json();
    const { adminFid } = body;
    const targetFid = parseInt(context.params.fid);

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
    // @ts-expect-error - Working around Prisma type issue
    const existingAdmin = await prisma.admin.findUnique({
      where: { fid: targetFid },
    });

    if (!existingAdmin || !existingAdmin.isActive) {
      return NextResponse.json({ error: 'Admin not found or already inactive' }, { status: 404 });
    }

    // Deactivate admin
    // @ts-expect-error - Working around Prisma type issue
    await prisma.admin.update({
      where: { fid: targetFid },
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
