'use client';

/**
 * ChannelBadge Component
 * 
 * Displays a styled badge for the booking channel (Airbnb, Booking.com, etc.)
 * with appropriate brand colors.
 */

import { Badge } from '@/components/ui/badge';

interface ChannelBadgeProps {
  channel: string;
  displayName?: string;
  className?: string;
}

const channelStyles: Record<string, { bg: string; text: string; icon?: string }> = {
  airbnb: {
    bg: 'bg-[#FF5A5F]/10 hover:bg-[#FF5A5F]/20',
    text: 'text-[#FF5A5F]',
  },
  'booking.com': {
    bg: 'bg-[#003580]/10 hover:bg-[#003580]/20',
    text: 'text-[#003580]',
  },
  vrbo: {
    bg: 'bg-[#3B5998]/10 hover:bg-[#3B5998]/20',
    text: 'text-[#3B5998]',
  },
  direct: {
    bg: 'bg-primary/10 hover:bg-primary/20',
    text: 'text-primary',
  },
  expedia: {
    bg: 'bg-[#FFD700]/10 hover:bg-[#FFD700]/20',
    text: 'text-[#B8860B]',
  },
};

const channelDisplayNames: Record<string, string> = {
  airbnb: 'Airbnb',
  'booking.com': 'Booking.com',
  vrbo: 'VRBO',
  direct: 'Direct',
  expedia: 'Expedia',
};

export function ChannelBadge({ channel, displayName, className = '' }: ChannelBadgeProps) {
  const normalizedChannel = channel.toLowerCase();
  const styles = channelStyles[normalizedChannel] || channelStyles.direct;
  const name = displayName || channelDisplayNames[normalizedChannel] || channel;

  return (
    <Badge 
      variant="secondary" 
      className={`${styles.bg} ${styles.text} border-0 font-medium ${className}`}
    >
      {name}
    </Badge>
  );
}

