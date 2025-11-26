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
import { promises as fs } from 'fs';
import path from 'path';
import approvedSeed from '@/data/approved-reviews.json';

interface ApprovalData {
  approvedReviewIds: string[];
  lastUpdated: string;
}

const APPROVED_FILE_PATH = path.join(process.cwd(), 'src/data/approved-reviews.json');
const isReadOnlyEnv = Boolean(process.env.VERCEL);

let approvalCache: ApprovalData | null = null;

async function readApprovalData(): Promise<ApprovalData> {
  if (approvalCache) {
    return approvalCache;
  }

  try {
    const fileContent = await fs.readFile(APPROVED_FILE_PATH, 'utf-8');
    approvalCache = JSON.parse(fileContent);
  } catch (error) {
    console.warn('Falling back to seed approval data:', error);
    approvalCache = {
      approvedReviewIds: approvedSeed.approvedReviewIds ?? [],
      lastUpdated: approvedSeed.lastUpdated ?? new Date().toISOString(),
    };
  }

  if (!approvalCache) {
    approvalCache = {
      approvedReviewIds: approvedSeed.approvedReviewIds ?? [],
      lastUpdated: approvedSeed.lastUpdated ?? new Date().toISOString(),
    };
  }

  return approvalCache;
}

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
    const data = await readApprovalData();

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

    approvalCache = updatedData;

    if (!isReadOnlyEnv) {
      try {
        await fs.writeFile(APPROVED_FILE_PATH, JSON.stringify(updatedData, null, 2));
      } catch (writeError) {
        console.warn('Unable to persist approval data, continuing with in-memory cache:', writeError);
      }
    } else {
      console.warn('Running in read-only environment (e.g. Vercel). Skipping file write.');
    }

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
    const data = await readApprovalData();

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

