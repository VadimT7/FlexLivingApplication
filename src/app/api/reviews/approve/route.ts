/**
 * POST /api/reviews/approve
 * 
 * Toggle the approval status of a review for public display.
 * In a production environment, this would update a database.
 * For this assessment, we update the JSON file.
 * 
 * Request Body:
 * {
 *   reviewId: string,
 *   approved: boolean
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { getApprovalData, saveApprovalData } from '@/lib/approval-store';
import type { ApprovalData } from '@/lib/approval-store';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reviewId, approved } = body;

    if (!reviewId || typeof approved !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'Invalid request body' },
        { status: 400 }
      );
    }

    // Read current approved reviews (from cache / disk / seed)
    const data = await getApprovalData();

    // Update approval status
    const idSet = new Set(data.approvedReviewIds);
    
    if (approved) {
      idSet.add(reviewId);
    } else {
      idSet.delete(reviewId);
    }

    // Save updated data
    const updatedData: ApprovalData = {
      approvedReviewIds: Array.from(idSet),
      lastUpdated: new Date().toISOString(),
    };

    await saveApprovalData(updatedData);

    return NextResponse.json({
      success: true,
      reviewId,
      approved,
      totalApproved: updatedData.approvedReviewIds.length,
    });

  } catch (error) {
    console.error('Error updating approval status:', error);
    
    return NextResponse.json(
      { success: false, error: 'Failed to update approval status' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/reviews/approve
 * 
 * Get the list of all approved review IDs
 */
export async function GET() {
  try {
    const data = await getApprovalData();

    return NextResponse.json({
      success: true,
      approvedReviewIds: data.approvedReviewIds,
      totalApproved: data.approvedReviewIds.length,
      lastUpdated: data.lastUpdated,
    });

  } catch (error) {
    console.error('Error reading approved reviews:', error);
    
    return NextResponse.json(
      { success: false, error: 'Failed to read approved reviews' },
      { status: 500 }
    );
  }
}

