/**
 * Client-Side Approval Store
 * 
 * Uses localStorage to persist approved review IDs for demo purposes.
 * This approach works on Vercel without a database.
 * 
 * Usage:
 * - Call these functions from client components only
 * - Approvals persist in the browser's localStorage
 */

import initialApprovedData from '@/data/approved-reviews.json';

const STORAGE_KEY = 'flexliving_approved_reviews';

/**
 * Check if we're running in the browser
 */
function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

/**
 * Get approved review IDs from localStorage (or defaults)
 */
export function getApprovedReviewIds(): string[] {
  if (!isBrowser()) {
    // Server-side: return initial data
    return initialApprovedData.approvedReviewIds;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      return data.approvedReviewIds || [];
    }
  } catch (e) {
    console.error('Error reading from localStorage:', e);
  }

  // Return initial data if nothing stored
  return initialApprovedData.approvedReviewIds;
}

/**
 * Get approved IDs as a Set
 */
export function getApprovedIdsSet(): Set<string> {
  return new Set(getApprovedReviewIds());
}

/**
 * Save approved review IDs to localStorage
 */
export function saveApprovedReviewIds(ids: string[]): void {
  if (!isBrowser()) return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      approvedReviewIds: ids,
      lastUpdated: new Date().toISOString(),
    }));
  } catch (e) {
    console.error('Error saving to localStorage:', e);
  }
}

/**
 * Toggle approval status for a review
 */
export function toggleReviewApproval(reviewId: string, approved: boolean): string[] {
  const currentIds = getApprovedReviewIds();
  const idSet = new Set(currentIds);

  if (approved) {
    idSet.add(reviewId);
  } else {
    idSet.delete(reviewId);
  }

  const newIds = Array.from(idSet);
  saveApprovedReviewIds(newIds);
  return newIds;
}

/**
 * Check if a review is approved
 */
export function isReviewApproved(reviewId: string): boolean {
  return getApprovedIdsSet().has(reviewId);
}

/**
 * Initialize localStorage with default data if empty
 */
export function initializeApprovals(): void {
  if (!isBrowser()) return;

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    saveApprovedReviewIds(initialApprovedData.approvedReviewIds);
  }
}
