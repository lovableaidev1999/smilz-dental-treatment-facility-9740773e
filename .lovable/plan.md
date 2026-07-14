## Gallery Lightbox Slideshow

Add a click-to-open lightbox on the Gallery page so visitors can browse all images in a full-screen swipeable slideshow.

### Behavior
- Clicking any gallery card opens a full-screen lightbox at that image's index.
- Swipe left/right on touch devices, arrow buttons on desktop, keyboard arrows (←/→) and Escape to close.
- Loops around at start/end.
- Shows image counter (e.g. "3 / 12") and caption/alt text below the image.
- Backdrop click and close (×) button dismiss.
- Body scroll locked while open.
- Preloads adjacent images for smooth transitions.

### Design (mobile-first)
- Full-viewport dark backdrop (`bg-background/95 backdrop-blur`).
- Image centered, `max-h-[80vh] max-w-full object-contain`, rounded on desktop.
- Controls sized for thumbs on mobile (44px hit area), arrows hidden on very small screens in favor of swipe; visible on `sm:` and up.
- Caption bar pinned to bottom with counter on the right.
- Focus trap + `aria-modal="true"` + `role="dialog"`.
- Uses existing design tokens (no hardcoded colors); animates in with `animate-fade-in` / `animate-scale-in`.

### Implementation
1. New component `src/components/GalleryLightbox.tsx`
   - Props: `images`, `startIndex`, `open`, `onClose`.
   - Reuses `embla-carousel-react` (already a project dep — same lib as `ClinicSlider.tsx`) with `loop: true` and `startIndex` for slide/swipe.
   - Keyboard listener for ←/→/Esc; effect to lock `document.body.style.overflow`.
2. Update `src/pages/Gallery.tsx`
   - Add `lightboxIndex` state (`number | null`).
   - Wrap each gallery card in a `<button>` that sets the index (keeps card visuals identical).
   - Render `<GalleryLightbox images={galleryItems} startIndex={lightboxIndex ?? 0} open={lightboxIndex !== null} onClose={...} />`.
   - Map gallery items to `{ src, alt, caption }` for the lightbox.

### Out of scope
- No changes to admin, data model, or SEO.
- No new dependencies.
