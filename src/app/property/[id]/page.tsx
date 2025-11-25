/**
 * Property Review Display Page
 * 
 * Public-facing page that displays approved reviews for a specific property.
 * Styled to match the Flex Living website design.
 */

import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { StarRating } from '@/components/reviews/StarRating';
import { ChannelBadge } from '@/components/reviews/ChannelBadge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { normalizeHostawayResponse } from '@/lib/review-utils';
import type { HostawayApiResponse, NormalizedReview } from '@/types/review';

// Import mock data directly for server-side rendering
import mockReviews from '@/data/mock-reviews.json';
import approvedData from '@/data/approved-reviews.json';

interface PropertyPageProps {
  params: Promise<{
    id: string;
  }>;
}

// Property details (in a real app, this would come from a database)
const propertyDetails: Record<string, {
  name: string;
  location: string;
  description: string;
  amenities: string[];
  image: string;
  guests: number;
  bedrooms: number;
  bathrooms: number;
}> = {
  '1001': {
    name: '2B Shoreditch Heights - Modern Loft',
    location: 'Shoreditch, London',
    description: 'Experience the vibrant energy of Shoreditch in this stunning modern loft. Floor-to-ceiling windows flood the space with natural light, while the industrial-chic design creates a perfect blend of comfort and style. Walking distance to the best cafes, galleries, and nightlife in East London.',
    amenities: ['WiFi', 'Kitchen', 'Washer', 'Air conditioning', 'Workspace', 'Rooftop access'],
    image: '/apartmentImages/Apartment1.jpg',
    guests: 4,
    bedrooms: 2,
    bathrooms: 1,
  },
  '1002': {
    name: 'Le Marais Studio - Charming Hideaway',
    location: 'Le Marais, Paris',
    description: 'A quintessential Parisian apartment nestled in the heart of Le Marais. Original hardwood floors, exposed beams, and French windows opening onto a quiet courtyard. Steps away from historic Place des Vosges and the best boutiques in Paris.',
    amenities: ['WiFi', 'Kitchen', 'Heating', 'Courtyard view', 'Coffee maker'],
    image: '/apartmentImages/Apartment2.jpg',
    guests: 2,
    bedrooms: 1,
    bathrooms: 1,
  },
  '1003': {
    name: 'Gothic Quarter Retreat - 1BR',
    location: 'Gothic Quarter, Barcelona',
    description: 'Discover Barcelona from this charming apartment in the historic Gothic Quarter. Ancient stone walls meet modern amenities, just minutes from the beach and the famous La Rambla. Perfect for couples seeking romance and adventure.',
    amenities: ['WiFi', 'Kitchen', 'Air conditioning', 'Beach nearby', 'Balcony'],
    image: '/apartmentImages/Apartment3.jpg',
    guests: 2,
    bedrooms: 1,
    bathrooms: 1,
  },
  '1004': {
    name: 'Kreuzberg Loft - Industrial Chic',
    location: 'Kreuzberg, Berlin',
    description: 'An authentic Berlin experience in the heart of creative Kreuzberg. High ceilings, exposed brick, and minimalist design create the perfect space for digital nomads and urban explorers. Surrounded by the best street food, clubs, and galleries in the city.',
    amenities: ['WiFi', 'Kitchen', 'Washer', 'Heating', 'Workspace', 'Bike rental'],
    image: '/apartmentImages/Apartment4.jpg',
    guests: 3,
    bedrooms: 1,
    bathrooms: 1,
  },
};

async function getPropertyReviews(propertyId: string): Promise<NormalizedReview[]> {
  const approvedIds = new Set(approvedData.approvedReviewIds);
  const normalized = normalizeHostawayResponse(
    mockReviews as HostawayApiResponse,
    approvedIds
  );

  // Filter to only approved guest reviews for this property
  return normalized.reviews.filter(
    r => r.propertyId === propertyId && 
         r.isApprovedForDisplay && 
         r.type === 'guest'
  );
}

