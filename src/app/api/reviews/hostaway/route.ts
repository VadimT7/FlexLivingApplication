/**
 * GET /api/reviews/hostaway
 * 
 * This API route fetches reviews from the Hostaway API (or mock data) and
 * returns a normalized, frontend-friendly response.
 * 
 * Query Parameters:
 * - propertyId: Filter by specific property
 * - channel: Filter by booking channel (airbnb, booking.com, etc.)
 * - type: Filter by review type (guest, host, all)
 * - minRating: Minimum rating filter
 * 
 * Note: Approval status is managed client-side via localStorage in this demo.
 * The API returns all reviews; the client filters by approved status.
 * 
 * Response Structure:
 * {
 *   success: boolean,
 *   reviews: NormalizedReview[],
 *   meta: {
 *     total: number,
 *     properties: PropertyInfo[],
 *     channels: string[],
 *     dateRange: { earliest: string, latest: string }
 *   }
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { normalizeHostawayResponse, filterReviews } from '@/lib/review-utils';
import type { HostawayApiResponse } from '@/types/review';

// Import mock data
import mockReviews from '@/data/mock-reviews.json';

// Hostaway API configuration (from assessment document)
const HOSTAWAY_CONFIG = {
  accountId: '61148',
  apiKey: 'f94377ebbbb479490bb3ec364649168dc443dda2e4830facaf5de2e74ccc9152',
  baseUrl: 'https://api.hostaway.com/v1',
};

/**
 * Attempt to fetch reviews from the real Hostaway API
 * Falls back to mock data if the API returns no results (sandbox mode)
 */
async function fetchHostawayReviews(): Promise<HostawayApiResponse> {
  try {
    // Attempt to call the real Hostaway API
    const response = await fetch(
      `${HOSTAWAY_CONFIG.baseUrl}/reviews`,
      {
        headers: {
          'Authorization': `Bearer ${HOSTAWAY_CONFIG.apiKey}`,
          'Content-Type': 'application/json',
        },
        // Cache for 5 minutes to avoid hitting API too frequently
        next: { revalidate: 300 },
      }
    );

    if (response.ok) {
      const data = await response.json();
      
      // If the API returns results, use them
      // Otherwise fall back to mock data (sandbox has no reviews)
      if (data.result && data.result.length > 0) {
        return data as HostawayApiResponse;
      }
    }
  } catch (error) {
    console.log('Hostaway API unavailable, using mock data:', error);
  }

  // Return mock data as fallback
  // This simulates what the real API would return
  return mockReviews as HostawayApiResponse;
}

/**
 * GET handler for /api/reviews/hostaway
 */
export async function GET(request: NextRequest) {
  try {
    // Extract query parameters for filtering
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId') || undefined;
    const channel = searchParams.get('channel') || undefined;
    const type = searchParams.get('type') as 'guest' | 'host' | 'all' | undefined;
    const minRating = searchParams.get('minRating') 
      ? parseFloat(searchParams.get('minRating')!) 
      : undefined;

    // Fetch raw reviews from Hostaway (or mock data)
    const rawResponse = await fetchHostawayReviews();

    // Normalize the response (approval status will be applied client-side)
    const normalizedResponse = normalizeHostawayResponse(rawResponse, new Set());

    if (!normalizedResponse.success) {
      return NextResponse.json(normalizedResponse, { status: 500 });
    }

    // Apply filters if provided
    const filteredReviews = filterReviews(normalizedResponse.reviews, {
      propertyId,
      channel,
      type,
      minRating,
    });

    // Return filtered response
    return NextResponse.json({
      ...normalizedResponse,
      reviews: filteredReviews,
      meta: {
        ...normalizedResponse.meta,
        total: filteredReviews.length,
        unfilteredTotal: normalizedResponse.reviews.length,
      },
    });

  } catch (error) {
    console.error('Error fetching reviews:', error);
    
    return NextResponse.json(
      {
        success: false,
        reviews: [],
        meta: {
          total: 0,
          properties: [],
          channels: [],
          dateRange: { earliest: '', latest: '' },
        },
        error: 'Failed to fetch reviews. Please try again later.',
      },
      { status: 500 }
    );
  }
}
