import { Link } from "react-router-dom";
import { Phone, MessageCircle, Mail, MapPin, Clock } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useServices } from "@/integrations/supabase/hooks";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { data: settings } = useSiteSettings();
  const { data: services } = useServices();

  const general = settings?.general;
  const contact = settings?.contact;
  const hours = settings?.hours;
  const links = settings?.links;
  const appearance = settings?.appearance;

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container-narrow mx-auto section-padding">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Clinic info */}
          <div>
            <h3 className="text-lg font-heading font-bold mb-4">{general?.clinic_name ?? "Smilz Dental Treatment Facility"}</h3>
            <p className="text-sm opacity-80 mb-4">{general?.tagline ?? "Bridging Gaps... Spreading Smiles!"}</p>
            <p className="text-sm opacity-80">
              {appearance?.footer_text || `Trusted dental care in South Kolkata since ${general?.year_established ?? 1999}. Comprehensive, affordable, and patient-centric dental treatments.`}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-heading font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              {[
                { label: "Home", to: "/" },
                { label: "About Us", to: "/about" },
                { label: "Services", to: "/services" },
                { label: "Gallery", to: "/gallery" },
                { label: "Blog", to: "/blog" },
                { label: "Contact", to: "/contact" },
                { label: "Referral Registration", to: "/referral" },
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="opacity-80 hover:opacity-100 transition-opacity">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-heading font-bold mb-4">Our Services</h3>
            <ul className="space-y-2 text-sm">
              {(services ?? []).map((service) => (
                <li key={service.slug}>
                  <Link
                    to={`/services/${service.slug}`}
                    className="opacity-80 hover:opacity-100 transition-opacity"
                  >
                    {service.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-heading font-bold mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2 opacity-80">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>{contact?.address_full ?? "21, Garia Park, Garia Park Buddha Temple, Garia, South Kolkata 700084"}</span>
              </li>
              <li>
                <a href={`tel:${contact?.phone ?? "8961775554"}`} className="flex items-center gap-2 opacity-80 hover:opacity-100 transition-opacity">
                  <Phone className="h-4 w-4" />
                  {contact?.phone_formatted ?? "8961 77 5554"}
                </a>
              </li>
              <li>
                <a href={`tel:${contact?.emergency ?? "9831070248"}`} className="flex items-center gap-2 opacity-80 hover:opacity-100 transition-opacity">
                  <Phone className="h-4 w-4" />
                  Emergency: {contact?.emergency ?? "9831070248"}
                </a>
              </li>
              <li>
                <a href={`mailto:${contact?.email ?? "dr.d.dutta@gmail.com"}`} className="flex items-center gap-2 opacity-80 hover:opacity-100 transition-opacity">
                  <Mail className="h-4 w-4" />
                  {contact?.email ?? "dr.d.dutta@gmail.com"}
                </a>
              </li>
              <li>
                <a
                  href={`https://wa.me/${contact?.whatsapp ?? "918961775554"}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 opacity-80 hover:opacity-100 transition-opacity"
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp Us
                </a>
              </li>
              <li className="flex items-start gap-2 opacity-80">
                <Clock className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p>{hours?.days ?? "Monday – Saturday"}</p>
                  <p>{hours?.morning ?? "9:00 AM – 1:00 PM"}</p>
                  <p>{hours?.evening ?? "5:00 PM – 9:00 PM"}</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-primary-foreground/20 text-center text-sm opacity-70">
          <p>&copy; {currentYear} {general?.clinic_name ?? "Smilz Dental Treatment Facility"}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
