import Link from "next/link";

/**
 * Landing page with navigation to the dashboard and property pages
 */
export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-br from-background via-background to-secondary/30">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#D4F872]/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#D4F872]/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-2xl w-full space-y-8 text-center">
        {/* Logo/Brand */}
        <div className="space-y-4 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-primary-foreground mb-4">
            <svg 
              className="w-8 h-8" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" 
              />
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-foreground">
            Flex Living
            <span className="block text-2xl md:text-3xl text-muted-foreground font-normal mt-2">
              Reviews Dashboard
            </span>
          </h1>
        </div>

        {/* Description */}
        <p className="text-lg text-muted-foreground max-w-md mx-auto animate-slide-up">
          Manage guest reviews across all your properties. Analyze performance, 
          spot trends, and curate what guests see.
        </p>

        {/* Navigation Cards */}
        <div className="grid md:grid-cols-2 gap-4 pt-4">
          <Link 
            href="/dashboard" 
            className="group animate-slide-up stagger-1"
          >
            <div className="fl-card-hover p-6 text-left h-full">
              <div className="flex items-start justify-between mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <svg 
                    className="w-6 h-6 text-primary" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" 
                    />
                  </svg>
                </div>
                <svg 
                  className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M9 5l7 7-7 7" 
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold mb-2">Manager Dashboard</h2>
              <p className="text-sm text-muted-foreground">
                View performance metrics, filter reviews, and select which reviews 
                to display publicly.
              </p>
            </div>
          </Link>

          <Link 
            href="/property/1001" 
            className="group animate-slide-up stagger-2"
          >
            <div className="fl-card-hover p-6 text-left h-full">
              <div className="flex items-start justify-between mb-4">
                <div className="p-2 rounded-lg bg-accent/30">
                  <svg 
                    className="w-6 h-6 text-primary" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" 
                    />
                  </svg>
                </div>
                <svg 
                  className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M9 5l7 7-7 7" 
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold mb-2">Property Reviews</h2>
              <p className="text-sm text-muted-foreground">
                See how reviews appear on property pages. Only manager-approved 
                reviews are displayed.
              </p>
            </div>
          </Link>
        </div>

        {/* API Info */}
        <div className="pt-8 animate-fade-in" style={{ animationDelay: '400ms' }}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-sm text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            API Endpoint: <code className="font-mono text-foreground">/api/reviews/hostaway</code>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-0 left-0 right-0 p-6 text-center text-sm text-muted-foreground">
        Flex Living Developer Assessment
      </footer>
    </main>
  );
}
