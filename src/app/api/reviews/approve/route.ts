/**
 * POST /api/reviews/approve
 * 
 * Toggle the approval status of a review for public display.
 * Uses in-memory store for serverless compatibility (Vercel).
 * 
 * Request Body:
 * {
 *   reviewId: string,
 *   approved: boolean
 * }
 * 
 * Note: In a production environment, this would update a database.
 * For this assessment demo, we use an in-memory store that:
 * - Initializes from the static JSON file
 * - Persists during the serverless instance lifecycle
 * - Resets on cold starts (acceptable for demo purposes)
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  getApprovalData, 
  setReviewApproval, 
  getApprovedReviewIds 
} from '@/lib/approval-store';

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

    // Update approval status in memory store
    setReviewApproval(reviewId, approved);

    // Get updated count
    const approvedIds = getApprovedReviewIds();

    return NextResponse.json({
      success: true,
      reviewId,
      approved,
      totalApproved: approvedIds.length,
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
    const data = getApprovalData();

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
