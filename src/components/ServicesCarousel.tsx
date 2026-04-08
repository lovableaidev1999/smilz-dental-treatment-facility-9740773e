import { useState, useEffect, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, ChevronRight as ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface ServiceItem {
  title: string;
  description?: string;
  image?: string;
  icon?: string;
  slug?: string;
}

interface ServicesCarouselProps {
  /** Structured service items from the services table */
  services?: Array<{
    title: string;
    short_desc?: string | null;
    featured_image?: string | null;
    icon?: string | null;
    slug: string;
  }>;
  /** Fallback: raw body text to parse into cards */
  bodyText?: string | null;
  /** Display mode */
  displayType?: "carousel" | "grid";
}

function parseBodyTextToItems(bodyText: string): ServiceItem[] {
  return bodyText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => ({ title: line }));
}

const ServicesCarousel = ({
  services,
  bodyText,
  displayType = "carousel",
}: ServicesCarouselProps) => {
  const isMobile = useIsMobile();

  // Build items: prefer structured services, then parsed body text
  const items: ServiceItem[] = services?.length
    ? services.map((s) => ({
        title: s.title,
        description: s.short_desc ?? undefined,
        image: s.featured_image ?? undefined,
        icon: s.icon ?? undefined,
        slug: s.slug,
      }))
    : bodyText
      ? parseBodyTextToItems(bodyText)
      : [];

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: items.length > 3,
    slidesToScroll: 1,
    containScroll: "trimSnaps",
    dragFree: false,
    watchDrag: true,
  });

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [selectedSnap, setSelectedSnap] = useState(0);
  const [snapCount, setSnapCount] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
    setSelectedSnap(emblaApi.selectedScrollSnap());
    setSnapCount(emblaApi.scrollSnapList().length);
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  // Reinitialize when items change (async data load)
  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.reInit();
  }, [emblaApi, items.length]);

  // Autoplay (desktop only)
  useEffect(() => {
    if (!emblaApi || isMobile || items.length <= 3) return;
    const timer = setInterval(() => {
      if (emblaApi.canScrollNext()) {
        emblaApi.scrollNext();
      } else {
        emblaApi.scrollTo(0);
      }
    }, 5000);
    return () => clearInterval(timer);
  }, [emblaApi, isMobile, items.length]);

  if (!items.length) return null;

  // Grid fallback
  if (displayType === "grid") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item, i) => (
          <ServiceCard key={i} item={item} />
        ))}
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Carousel viewport */}
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex -ml-4">
          {items.map((item, i) => (
            <div
              key={i}
              className={cn(
                "min-w-0 shrink-0 grow-0 pl-4",
                // Mobile: 1 card, Tablet: 2 cards, Desktop: 3 cards
                "basis-full sm:basis-1/2 lg:basis-1/3"
              )}
            >
              <ServiceCard item={item} />
            </div>
          ))}
        </div>
      </div>

      {/* Dots (always shown) */}
      {snapCount > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8">
          {/* Prev arrow (hidden on mobile, shown on tablet+) */}
          <button
            onClick={() => emblaApi?.scrollPrev()}
            disabled={!canScrollPrev}
            className="hidden sm:flex w-10 h-10 rounded-full bg-secondary hover:bg-primary hover:text-primary-foreground transition-colors items-center justify-center disabled:opacity-30 disabled:pointer-events-none"
            aria-label="Previous services"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div className="flex gap-1.5">
            {Array.from({ length: snapCount }).map((_, i) => (
              <button
                key={i}
                onClick={() => emblaApi?.scrollTo(i)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  i === selectedSnap
                    ? "bg-primary w-6"
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                )}
                aria-label={`Go to service group ${i + 1}`}
              />
            ))}
          </div>

          {/* Next arrow (hidden on mobile, shown on tablet+) */}
          <button
            onClick={() => emblaApi?.scrollNext()}
            disabled={!canScrollNext}
            className="hidden sm:flex w-10 h-10 rounded-full bg-secondary hover:bg-primary hover:text-primary-foreground transition-colors items-center justify-center disabled:opacity-30 disabled:pointer-events-none"
            aria-label="Next services"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
};

/** Individual service card */
function ServiceCard({ item }: { item: ServiceItem }) {
  const content = (
    <div className="group bg-card rounded-xl p-6 shadow-card hover:shadow-hover border border-border hover:border-primary/20 hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
      {item.image ? (
        <img
          src={item.image}
          alt={item.title}
          className="h-12 w-12 object-contain mb-4 rounded"
          loading="lazy"
          width={48}
          height={48}
        />
      ) : (
        <div className="text-4xl mb-4">{item.icon ?? "🦷"}</div>
      )}
      <h3 className="text-lg font-heading font-semibold text-foreground group-hover:text-primary transition-colors mb-2">
        {item.title}
      </h3>
      {item.description && (
        <p className="text-sm text-muted-foreground mb-4 flex-1">
          {item.description}
        </p>
      )}
      {item.slug && (
        <span className="text-primary text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all mt-auto">
          Learn More <ArrowRight className="h-4 w-4" />
        </span>
      )}
    </div>
  );

  if (item.slug) {
    return (
      <Link to={`/services/${item.slug}`} className="block h-full">
        {content}
      </Link>
    );
  }

  return content;
}

export default ServicesCarousel;
