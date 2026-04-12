import { Link } from "react-router-dom";
import { ChevronRight, Phone, MessageCircle } from "lucide-react";

interface ServiceHeroProps {
  title: string;
  shortDesc: string | null;
  contact?: {
    whatsapp?: string;
    phone?: string;
    phone_formatted?: string;
  };
}

const ServiceHero = ({ title, shortDesc, contact }: ServiceHeroProps) => (
  <section className="bg-gradient-primary text-primary-foreground section-padding">
    <div className="container-narrow mx-auto">
      <nav className="flex items-center gap-2 text-sm text-primary-foreground/70 mb-6" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-primary-foreground transition-colors">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link to="/services" className="hover:text-primary-foreground transition-colors">Services</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-primary-foreground">{title}</span>
      </nav>
      <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">{title}</h1>
      <p className="text-primary-foreground/85 max-w-2xl text-lg">{shortDesc}</p>
      <div className="flex flex-wrap gap-4 mt-6">
        <a
          href={`https://wa.me/${contact?.whatsapp ?? "918961775554"}?text=Hi, I'm interested in ${title} treatment.`}
          target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-6 py-3 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          <MessageCircle className="h-4 w-4" /> Book Appointment
        </a>
        <a
          href={`tel:${contact?.phone ?? "8961775554"}`}
          className="inline-flex items-center gap-2 border-2 border-primary-foreground/40 text-primary-foreground px-6 py-3 rounded-lg font-semibold text-sm hover:bg-primary-foreground/10 transition-colors"
        >
          <Phone className="h-4 w-4" /> Call {contact?.phone_formatted ?? "8961 77 5554"}
        </a>
      </div>
    </div>
  </section>
);

export default ServiceHero;