export default async function PropertyPage({ params }: PropertyPageProps) {
  const { id } = await params;
  const property = propertyDetails[id];
  
  if (!property) {
    notFound();
  }

  const reviews = await getPropertyReviews(id);
  
  // Calculate average rating
  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.overallRating, 0) / reviews.length
    : 0;

  return (
    <div className="min-h-screen bg-[#FBFAF9]">
      {/* Header - Flex Living Style */}
      <header className="bg-[#323927] text-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#D4F872] flex items-center justify-center">
                <svg className="w-5 h-5 text-[#323927]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <span className="text-xl font-semibold">Flex Living</span>
            </Link>
            <Link href="/dashboard">
              <Button className="bg-[#D4F872] text-[#323927] hover:bg-[#D4F872]/90 font-medium shadow-sm px-6 py-2.5">
                Manager Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Property Hero Section */}
        <section className="bg-[#323927] text-white pb-12 pt-8">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-2 text-sm text-white/70 mb-4">
              <Link href="/" className="hover:text-white">Home</Link>
              <span>/</span>
              <span>{property.location}</span>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-6">
                <h1 className="text-3xl md:text-4xl font-semibold leading-tight">
                  {property.name}
                </h1>
                
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-[#D4F872]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{property.location}</span>
                  </div>
                  
                  {reviews.length > 0 && (
                    <div className="flex items-center gap-2">
                      <StarRating rating={averageRating} size="sm" />
                      <span className="font-medium">{averageRating.toFixed(1)}</span>
                      <span className="text-white/70">({reviews.length} reviews)</span>
                    </div>
                  )}
                </div>

                <p className="text-white/80 leading-relaxed">
                  {property.description}
                </p>

                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-2 px-3 py-2 bg-white/10 rounded-lg">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span>{property.guests} guests</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 bg-white/10 rounded-lg">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <span>{property.bedrooms} bedroom{property.bedrooms > 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 bg-white/10 rounded-lg">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                    </svg>
                    <span>{property.bathrooms} bathroom{property.bathrooms > 1 ? 's' : ''}</span>
                  </div>
                </div>
              </div>

              {/* Property Image */}
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-white/10 to-white/5">
                <Image
                  src={property.image}
                  alt={property.name}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Amenities Section */}
        <section className="py-8 bg-white border-b border-[#CECEC7]">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap gap-3">
              {property.amenities.map((amenity) => (
                <Badge 
                  key={amenity} 
                  variant="secondary"
                  className="bg-[#F5F3EF] text-[#323927] hover:bg-[#F5F3EF] px-4 py-2"
                >
                  {amenity}
                </Badge>
              ))}
            </div>
          </div>
        </section>

        {/* Guest Reviews Section */}
        <section className="py-12 md:py-16" id="reviews">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl">
              {/* Section Header */}
              <div className="mb-8">
                <h2 className="text-2xl md:text-3xl font-semibold text-[#323927] mb-2">
                  Guest Reviews
                </h2>
                {reviews.length > 0 && (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-3xl font-bold text-[#323927]">
                        {averageRating.toFixed(1)}
                      </span>
                      <StarRating rating={averageRating} size="lg" />
                    </div>
                    <span className="text-muted-foreground">
                      Based on {reviews.length} verified review{reviews.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </div>

              {/* Reviews List */}
              {reviews.length === 0 ? (
                <div className="text-center py-12 bg-[#F5F3EF] rounded-2xl">
                  <svg className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <p className="text-muted-foreground">No reviews yet for this property</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {reviews.map((review, index) => (
                    <article 
                      key={review.id} 
                      className="p-6 bg-white rounded-2xl border border-[#CECEC7]/50 shadow-sm animate-fade-in"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      {/* Review Header */}
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-[#D4F872] text-[#323927] font-medium">
                              {review.reviewerInitials}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-[#323927]">{review.reviewer}</p>
                            <p className="text-sm text-muted-foreground">
                              {review.submittedAtFormatted}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <ChannelBadge channel={review.channel} />
                          <StarRating rating={review.overallRating} size="sm" showValue />
                        </div>
                      </div>

                      {/* Review Content */}
                      <p className="text-[#323927] leading-relaxed">
                        {review.content}
                      </p>

                      {/* Category Ratings */}
                      {review.categories.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-[#CECEC7]/30">
                          <div className="flex flex-wrap gap-4">
                            {review.categories.slice(0, 4).map((cat) => (
                              <div key={cat.name} className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">
                                  {cat.displayName}
                                </span>
                                <div className="flex items-center gap-1">
                                  <div className="w-16 h-1.5 bg-[#F5F3EF] rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-[#D4F872] rounded-full"
                                      style={{ width: `${(cat.rating / cat.maxRating) * 100}%` }}
                                    />
                                  </div>
                                  <span className="text-xs font-medium text-[#323927]">
                                    {cat.rating}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Other Properties CTA */}
        <section className="py-12 bg-[#F5F3EF]">
          <div className="container mx-auto px-4 text-center">
            <h3 className="text-xl font-semibold text-[#323927] mb-4">
              Explore More Properties
            </h3>
            <div className="flex flex-wrap justify-center gap-3">
              {Object.entries(propertyDetails)
                .filter(([key]) => key !== id)
                .map(([key, prop]) => (
                  <Link key={key} href={`/property/${key}`}>
                    <Button variant="outline" className="border-[#323927]/20 hover:bg-white">
                      {prop.location.split(',')[0]}
                    </Button>
                  </Link>
                ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#323927] text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#D4F872] flex items-center justify-center">
                <svg className="w-4 h-4 text-[#323927]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <span className="font-semibold">Flex Living</span>
            </div>
            <p className="text-white/60 text-sm">
              Developer Assessment Demo
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Generate static params for known properties
export function generateStaticParams() {
  return Object.keys(propertyDetails).map((id) => ({ id }));
}

