/**
 * Review Normalization Utilities
 * 
 * These functions transform raw Hostaway API data into a clean, 
 * frontend-friendly format with consistent naming and computed properties.
 */

import type {
  HostawayReview,
  HostawayApiResponse,
  NormalizedReview,
  NormalizedCategory,
  PropertyInfo,
  NormalizedReviewsResponse,
  PropertyPerformance,
} from '@/types/review';

// ============================================================================
// Category Display Name Mapping
// ============================================================================

const CATEGORY_DISPLAY_NAMES: Record<string, string> = {
  cleanliness: 'Cleanliness',
  communication: 'Communication',
  accuracy: 'Accuracy',
  location: 'Location',
  value: 'Value',
  respect_house_rules: 'House Rules',
  check_in: 'Check-in',
  amenities: 'Amenities',
};

// ============================================================================
// Channel Display Name Mapping
// ============================================================================

const CHANNEL_DISPLAY_NAMES: Record<string, string> = {
  airbnb: 'Airbnb',
  'booking.com': 'Booking.com',
  vrbo: 'VRBO',
  direct: 'Direct Booking',
  expedia: 'Expedia',
  homeaway: 'HomeAway',
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Extract initials from a full name
 */
function getInitials(name: string): string {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Extract a short property name from the full listing name
 */
function getShortPropertyName(fullName: string): string {
  if (!fullName) return 'Unknown Property';
  // Take the part before any dash or hyphen
  const firstPart = fullName.split(/\s*[-–—]\s*/)[0];
  return firstPart.trim();
}

/**
 * Extract location from listing name if present
 */
function extractLocation(listingName: string): string | undefined {
  // Try to extract location from patterns like "2B Shoreditch Heights"
  const locationPatterns = [
    /\b(Shoreditch|Marais|Gothic Quarter|Kreuzberg|Berlin|Paris|Barcelona|London)\b/i,
  ];
  
  for (const pattern of locationPatterns) {
    const match = listingName.match(pattern);
    if (match) return match[1];
  }
  return undefined;
}

/**
 * Format date string to human-readable format
 */
function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr.replace(' ', 'T'));
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

/**
 * Parse Hostaway date to ISO string
 */
function parseToISOString(dateStr: string): string {
  try {
    const date = new Date(dateStr.replace(' ', 'T'));
    return date.toISOString();
  } catch {
    return new Date().toISOString();
  }
}

/**
 * Calculate overall rating from category ratings if main rating is null
 */
function calculateOverallRating(
  rating: number | null, 
  categories: { rating: number }[]
): number {
  if (rating !== null) return rating;
  if (categories.length === 0) return 0;
  
  const sum = categories.reduce((acc, cat) => acc + cat.rating, 0);
  // Categories are out of 10, convert to 5-star scale
  return Math.round((sum / categories.length) / 2 * 10) / 10;
}

// ============================================================================
// Main Normalization Functions
// ============================================================================

/**
 * Normalize a single Hostaway review into frontend-friendly format
 */
export function normalizeReview(
  review: HostawayReview, 
  approvedIds: Set<string> = new Set()
): NormalizedReview {
  const propertyId = review.listingId?.toString() || 
    review.listingName.replace(/\s+/g, '-').toLowerCase();

  // Normalize categories
  const categories: NormalizedCategory[] = review.reviewCategory.map(cat => ({
    name: cat.category,
    displayName: CATEGORY_DISPLAY_NAMES[cat.category] || 
      cat.category.charAt(0).toUpperCase() + cat.category.slice(1).replace(/_/g, ' '),
    rating: cat.rating,
    maxRating: 10,
  }));

  // Calculate overall rating
  const overallRating = calculateOverallRating(review.rating, review.reviewCategory);

  return {
    id: review.id.toString(),
    propertyId,
    property: {
      id: propertyId,
      name: review.listingName,
      shortName: getShortPropertyName(review.listingName),
      location: extractLocation(review.listingName),
    },
    reviewer: review.guestName,
    reviewerInitials: getInitials(review.guestName),
    content: review.publicReview,
    privateNotes: review.privateReview,
    overallRating,
    maxRating: 5,
    categories,
    type: review.type === 'guest-to-host' ? 'guest' : 'host',
    status: review.status,
    channel: review.channelName || 'direct',
    channelDisplayName: CHANNEL_DISPLAY_NAMES[review.channelName || 'direct'] || 
      (review.channelName || 'Direct Booking'),
    submittedAt: parseToISOString(review.submittedAt),
    submittedAtFormatted: formatDate(review.submittedAt),
    isApprovedForDisplay: approvedIds.has(review.id.toString()),
  };
}

/**
 * Normalize an entire Hostaway API response
 */
export function normalizeHostawayResponse(
  response: HostawayApiResponse,
  approvedIds: Set<string> = new Set()
): NormalizedReviewsResponse {
  if (response.status !== 'success') {
    return {
      success: false,
      reviews: [],
      meta: {
        total: 0,
        properties: [],
        channels: [],
        dateRange: { earliest: '', latest: '' },
      },
      error: response.message || 'Failed to fetch reviews',
    };
  }

  // Filter to only guest-to-host reviews for public display purposes
  // But keep all for the dashboard
  const allReviews = response.result;
  
  // Normalize all reviews
  const normalizedReviews = allReviews.map(review => 
    normalizeReview(review, approvedIds)
  );

  // Sort by date (most recent first)
  normalizedReviews.sort((a, b) => 
    new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
  );

  // Extract unique properties
  const propertyMap = new Map<string, PropertyInfo>();
  normalizedReviews.forEach(review => {
    if (!propertyMap.has(review.propertyId)) {
      propertyMap.set(review.propertyId, review.property);
    }
  });

  // Extract unique channels
  const channels = Array.from(new Set(normalizedReviews.map(r => r.channel)));

  // Calculate date range
  const dates = normalizedReviews.map(r => new Date(r.submittedAt).getTime());
  const earliest = dates.length ? new Date(Math.min(...dates)).toISOString() : '';
  const latest = dates.length ? new Date(Math.max(...dates)).toISOString() : '';

  return {
    success: true,
    reviews: normalizedReviews,
    meta: {
      total: normalizedReviews.length,
      properties: Array.from(propertyMap.values()),
      channels,
      dateRange: { earliest, latest },
    },
  };
}

/**
 * Calculate performance metrics for a specific property
 */
export function calculatePropertyPerformance(
  reviews: NormalizedReview[],
  property: PropertyInfo
): PropertyPerformance {
  const propertyReviews = reviews.filter(
    r => r.propertyId === property.id && r.type === 'guest'
  );

  if (propertyReviews.length === 0) {
    return {
      property,
      totalReviews: 0,
      averageRating: 0,
      ratingDistribution: {},
      categoryAverages: {},
      approvedCount: 0,
      pendingCount: 0,
      recentTrend: 'stable',
      channelBreakdown: {},
    };
  }

  // Calculate average rating
  const totalRating = propertyReviews.reduce((sum, r) => sum + r.overallRating, 0);
  const averageRating = Math.round((totalRating / propertyReviews.length) * 10) / 10;

  // Rating distribution (1-5 stars)
  const ratingDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  propertyReviews.forEach(r => {
    const rounded = Math.round(r.overallRating);
    if (rounded >= 1 && rounded <= 5) {
      ratingDistribution[rounded]++;
    }
  });

  // Category averages
  const categoryTotals: Record<string, { sum: number; count: number }> = {};
  propertyReviews.forEach(r => {
    r.categories.forEach(cat => {
      if (!categoryTotals[cat.name]) {
        categoryTotals[cat.name] = { sum: 0, count: 0 };
      }
      categoryTotals[cat.name].sum += cat.rating;
      categoryTotals[cat.name].count++;
    });
  });
  
  const categoryAverages: Record<string, number> = {};
  Object.entries(categoryTotals).forEach(([name, { sum, count }]) => {
    categoryAverages[name] = Math.round((sum / count) * 10) / 10;
  });

  // Approval counts
  const approvedCount = propertyReviews.filter(r => r.isApprovedForDisplay).length;
  const pendingCount = propertyReviews.filter(r => r.status === 'pending').length;

  // Channel breakdown
  const channelBreakdown: Record<string, number> = {};
  propertyReviews.forEach(r => {
    channelBreakdown[r.channel] = (channelBreakdown[r.channel] || 0) + 1;
  });

  // Recent trend (compare last 5 reviews to previous 5)
  const sorted = [...propertyReviews].sort(
    (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
  );
  let recentTrend: 'up' | 'down' | 'stable' = 'stable';
  
  if (sorted.length >= 4) {
    const recentAvg = sorted.slice(0, 2).reduce((s, r) => s + r.overallRating, 0) / 2;
    const olderAvg = sorted.slice(2, 4).reduce((s, r) => s + r.overallRating, 0) / 2;
    if (recentAvg > olderAvg + 0.3) recentTrend = 'up';
    else if (recentAvg < olderAvg - 0.3) recentTrend = 'down';
  }

  return {
    property,
    totalReviews: propertyReviews.length,
    averageRating,
    ratingDistribution,
    categoryAverages,
    approvedCount,
    pendingCount,
    recentTrend,
    channelBreakdown,
  };
}

/**
 * Filter reviews based on provided criteria
 */
export function filterReviews(
  reviews: NormalizedReview[],
  filters: {
    propertyId?: string;
    channel?: string;
    minRating?: number;
    type?: 'guest' | 'host' | 'all';
    approvedOnly?: boolean;
  }
): NormalizedReview[] {
  return reviews.filter(review => {
    if (filters.propertyId && review.propertyId !== filters.propertyId) return false;
    if (filters.channel && review.channel !== filters.channel) return false;
    if (filters.minRating && review.overallRating < filters.minRating) return false;
    if (filters.type && filters.type !== 'all' && review.type !== filters.type) return false;
    if (filters.approvedOnly && !review.isApprovedForDisplay) return false;
    return true;
  });
}

