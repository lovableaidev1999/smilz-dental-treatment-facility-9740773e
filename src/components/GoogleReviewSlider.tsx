import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

interface Review {
  id?: string;
  name: string;
  rating: number;
  text: string;
  date: string;
}

interface GoogleReviewSliderProps {
  reviews: Review[];
}

const GoogleReviewSlider = ({ reviews }: GoogleReviewSliderProps) => {
  const { data: settings } = useSiteSettings();
  const general = settings?.general;
  const links = settings?.links;
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const visibleCount = 3;
  const maxIndex = Math.max(0, reviews.length - visibleCount);

  const next = useCallback(() => {
    setCurrent((c) => (c >= maxIndex ? 0 : c + 1));
  }, [maxIndex]);

  const prev = useCallback(() => {
    setCurrent((c) => (c <= 0 ? maxIndex : c - 1));
  }, [maxIndex]);

  useEffect(() => {
    if (isPaused || reviews.length <= visibleCount) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [isPaused, next, reviews.length]);

  if (!reviews.length) return null;

  const visibleReviews = reviews.slice(current, current + visibleCount);
  // Wrap around if needed
  const displayReviews = visibleReviews.length < visibleCount
    ? [...visibleReviews, ...reviews.slice(0, visibleCount - visibleReviews.length)]
    : visibleReviews;

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Google-style header */}
      <div className="flex items-center justify-center gap-3 mb-8">
        <div className="flex items-center gap-2">
          {/* Google "G" icon */}
          <svg viewBox="0 0 24 24" className="w-7 h-7" aria-hidden="true">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          <span className="text-lg font-semibold text-foreground">Google Reviews</span>
        </div>
        <div className="flex items-center gap-1.5 ml-2">
          <span className="text-2xl font-bold text-foreground">{general?.google_rating ?? 4.8}</span>
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-5 w-5 ${i < Math.round(general?.google_rating ?? 4.8) ? "fill-[hsl(40,80%,55%)] text-[hsl(40,80%,55%)]" : "text-muted-foreground/30"}`}
              />
            ))}
          </div>
          <span className="text-sm text-muted-foreground">({general?.review_count ?? 44})</span>
        </div>
      </div>

      {/* Reviews carousel */}
      <div className="relative overflow-hidden">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {displayReviews.map((review, i) => (
              <div
                key={`${review.name}-${i}`}
                className="bg-card rounded-xl p-6 shadow-card border border-border hover:shadow-hover transition-shadow duration-300"
              >
                {/* Reviewer header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm flex-shrink-0">
                    {review.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-foreground truncate">{review.name}</p>
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[...Array(5)].map((_, j) => (
                          <Star
                            key={j}
                            className={`h-3.5 w-3.5 ${j < review.rating ? "fill-[hsl(40,80%,55%)] text-[hsl(40,80%,55%)]" : "text-muted-foreground/30"}`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">{review.date}</span>
                    </div>
                  </div>
                  {/* Small Google icon */}
                  <svg viewBox="0 0 24 24" className="w-5 h-5 ml-auto flex-shrink-0 opacity-60" aria-hidden="true">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                </div>
                {/* Review text */}
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">"{review.text}"</p>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation controls */}
      {reviews.length > visibleCount && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={prev}
            className="w-10 h-10 rounded-full bg-secondary hover:bg-primary hover:text-primary-foreground transition-colors flex items-center justify-center"
            aria-label="Previous reviews"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex gap-1.5">
            {Array.from({ length: maxIndex + 1 }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-2 h-2 rounded-full transition-all ${i === current ? "bg-primary w-6" : "bg-muted-foreground/30 hover:bg-muted-foreground/50"}`}
                aria-label={`Go to review group ${i + 1}`}
              />
            ))}
          </div>
          <button
            onClick={next}
            className="w-10 h-10 rounded-full bg-secondary hover:bg-primary hover:text-primary-foreground transition-colors flex items-center justify-center"
            aria-label="Next reviews"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Write a review / See all */}
      <div className="flex items-center justify-center gap-6 mt-6">
        <a
          href={links?.google_maps_url ?? "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary font-medium text-sm hover:underline inline-flex items-center gap-1.5"
        >
          See all reviews on Google <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  );
};

export default GoogleReviewSlider;
