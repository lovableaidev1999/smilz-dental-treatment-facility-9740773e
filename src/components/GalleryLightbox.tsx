import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface LightboxImage {
  src: string;
  alt: string;
  caption?: string;
}

interface GalleryLightboxProps {
  images: LightboxImage[];
  startIndex: number;
  open: boolean;
  onClose: () => void;
}

const GalleryLightbox = ({ images, startIndex, open, onClose }: GalleryLightboxProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, startIndex });
  const [selected, setSelected] = useState(startIndex);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  // Track slide changes
  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelected(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();
    return () => { emblaApi.off("select", onSelect); };
  }, [emblaApi]);

  // Reset to startIndex whenever opened
  useEffect(() => {
    if (open && emblaApi) {
      emblaApi.scrollTo(startIndex, true);
    }
  }, [open, startIndex, emblaApi]);

  // Keyboard controls + body scroll lock
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") scrollPrev();
      else if (e.key === "ArrowRight") scrollNext();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose, scrollPrev, scrollNext]);

  if (!open || images.length === 0) return null;

  const current = images[selected];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Gallery slideshow"
      className="fixed inset-0 z-[100] bg-foreground/95 backdrop-blur-sm animate-fade-in flex flex-col"
      onClick={onClose}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 text-background">
        <span className="text-sm sm:text-base font-medium tabular-nums">
          {selected + 1} / {images.length}
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          className="h-11 w-11 flex items-center justify-center rounded-full hover:bg-background/10 transition-colors"
          aria-label="Close slideshow"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      {/* Carousel */}
      <div
        className="relative flex-1 flex items-center justify-center min-h-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div ref={emblaRef} className="overflow-hidden w-full h-full">
          <div className="flex h-full">
            {images.map((img, i) => (
              <div key={i} className="flex-[0_0_100%] min-w-0 h-full flex items-center justify-center px-2 sm:px-6">
                <img
                  src={img.src}
                  alt={img.alt}
                  className="max-h-[75vh] sm:max-h-[80vh] max-w-full w-auto h-auto object-contain rounded-lg sm:rounded-xl select-none"
                  draggable={false}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Arrows (hidden on very small screens; swipe instead) */}
        <button
          onClick={(e) => { e.stopPropagation(); scrollPrev(); }}
          className={cn(
            "hidden sm:flex absolute left-3 md:left-6 top-1/2 -translate-y-1/2",
            "h-12 w-12 items-center justify-center rounded-full",
            "bg-background/10 hover:bg-background/20 text-background transition-colors"
          )}
          aria-label="Previous image"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); scrollNext(); }}
          className={cn(
            "hidden sm:flex absolute right-3 md:right-6 top-1/2 -translate-y-1/2",
            "h-12 w-12 items-center justify-center rounded-full",
            "bg-background/10 hover:bg-background/20 text-background transition-colors"
          )}
          aria-label="Next image"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      {/* Caption */}
      {(current?.caption || current?.alt) && (
        <div
          className="px-4 sm:px-6 pb-5 sm:pb-6 pt-2 text-center text-background/90"
          onClick={(e) => e.stopPropagation()}
        >
          <p className="text-sm sm:text-base max-w-2xl mx-auto">
            {current.caption || current.alt}
          </p>
        </div>
      )}
    </div>
  );
};

export default GalleryLightbox;
