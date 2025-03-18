import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/utils';

/**
 * Get a single topic submission by ID
 */
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(request.url);
    const fid = searchParams.get('fid');

    // Validate FID for admin check
    if (!fid) {
      return NextResponse.json({ error: 'Missing FID parameter' }, { status: 400 });
    }

    // Check if user is an admin
    const adminStatus = await isAdmin(parseInt(fid));
    if (!adminStatus) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const submissionId = parseInt(params.id);

    const submission = await prisma.topicSubmission.findUnique({
      where: { id: submissionId },
      include: {
        category: {
          select: {
            name: true,
            description: true,
          },
        },
      },
    });

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    return NextResponse.json(submission);
  } catch (error) {
    console.error('Error fetching topic submission:', error);
    return NextResponse.json({ error: 'Failed to fetch topic submission' }, { status: 500 });
  }
}

/**
 * Update a topic submission (approve or reject)
 */
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const { status, reason, adminFid } = body;

    // Validate required fields
    if (!status || !adminFid) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate status value
    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status value. Must be "approved" or "rejected"' },
        { status: 400 }
      );
    }

    // If rejecting, reason is required
    if (status === 'rejected' && !reason) {
      return NextResponse.json(
        { error: 'Reason is required when rejecting a submission' },
        { status: 400 }
      );
    }

    // Check if user is an admin
    const adminStatus = await isAdmin(parseInt(adminFid));
    if (!adminStatus) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const submissionId = parseInt(params.id);

    // Get the submission
    const submission = await prisma.topicSubmission.findUnique({
      where: { id: submissionId },
    });

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    // Update the submission
    const updatedSubmission = await prisma.topicSubmission.update({
      where: { id: submissionId },
      data: {
        status,
        reason: status === 'rejected' ? reason : null,
        reviewedAt: new Date(),
        reviewedBy: parseInt(adminFid),
      },
    });

    // If approved, create a new topic from this submission
    if (status === 'approved') {
      const newTopic = await prisma.topic.create({
        data: {
          name: submission.name,
          optionA: submission.optionA,
          optionB: submission.optionB,
          categoryId: submission.categoryId,
          submissionId: submission.id,
          isActive: false, // Admin needs to explicitly activate it
          startDate: new Date(),
          updatedAt: new Date(),
        },
      });

      return NextResponse.json({
        message: 'Submission approved and converted to topic',
        submission: updatedSubmission,
        topic: newTopic,
      });
    }

    return NextResponse.json({
      message: `Submission ${status}`,
      submission: updatedSubmission,
    });
  } catch (error) {
    console.error('Error updating topic submission:', error);
    return NextResponse.json({ error: 'Failed to update topic submission' }, { status: 500 });
  }
}

/**
 * Delete a topic submission
 */
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(request.url);
    const fid = searchParams.get('fid');

    // Validate FID for admin check
    if (!fid) {
      return NextResponse.json({ error: 'Missing FID parameter' }, { status: 400 });
    }

    // Check if user is an admin with full_admin permissions
    const adminStatus = await isAdmin(parseInt(fid), 'full_admin');
    if (!adminStatus) {
      return NextResponse.json(
        { error: 'Unauthorized. Full admin permissions required for deletion.' },
        { status: 403 }
      );
    }

    const submissionId = parseInt(params.id);

    // Delete the submission
    await prisma.topicSubmission.delete({
      where: { id: submissionId },
    });

    return NextResponse.json({
      message: 'Submission deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting topic submission:', error);
    return NextResponse.json({ error: 'Failed to delete topic submission' }, { status: 500 });
  }
}
