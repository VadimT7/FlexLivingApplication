/**
 * Types for Hostaway review data and normalized review structures
 * 
 * These types define the data contracts between the API and frontend,
 * ensuring type safety across the application.
 */

// ============================================================================
// Hostaway API Types (Raw Response Structure)
// ============================================================================

/**
 * Individual category rating from Hostaway
 * Categories include: cleanliness, communication, respect_house_rules, etc.
 */
export interface HostawayReviewCategory {
  category: string;
  rating: number;
}

/**
 * Raw review object as returned by Hostaway API
 * Note: Some fields may be null depending on review type
 */
export interface HostawayReview {
  id: number;
  type: 'guest-to-host' | 'host-to-guest';
  status: 'published' | 'pending' | 'rejected';
  rating: number | null;
  publicReview: string;
  privateReview?: string;
  reviewCategory: HostawayReviewCategory[];
  submittedAt: string;
  guestName: string;
  listingName: string;
  listingId?: number;
  channelName?: string;
  reservationId?: number;
}

/**
 * Hostaway API response wrapper
 */
export interface HostawayApiResponse {
  status: 'success' | 'error';
  result: HostawayReview[];
  message?: string;
}

// ============================================================================
// Normalized Review Types (Frontend-Friendly Structure)
// ============================================================================

/**
 * Normalized category rating with consistent naming
 */
export interface NormalizedCategory {
  name: string;
  displayName: string;
  rating: number;
  maxRating: number;
}

/**
 * Property/Listing information extracted and normalized
 */
export interface PropertyInfo {
  id: string;
  name: string;
  shortName: string;
  location?: string;
}

/**
 * Normalized review structure for frontend consumption
 * All dates are ISO strings, all optional fields have defaults
 */
export interface NormalizedReview {
  id: string;
  propertyId: string;
  property: PropertyInfo;
  
  // Review content
  reviewer: string;
  reviewerInitials: string;
  content: string;
  privateNotes?: string;
  
  // Ratings
  overallRating: number;
  maxRating: number;
  categories: NormalizedCategory[];
  
  // Metadata
  type: 'guest' | 'host';
  status: 'published' | 'pending' | 'rejected';
  channel: string;
  channelDisplayName: string;
  
  // Dates
  submittedAt: string;
  submittedAtFormatted: string;
  
  // Manager controls
  isApprovedForDisplay: boolean;
}

/**
 * API response for normalized reviews
 */
export interface NormalizedReviewsResponse {
  success: boolean;
  reviews: NormalizedReview[];
  meta: {
    total: number;
    properties: PropertyInfo[];
    channels: string[];
    dateRange: {
      earliest: string;
      latest: string;
    };
  };
  error?: string;
}

// ============================================================================
// Dashboard & Filter Types
// ============================================================================

/**
 * Filter options for the dashboard
 */
export interface ReviewFilters {
  propertyId?: string;
  channel?: string;
  minRating?: number;
  maxRating?: number;
  type?: 'guest' | 'host' | 'all';
  status?: 'published' | 'pending' | 'rejected' | 'all';
  dateFrom?: string;
  dateTo?: string;
  approvedOnly?: boolean;
}

/**
 * Sort options for reviews
 */
export type ReviewSortField = 'date' | 'rating' | 'property' | 'channel';
export type ReviewSortOrder = 'asc' | 'desc';

export interface ReviewSort {
  field: ReviewSortField;
  order: ReviewSortOrder;
}

/**
 * Property performance summary for dashboard
 */
export interface PropertyPerformance {
  property: PropertyInfo;
  totalReviews: number;
  averageRating: number;
  ratingDistribution: Record<number, number>;
  categoryAverages: Record<string, number>;
  approvedCount: number;
  pendingCount: number;
  recentTrend: 'up' | 'down' | 'stable';
  channelBreakdown: Record<string, number>;
}

