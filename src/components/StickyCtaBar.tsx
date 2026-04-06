import { Phone, MessageCircle } from "lucide-react";

const StickyCtaBar = () => {
  return (
    <div className="sticky top-0 z-50 w-full bg-primary/95 backdrop-blur-sm shadow-md">
      <div className="container-narrow mx-auto flex items-center justify-center gap-3 py-2.5 px-4">
        <a
          href="https://wa.me/918961775554?text=Hi%2C%20I%20would%20like%20to%20book%20an%20appointment."
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg bg-destructive px-5 py-2.5 text-sm font-semibold text-destructive-foreground transition-colors hover:bg-destructive/90"
        >
          <MessageCircle className="h-4 w-4" />
          Book Appointment
        </a>
        <a
          href="tel:+918961775554"
          className="inline-flex items-center gap-2 rounded-lg border border-primary-foreground/30 bg-primary-foreground/10 px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/20"
        >
          <Phone className="h-4 w-4" />
          Call Now
        </a>
      </div>
    </div>
  );
};

export default StickyCtaBar;
