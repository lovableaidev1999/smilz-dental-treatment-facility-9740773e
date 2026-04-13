import { RefObject } from "react";
import { Link } from "react-router-dom";
import { Phone, MessageCircle, MapPin, Clock, ChevronRight } from "lucide-react";

interface ServiceSidebarProps {
  serviceTitle: string;
  clinicName?: string;
  contact?: {
    whatsapp?: string;
    phone?: string;
    phone_formatted?: string;
    address?: string;
  };
  otherServices: Array<{ slug: string; title: string }>;
  contentRef: RefObject<HTMLDivElement>;
}

const ServiceSidebar = ({ serviceTitle, clinicName, contact, otherServices }: ServiceSidebarProps) => {
  return (
    <div className="space-y-6 lg:sticky lg:top-24 self-start">
      {/* Appointment CTA */}
      <div 
        className="bg-primary text-primary-foreground rounded-2xl p-6"
      >
        <h3 className="font-heading font-bold text-lg mb-3">Book Your Appointment</h3>
        <p className="text-sm text-primary-foreground/80 mb-5">
          Get expert {serviceTitle.toLowerCase()} treatment at {clinicName ?? "Smilz Dental Treatment Facility"}.
        </p>
        <div className="space-y-3">
          <a
            href={`https://wa.me/${contact?.whatsapp ?? "918961775554"}?text=Hi, I'm interested in ${serviceTitle} treatment.`}
            target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full bg-accent text-accent-foreground py-3 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            <MessageCircle className="h-4 w-4" /> WhatsApp Us
          </a>
          <a
            href={`tel:${contact?.phone ?? "8961775554"}`}
            className="flex items-center justify-center gap-2 w-full border border-primary-foreground/30 text-primary-foreground py-3 rounded-lg font-semibold text-sm hover:bg-primary-foreground/10 transition-colors"
          >
            <Phone className="h-4 w-4" /> Call {contact?.phone_formatted ?? "8961 77 5554"}
          </a>
        </div>
        <div className="mt-5 pt-5 border-t border-primary-foreground/20 space-y-3 text-sm text-primary-foreground/80">
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>{contact?.address ?? "21, Garia Park, South Kolkata - 700084"}</span>
          </div>
          <div className="flex items-start gap-2">
            <Clock className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>Mon-Sat: 9AM-1PM & 5PM-9PM</span>
          </div>
        </div>
      </div>

      {/* Other Services */}
      <div className="bg-card rounded-2xl p-6 shadow-card border border-border">
        <h3 className="font-heading font-bold text-foreground mb-4">Other Services</h3>
        <ul className="space-y-1">
          {otherServices.map((s) => (
            <li key={s.slug}>
              <Link
                to={`/services/${s.slug}`}
                className="flex items-center justify-between py-2.5 px-3 rounded-lg text-sm text-foreground hover:bg-secondary transition-colors"
              >
                {s.title} <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ServiceSidebar;
