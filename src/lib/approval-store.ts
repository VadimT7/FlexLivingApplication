/**
 * In-Memory Approval Store
 * 
 * Stores approved review IDs in memory for serverless deployments.
 * On Vercel, the filesystem is read-only, so we can't persist to JSON files.
 * 
 * This store:
 * - Initializes from the static JSON file on first access
 * - Keeps changes in memory during the serverless function lifecycle
 * - Resets to initial state on cold starts (acceptable for demo purposes)
 * 
 * In production, this would be replaced with a database (PostgreSQL, MongoDB, etc.)
 */

import initialApprovedData from '@/data/approved-reviews.json';

interface ApprovalStore {
  approvedReviewIds: Set<string>;
  lastUpdated: string;
  initialized: boolean;
}

// In-memory store (persists across requests in the same serverless instance)
const store: ApprovalStore = {
  approvedReviewIds: new Set<string>(),
  lastUpdated: '',
  initialized: false,
};

/**
 * Initialize the store from the static JSON file
 */
function initializeStore(): void {
  if (!store.initialized) {
    store.approvedReviewIds = new Set(initialApprovedData.approvedReviewIds);
    store.lastUpdated = initialApprovedData.lastUpdated;
    store.initialized = true;
  }
}

/**
 * Get all approved review IDs
 */
export function getApprovedReviewIds(): string[] {
  initializeStore();
  return Array.from(store.approvedReviewIds);
}

/**
 * Get the approval store data
 */
export function getApprovalData(): { approvedReviewIds: string[]; lastUpdated: string } {
  initializeStore();
  return {
    approvedReviewIds: Array.from(store.approvedReviewIds),
    lastUpdated: store.lastUpdated,
  };
}

/**
 * Check if a specific review is approved
 */
export function isReviewApproved(reviewId: string): boolean {
  initializeStore();
  return store.approvedReviewIds.has(reviewId);
}

/**
 * Set approval status for a review
 */
export function setReviewApproval(reviewId: string, approved: boolean): void {
  initializeStore();
  
  if (approved) {
    store.approvedReviewIds.add(reviewId);
  } else {
    store.approvedReviewIds.delete(reviewId);
  }
  
  store.lastUpdated = new Date().toISOString();
}

/**
 * Get a Set of approved review IDs (for normalization)
 */
export function getApprovedIdsSet(): Set<string> {
  initializeStore();
  return new Set(store.approvedReviewIds);
}

