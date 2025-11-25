'use client';

/**
 * StatsOverview Component
 * 
 * Displays key metrics at a glance for the dashboard.
 */

import { Card, CardContent } from '@/components/ui/card';
import type { NormalizedReview, PropertyInfo } from '@/types/review';

interface StatsOverviewProps {
  reviews: NormalizedReview[];
  properties: PropertyInfo[];
}

export function StatsOverview({ reviews, properties }: StatsOverviewProps) {
  // Calculate stats
  const guestReviews = reviews.filter(r => r.type === 'guest');
  const totalReviews = guestReviews.length;
  const approvedCount = guestReviews.filter(r => r.isApprovedForDisplay).length;
  
  const averageRating = totalReviews > 0
    ? guestReviews.reduce((sum, r) => sum + r.overallRating, 0) / totalReviews
    : 0;

  // Count by rating
  const fiveStarCount = guestReviews.filter(r => r.overallRating >= 4.5).length;
  const lowRatingCount = guestReviews.filter(r => r.overallRating <= 2).length;

  const stats = [
    {
      label: 'Total Reviews',
      value: totalReviews,
      subtext: `${properties.length} properties`,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
      ),
    },
    {
      label: 'Average Rating',
      value: averageRating.toFixed(1),
      subtext: `${fiveStarCount} five-star reviews`,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ),
      highlight: averageRating >= 4.5,
    },
    {
      label: 'Published',
      value: approvedCount,
      subtext: `${Math.round((approvedCount / Math.max(totalReviews, 1)) * 100)}% of reviews`,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
    },
    {
      label: 'Needs Attention',
      value: lowRatingCount,
      subtext: 'Reviews ≤ 2 stars',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      alert: lowRatingCount > 0,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card 
          key={stat.label} 
          className={`fl-card animate-slide-up`}
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2 rounded-lg ${
                stat.alert 
                  ? 'bg-red-100 text-red-600' 
                  : stat.highlight 
                    ? 'bg-green-100 text-green-600'
                    : 'bg-primary/10 text-primary'
              }`}>
                {stat.icon}
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm font-medium text-foreground mt-0.5">{stat.label}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.subtext}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

