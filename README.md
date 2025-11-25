# Flex Living Reviews Dashboard

A modern reviews management dashboard for property managers, built with Next.js 14, TypeScript, and Tailwind CSS.

<img width="1882" height="1093" alt="image" src="https://github.com/user-attachments/assets/248ffb80-31bc-4bff-8bd7-d4d2f5cc3c3d" />


## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open in browser
open http://localhost:3000
```

## 📋 Assessment Requirements

This project fulfills the Flex Living developer assessment requirements:

| Requirement | Status | Notes |
|------------|--------|-------|
| Hostaway Integration (Mocked) | ✅ | API route normalizes Hostaway data structure |
| Manager Dashboard | ✅ | Filter, sort, and approve reviews |
| Review Display Page | ✅ | Matches Flex Living website style |
| Google Reviews Exploration | ✅ | See findings below |

## 🏗️ Project Structure

```
src/
├── app/
│   ├── api/reviews/
│   │   ├── hostaway/route.ts    # Main API endpoint
│   │   └── approve/route.ts     # Review approval toggle
│   ├── dashboard/page.tsx       # Manager dashboard
│   └── property/[id]/page.tsx   # Public review display
├── components/
│   ├── dashboard/               # Dashboard-specific components
│   ├── reviews/                 # Reusable review components
│   └── ui/                      # shadcn/ui components
├── data/
│   ├── mock-reviews.json        # Mocked Hostaway API response
│   └── approved-reviews.json    # Manager-approved review IDs
├── lib/
│   └── review-utils.ts          # Normalization & filtering utilities
└── types/
    └── review.ts                # TypeScript type definitions
```

## 🔌 API Endpoint

### GET /api/reviews/hostaway

Fetches and normalizes reviews from the Hostaway API (falls back to mock data in sandbox mode).

**Query Parameters:**
- `propertyId` - Filter by specific property
- `channel` - Filter by booking channel (airbnb, booking.com, vrbo, direct)
- `type` - Filter by review type (guest, host, all)
- `minRating` - Minimum rating filter (1-5)
- `approvedOnly` - Return only manager-approved reviews

**Response Structure:**
```json
{
  "success": true,
  "reviews": [
    {
      "id": "10001",
      "propertyId": "1001",
      "property": {
        "id": "1001",
        "name": "2B Shoreditch Heights - Modern Loft",
        "shortName": "2B Shoreditch Heights",
        "location": "Shoreditch"
      },
      "reviewer": "Sophie Anderson",
      "reviewerInitials": "SA",
      "content": "Absolutely stunning apartment...",
      "overallRating": 5,
      "maxRating": 5,
      "categories": [
        { "name": "cleanliness", "displayName": "Cleanliness", "rating": 10, "maxRating": 10 }
      ],
      "type": "guest",
      "status": "published",
      "channel": "airbnb",
      "channelDisplayName": "Airbnb",
      "submittedAt": "2024-11-15T14:30:00.000Z",
      "submittedAtFormatted": "15 Nov 2024",
      "isApprovedForDisplay": true
    }
  ],
  "meta": {
    "total": 20,
    "properties": [...],
    "channels": ["airbnb", "booking.com", "vrbo", "direct"],
    "dateRange": { "earliest": "...", "latest": "..." }
  }
}
```

### POST /api/reviews/approve

Toggle the approval status of a review for public display.

**Request Body:**
```json
{
  "reviewId": "10001",
  "approved": true
}
```

## 🎨 Design Decisions

### 1. Data Normalization Strategy
The Hostaway API returns raw data that needs transformation for frontend use:
- **Category names** are normalized (e.g., `respect_house_rules` → `House Rules`)
- **Reviewer initials** are extracted for avatar display
- **Property info** is structured consistently with location extraction
- **Overall rating** is calculated from category averages if not provided
- **Dates** are parsed to ISO strings and formatted for display

### 2. Dashboard UX Philosophy
Rather than overwhelming managers with charts and graphs, the dashboard focuses on **actionable information**:
- **At-a-glance stats**: Total reviews, average rating, published count, and attention items
- **Quick filters**: Property, channel, rating, and type filters with one click
- **Property cards**: Show trend arrows (↑↓→) for quick performance assessment
- **Simple approval toggle**: Switch controls for review visibility

### 3. Component Architecture
- **Server components** for the property page (better SEO, faster initial load)
- **Client components** for the dashboard (interactive filtering and real-time updates)
- **Shared review components** used across both views for consistency

### 4. Styling Approach
Colors and typography match the Flex Living website:
- **Primary dark**: `#323927` (olive green)
- **Accent**: `#D4F872` (lime green)
- **Background**: `#FBFAF9` (warm white)
- **Font**: DM Sans (clean, professional)

