'use client';

/**
 * PropertyCard Component
 * 
 * Displays a summary card for a property showing key metrics
 * like average rating, review count, and trend.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { StarRating } from '@/components/reviews/StarRating';
import type { PropertyPerformance } from '@/types/review';

interface PropertyCardProps {
  performance: PropertyPerformance;
  isSelected?: boolean;
  onClick?: () => void;
}

export function PropertyCard({ performance, isSelected, onClick }: PropertyCardProps) {
  const { property, totalReviews, averageRating, approvedCount, recentTrend, categoryAverages } = performance;

  const trendIcon = {
    up: (
      <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    ),
    down: (
      <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </svg>
    ),
    stable: (
      <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
      </svg>
    ),
  };

  // Get top 3 categories for quick view
  const topCategories = Object.entries(categoryAverages)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  return (
    <Card 
      className={`fl-card-hover cursor-pointer transition-all ${
        isSelected ? 'ring-2 ring-primary border-primary' : ''
      }`}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <CardTitle className="text-base font-semibold truncate">
              {property.shortName}
            </CardTitle>
            {property.location && (
              <p className="text-sm text-muted-foreground mt-0.5">
                {property.location}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0 ml-2">
            {trendIcon[recentTrend]}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Rating and Count */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StarRating rating={averageRating} size="md" />
            <span className="font-semibold text-lg">{averageRating.toFixed(1)}</span>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-foreground">{totalReviews}</span>
            <p className="text-xs text-muted-foreground">reviews</p>
          </div>
        </div>

        {/* Approved indicator */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Published</span>
          <span className="font-medium">
            {approvedCount} / {totalReviews}
          </span>
        </div>
        <Progress 
          value={(approvedCount / Math.max(totalReviews, 1)) * 100} 
          className="h-1.5"
        />

        {/* Top categories */}
        {topCategories.length > 0 && (
          <div className="pt-2 border-t border-border/50 space-y-1.5">
            {topCategories.map(([category, rating]) => (
              <div key={category} className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground capitalize">
                  {category.replace(/_/g, ' ')}
                </span>
                <span className="font-medium">{rating}/10</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

