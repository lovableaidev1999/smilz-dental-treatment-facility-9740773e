import { Calendar, MessageCircle } from "lucide-react";

interface StickyMobileCTAProps {
  phone?: string;
  whatsappMessage?: string;
  bookHref?: string;
}

/**
 * Mobile-first sticky bottom CTA bar visible only on small screens.
 * Two actions: Book Appointment (in-app route) and WhatsApp inquiry.
 */
const StickyMobileCTA = ({
  phone = "918961775554",
  whatsappMessage = "Hi Smilz Dental, I'd like to book a consultation.",
  bookHref = "/contact/",
}: StickyMobileCTAProps) => {
  const wa = `https://wa.me/${phone}?text=${encodeURIComponent(whatsappMessage)}`;
  return (
    <div
      className="md:hidden fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur shadow-[0_-4px_16px_rgba(0,0,0,0.08)]"
      role="region"
      aria-label="Quick contact actions"
    >
      <div className="grid grid-cols-2 gap-2 p-2">
        <a
          href={bookHref}
          className="flex items-center justify-center gap-2 rounded-md bg-[#1A365D] px-4 py-3 text-sm font-semibold text-white active:scale-[0.98] transition"
          aria-label="Book an appointment at Smilz Dental Clinic Garia"
        >
          <Calendar className="h-4 w-4" aria-hidden="true" />
          Book Appointment
        </a>
        <a
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 rounded-md bg-dental-green px-4 py-3 text-sm font-semibold text-white active:scale-[0.98] transition"
          aria-label="Send a WhatsApp inquiry to Smilz Dental Clinic Garia"
        >
          <MessageCircle className="h-4 w-4" aria-hidden="true" />
          WhatsApp Inquiry
        </a>
      </div>
    </div>
  );
};

export default StickyMobileCTA;
