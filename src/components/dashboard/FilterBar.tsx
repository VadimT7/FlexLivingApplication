'use client';

/**
 * FilterBar Component
 * 
 * Provides filtering and sorting controls for the reviews list.
 */

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import type { PropertyInfo, ReviewFilters, ReviewSort } from '@/types/review';

interface FilterBarProps {
  properties: PropertyInfo[];
  channels: string[];
  filters: ReviewFilters;
  sort: ReviewSort;
  onFiltersChange: (filters: ReviewFilters) => void;
  onSortChange: (sort: ReviewSort) => void;
  onReset: () => void;
}

const channelDisplayNames: Record<string, string> = {
  airbnb: 'Airbnb',
  'booking.com': 'Booking.com',
  vrbo: 'VRBO',
  direct: 'Direct',
};

export function FilterBar({
  properties,
  channels,
  filters,
  sort,
  onFiltersChange,
  onSortChange,
  onReset,
}: FilterBarProps) {
  const hasActiveFilters = 
    filters.propertyId || 
    filters.channel || 
    filters.minRating || 
    filters.type !== 'all' ||
    filters.approvedOnly;

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-card rounded-xl border border-border/50">
      {/* Property Filter */}
      <Select
        value={filters.propertyId || 'all'}
        onValueChange={(value) => 
          onFiltersChange({ ...filters, propertyId: value === 'all' ? undefined : value })
        }
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="All Properties" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Properties</SelectItem>
          {properties.map((property) => (
            <SelectItem key={property.id} value={property.id}>
              {property.shortName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Channel Filter */}
      <Select
        value={filters.channel || 'all'}
        onValueChange={(value) => 
          onFiltersChange({ ...filters, channel: value === 'all' ? undefined : value })
        }
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="All Channels" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Channels</SelectItem>
          {channels.map((channel) => (
            <SelectItem key={channel} value={channel}>
              {channelDisplayNames[channel] || channel}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Rating Filter */}
      <Select
        value={filters.minRating?.toString() || 'all'}
        onValueChange={(value) => 
          onFiltersChange({ ...filters, minRating: value === 'all' ? undefined : parseInt(value) })
        }
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Min Rating" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Ratings</SelectItem>
          <SelectItem value="5">5 Stars</SelectItem>
          <SelectItem value="4">4+ Stars</SelectItem>
          <SelectItem value="3">3+ Stars</SelectItem>
        </SelectContent>
      </Select>

      {/* Type Filter */}
      <Select
        value={filters.type || 'all'}
        onValueChange={(value) => 
          onFiltersChange({ ...filters, type: value as 'guest' | 'host' | 'all' })
        }
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Review Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="guest">Guest Reviews</SelectItem>
          <SelectItem value="host">Host Reviews</SelectItem>
        </SelectContent>
      </Select>

      {/* Sort */}
      <Select
        value={`${sort.field}-${sort.order}`}
        onValueChange={(value) => {
          const [field, order] = value.split('-') as [typeof sort.field, typeof sort.order];
          onSortChange({ field, order });
        }}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="date-desc">Newest First</SelectItem>
          <SelectItem value="date-asc">Oldest First</SelectItem>
          <SelectItem value="rating-desc">Highest Rated</SelectItem>
          <SelectItem value="rating-asc">Lowest Rated</SelectItem>
        </SelectContent>
      </Select>

      {/* Approved Only Toggle */}
      <Button
        variant={filters.approvedOnly ? 'default' : 'outline'}
        size="sm"
        onClick={() => onFiltersChange({ ...filters, approvedOnly: !filters.approvedOnly })}
        className="shrink-0"
      >
        {filters.approvedOnly ? '✓ ' : ''}Published Only
      </Button>

      {/* Reset */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="shrink-0 text-muted-foreground"
        >
          Reset
        </Button>
      )}
    </div>
  );
}

