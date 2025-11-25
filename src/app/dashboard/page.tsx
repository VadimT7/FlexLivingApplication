'use client';

/**
 * Manager Dashboard Page
 * 
 * Main interface for property managers to:
 * - View performance metrics across properties
 * - Filter and sort reviews
 * - Select which reviews to display publicly
 */

import { useEffect, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReviewCard } from '@/components/reviews/ReviewCard';
import { PropertyCard } from '@/components/dashboard/PropertyCard';
import { FilterBar } from '@/components/dashboard/FilterBar';
import { StatsOverview } from '@/components/dashboard/StatsOverview';
import { calculatePropertyPerformance } from '@/lib/review-utils';
import type { 
  NormalizedReview, 
  NormalizedReviewsResponse, 
  PropertyInfo, 
  PropertyPerformance,
  ReviewFilters,
  ReviewSort 
} from '@/types/review';

export default function DashboardPage() {
  const [reviews, setReviews] = useState<NormalizedReview[]>([]);
  const [properties, setProperties] = useState<PropertyInfo[]>([]);
  const [channels, setChannels] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter and sort state
  const [filters, setFilters] = useState<ReviewFilters>({ type: 'all' });
  const [sort, setSort] = useState<ReviewSort>({ field: 'date', order: 'desc' });
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);

  // Fetch reviews on mount
  useEffect(() => {
    async function fetchReviews() {
      try {
        const response = await fetch('/api/reviews/hostaway');
        const data: NormalizedReviewsResponse = await response.json();

        if (data.success) {
          setReviews(data.reviews);
          setProperties(data.meta.properties);
          setChannels(data.meta.channels);
        } else {
          setError(data.error || 'Failed to load reviews');
        }
      } catch {
        setError('Failed to connect to server');
      } finally {
        setIsLoading(false);
      }
    }

    fetchReviews();
  }, []);

  // Calculate property performance
  const propertyPerformance = useMemo<PropertyPerformance[]>(() => {
    return properties.map(property => 
      calculatePropertyPerformance(reviews, property)
    );
  }, [reviews, properties]);

  // Filter and sort reviews
  const filteredReviews = useMemo(() => {
    let result = [...reviews];

    // Apply filters
    if (filters.propertyId || selectedPropertyId) {
      result = result.filter(r => r.propertyId === (filters.propertyId || selectedPropertyId));
    }
    if (filters.channel) {
      result = result.filter(r => r.channel === filters.channel);
    }
    if (filters.minRating) {
      result = result.filter(r => r.overallRating >= filters.minRating!);
    }
    if (filters.type && filters.type !== 'all') {
      result = result.filter(r => r.type === filters.type);
    }
    if (filters.approvedOnly) {
      result = result.filter(r => r.isApprovedForDisplay);
    }

    // Apply sort
    result.sort((a, b) => {
      let comparison = 0;
      switch (sort.field) {
        case 'date':
          comparison = new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
          break;
        case 'rating':
          comparison = a.overallRating - b.overallRating;
          break;
        case 'property':
          comparison = a.property.name.localeCompare(b.property.name);
          break;
        case 'channel':
          comparison = a.channel.localeCompare(b.channel);
          break;
      }
      return sort.order === 'desc' ? -comparison : comparison;
    });

    return result;
  }, [reviews, filters, sort, selectedPropertyId]);

  // Handle approval change
  const handleApprovalChange = useCallback((reviewId: string, approved: boolean) => {
    setReviews(prev => prev.map(r => 
      r.id === reviewId ? { ...r, isApprovedForDisplay: approved } : r
    ));
  }, []);

  // Reset filters
  const resetFilters = useCallback(() => {
    setFilters({ type: 'all' });
    setSort({ field: 'date', order: 'desc' });
    setSelectedPropertyId(null);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading reviews...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-500">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <svg className="w-4 h-4 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <span className="font-semibold text-lg">Flex Living</span>
              </Link>
              <span className="text-muted-foreground">/</span>
              <h1 className="font-semibold">Reviews Dashboard</h1>
            </div>
            <Link href="/property/1001">
              <Button variant="outline" size="sm">
                View Public Page →
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Stats Overview */}
        <section>
          <StatsOverview reviews={reviews} properties={properties} />
        </section>

        {/* Main Content */}
        <Tabs defaultValue="reviews" className="space-y-6">
          <TabsList>
            <TabsTrigger value="reviews">All Reviews</TabsTrigger>
            <TabsTrigger value="properties">By Property</TabsTrigger>
          </TabsList>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="space-y-6">
            {/* Filters */}
            <FilterBar
              properties={properties}
              channels={channels}
              filters={filters}
              sort={sort}
              onFiltersChange={setFilters}
              onSortChange={setSort}
              onReset={resetFilters}
            />

            {/* Reviews Count */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {filteredReviews.length} of {reviews.length} reviews
              </p>
            </div>

            {/* Reviews List */}
            <div className="grid gap-4">
              {filteredReviews.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No reviews match your filters
                </div>
              ) : (
                filteredReviews.map((review, index) => (
                  <div 
                    key={review.id} 
                    className="animate-fade-in"
                    style={{ animationDelay: `${Math.min(index * 30, 300)}ms` }}
                  >
                    <ReviewCard
                      review={review}
                      showApprovalToggle
                      showProperty
                      onApprovalChange={handleApprovalChange}
                    />
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          {/* Properties Tab */}
          <TabsContent value="properties" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {propertyPerformance.map((perf, index) => (
                <div 
                  key={perf.property.id}
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <PropertyCard
                    performance={perf}
                    isSelected={selectedPropertyId === perf.property.id}
                    onClick={() => {
                      if (selectedPropertyId === perf.property.id) {
                        setSelectedPropertyId(null);
                      } else {
                        setSelectedPropertyId(perf.property.id);
                      }
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Property Reviews */}
            {selectedPropertyId && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">
                    Reviews for {properties.find(p => p.id === selectedPropertyId)?.shortName}
                  </h3>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setSelectedPropertyId(null)}
                  >
                    Clear Selection
                  </Button>
                </div>
                <div className="grid gap-4">
                  {filteredReviews.map((review) => (
                    <ReviewCard
                      key={review.id}
                      review={review}
                      showApprovalToggle
                      showProperty={false}
                      onApprovalChange={handleApprovalChange}
                    />
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

