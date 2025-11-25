'use client';

/**
 * ReviewCard Component
 * 
 * Displays a single review with all its details.
 * Used in both the dashboard (with approval toggle) and public display.
 */

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { StarRating } from './StarRating';
import { ChannelBadge } from './ChannelBadge';
import type { NormalizedReview } from '@/types/review';

interface ReviewCardProps {
  review: NormalizedReview;
  showApprovalToggle?: boolean;
  showProperty?: boolean;
  onApprovalChange?: (reviewId: string, approved: boolean) => void;
  compact?: boolean;
}

export function ReviewCard({
  review,
  showApprovalToggle = false,
  showProperty = true,
  onApprovalChange,
  compact = false,
}: ReviewCardProps) {
  const [isApproved, setIsApproved] = useState(review.isApprovedForDisplay);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleApprovalToggle = async (checked: boolean) => {
    setIsUpdating(true);
    setIsApproved(checked);

    try {
      const response = await fetch('/api/reviews/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId: review.id, approved: checked }),
      });

      if (!response.ok) {
        // Revert on error
        setIsApproved(!checked);
      } else {
        onApprovalChange?.(review.id, checked);
      }
    } catch {
      setIsApproved(!checked);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card className={`fl-card-hover overflow-hidden ${compact ? 'p-0' : ''}`}>
      <CardContent className={compact ? 'p-4' : 'p-6'}>
        {/* Header: Avatar, Name, Rating, Channel */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-start gap-3">
            <Avatar className="h-10 w-10 shrink-0">
              <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                {review.reviewerInitials}
              </AvatarFallback>
            </Avatar>
            
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-foreground">
                  {review.reviewer}
                </span>
                {review.type === 'host' && (
                  <Badge variant="outline" className="text-xs">Host Review</Badge>
                )}
              </div>
              
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <StarRating rating={review.overallRating} size="sm" showValue />
                <span className="text-muted-foreground text-xs">·</span>
                <span className="text-muted-foreground text-xs">
                  {review.submittedAtFormatted}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <ChannelBadge channel={review.channel} />
          </div>
        </div>

        {/* Property info (if showing) */}
        {showProperty && (
          <div className="mb-3">
            <span className="text-sm text-muted-foreground">
              {review.property.name}
            </span>
          </div>
        )}

        {/* Review content */}
        <p className={`text-foreground leading-relaxed ${compact ? 'text-sm' : ''}`}>
          {review.content}
        </p>

        {/* Category ratings (if available and not compact) */}
        {!compact && review.categories.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border/50">
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {review.categories.slice(0, 5).map((cat) => (
                <div key={cat.name} className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">{cat.displayName}</span>
                  <span className="font-medium text-foreground">
                    {cat.rating}/{cat.maxRating}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Approval toggle (dashboard only) */}
        {showApprovalToggle && (
          <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Show on website
              </span>
              {isApproved && (
                <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                  Visible
                </Badge>
              )}
            </div>
            <Switch
              checked={isApproved}
              onCheckedChange={handleApprovalToggle}
              disabled={isUpdating}
              className="data-[state=checked]:bg-green-500"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

