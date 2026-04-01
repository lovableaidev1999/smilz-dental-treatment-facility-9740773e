import { Link } from "react-router-dom";
import { Phone, MessageCircle, Mail, MapPin, Clock } from "lucide-react";
import { CLINIC_INFO, SERVICES } from "@/lib/constants";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container-narrow mx-auto section-padding">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Clinic info */}
          <div>
            <h3 className="text-lg font-heading font-bold mb-4">{CLINIC_INFO.name}</h3>
            <p className="text-sm opacity-80 mb-4">{CLINIC_INFO.tagline}</p>
            <p className="text-sm opacity-80">
              Trusted dental care in South Kolkata since {CLINIC_INFO.yearEstablished}. Comprehensive, affordable, and patient-centric dental treatments.
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
              {SERVICES.map((service) => (
                <li key={service.id}>
                  <Link
                    to={`/services/${service.id}`}
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
                <span>{CLINIC_INFO.addressFull}</span>
              </li>
              <li>
                <a href={`tel:${CLINIC_INFO.phone}`} className="flex items-center gap-2 opacity-80 hover:opacity-100 transition-opacity">
                  <Phone className="h-4 w-4" />
                  {CLINIC_INFO.phoneFormatted}
                </a>
              </li>
              <li>
                <a href={`tel:${CLINIC_INFO.emergency}`} className="flex items-center gap-2 opacity-80 hover:opacity-100 transition-opacity">
                  <Phone className="h-4 w-4" />
                  Emergency: {CLINIC_INFO.emergency}
                </a>
              </li>
              <li>
                <a href={`mailto:${CLINIC_INFO.email}`} className="flex items-center gap-2 opacity-80 hover:opacity-100 transition-opacity">
                  <Mail className="h-4 w-4" />
                  {CLINIC_INFO.email}
                </a>
              </li>
              <li>
                <a
                  href={`https://wa.me/${CLINIC_INFO.whatsapp}`}
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
                  <p>{CLINIC_INFO.hours.days}</p>
                  <p>{CLINIC_INFO.hours.morning}</p>
                  <p>{CLINIC_INFO.hours.evening}</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-primary-foreground/20 text-center text-sm opacity-70">
          <p>&copy; {currentYear} {CLINIC_INFO.name}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
