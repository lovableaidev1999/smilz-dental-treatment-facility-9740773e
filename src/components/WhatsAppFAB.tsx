import { MessageCircle } from "lucide-react";
import { CLINIC_INFO } from "@/lib/constants";

const WhatsAppFAB = () => {
  return (
    <a
      href={`https://wa.me/${CLINIC_INFO.whatsapp}?text=Hi, I would like to book an appointment at Smilz Dental.`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-dental-green text-primary-foreground px-4 py-3 rounded-full shadow-elevated hover:shadow-hover transition-all duration-300 animate-pulse-gentle group"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="h-6 w-6" />
      <span className="hidden sm:inline text-sm font-semibold">WhatsApp Us</span>
    </a>
  );
};

export default WhatsAppFAB;