## 🔍 Google Reviews Integration - Exploration Findings

### Overview
Google Reviews integration was explored using the Google Places API (New) and legacy Places API.

### Feasibility Assessment

| Aspect | Finding |
|--------|---------|
| **API Availability** | ✅ Google Places API provides review data |
| **Review Data** | ⚠️ Limited to 5 most relevant reviews per place |
| **Review Fields** | ✅ Text, rating, author, time, language |
| **Pricing** | ⚠️ $17 per 1000 requests (Place Details) |
| **Rate Limits** | ✅ Reasonable for property management use case |

### Implementation Approach

To integrate Google Reviews, you would need to:

1. **Get Place IDs** for each property:
   ```typescript
   // Use Place Search to find the property
   const placeId = await findPlaceFromText(propertyAddress);
   ```

2. **Fetch Reviews**:
   ```typescript
   // Fetch place details including reviews
   const response = await fetch(
     `https://maps.googleapis.com/maps/api/place/details/json?` +
     `place_id=${placeId}&fields=reviews&key=${API_KEY}`
   );
   ```

3. **Normalize to Common Format**:
   ```typescript
   interface GoogleReview {
     author_name: string;
     rating: number;
     text: string;
     time: number;
     language: string;
   }
   
   // Transform to match our NormalizedReview structure
   ```

### Limitations

1. **5-Review Limit**: Google only returns the 5 "most relevant" reviews, which may not include the most recent ones.

2. **No Historical Access**: Unlike Hostaway, you can't access the full review history.

3. **No Filtering**: You can't filter by date or rating at the API level.

4. **Terms of Service**: Reviews cannot be cached long-term; must display Google attribution.

### Recommendation

For a production implementation:
- **Use Google Reviews as supplementary data** alongside Hostaway reviews
- **Display Google rating badge** on property pages for credibility
- **Link to full Google listing** rather than trying to display all reviews
- **Cache reviews for 24 hours** maximum per Google's terms

### Sample Integration (Not Implemented)

```typescript
// Example: How Google Reviews could be added
interface GooglePlaceReview {
  channelType: 'google';
  placeId: string;
  overallRating: number;
  reviewCount: number;
  reviews: NormalizedReview[];
}

async function fetchGoogleReviews(placeId: string): Promise<GooglePlaceReview> {
  // Implementation would go here
}
```

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Data Storage**: JSON files (mock data)

## 📁 Mock Data

The mock data (`src/data/mock-reviews.json`) contains 20 realistic reviews across 4 properties:
- 2B Shoreditch Heights (London)
- Le Marais Studio (Paris)
- Gothic Quarter Retreat (Barcelona)
- Kreuzberg Loft (Berlin)

Reviews span multiple channels (Airbnb, Booking.com, VRBO, Direct) with varied ratings and detailed category scores.

## 🔒 Hostaway API Credentials

For reference (provided in assessment):
- **Account ID**: 61148
- **API Key**: f94377ebbbb479490bb3ec364649168dc443dda2e4830facaf5de2e74ccc9152

The sandbox API returns no reviews, so the application falls back to mock data automatically.

## 📝 Future Improvements

If this were a production application:

1. **Database Integration**: Replace JSON files with PostgreSQL or MongoDB
2. **Authentication**: Add manager login with NextAuth.js
3. **Real-time Updates**: WebSocket for live review notifications
4. **Email Alerts**: Notify managers of new low-rating reviews
5. **Analytics**: Trend graphs for rating changes over time
6. **Export**: CSV/PDF export of reviews for reporting
7. **Multi-language**: Support for review translation
8. **Response Management**: Allow managers to draft responses

---

Built with ❤️ for the Flex Living Developer Assessment
