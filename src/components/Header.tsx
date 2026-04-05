import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Phone, MessageCircle, Menu, X, Clock, MapPin } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import logo from "@/assets/logo.webp";

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { data: settings } = useSiteSettings();

  const contact = settings?.contact;
  const hours = settings?.hours;
  const header = settings?.header;

  const navLinks = header?.nav_links ?? [
    { label: "Home", path: "/" },
    { label: "Services", path: "/services" },
    { label: "About Us", path: "/about" },
    { label: "Gallery", path: "/gallery" },
    { label: "Insights", path: "/blog" },
    { label: "Contact", path: "/contact" },
  ];

  const ctaText = header?.cta_text || "Book Appointment";
  const ctaMessage = header?.cta_message || "Hi, I would like to book an appointment.";
  const logoHeight = header?.logo_max_height || 48;
  const showTopBar = header?.show_top_bar ?? true;

  return (
    <>
      {/* Top bar */}
      {showTopBar && (
        <div className="bg-primary text-primary-foreground text-sm hidden md:block">
          <div className="container-narrow mx-auto flex items-center justify-between py-2 px-4">
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                {contact?.address ?? "21, Garia Park, Kolkata 700084"}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                Mon-Sat: {hours?.morning ?? "9:00 AM – 1:00 PM"} & {hours?.evening ?? "5:00 PM – 9:00 PM"}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <a href={`tel:${contact?.phone ?? "8961775554"}`} className="flex items-center gap-1.5 hover:opacity-80 transition-opacity">
                <Phone className="h-3.5 w-3.5" />
                {contact?.phone_formatted ?? "8961 77 5554"}
              </a>
              <a
                href={`https://wa.me/${contact?.whatsapp ?? "918961775554"}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Main header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md shadow-card border-b border-border">
        <div className="container-narrow mx-auto flex items-center justify-between py-3 px-4">
          <Link to="/" className="flex items-center gap-3">
            <img
              src={settings?.appearance?.logo_url || logo}
              alt={`${settings?.general?.clinic_name ?? "Smilz"} Logo`}
              style={{ height: `${logoHeight}px` }}
              className="w-auto object-contain"
              width={logoHeight * 2.5}
              height={logoHeight}
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  location.pathname === link.path
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-secondary hover:text-secondary-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* CTA + Mobile toggle */}
          <div className="flex items-center gap-3">
            <a
              href={`https://wa.me/${contact?.whatsapp ?? "918961775554"}?text=${encodeURIComponent(ctaMessage)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-2 bg-gradient-accent text-accent-foreground px-5 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              {ctaText}
            </a>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-border bg-card animate-fade-in">
            <nav className="container-narrow mx-auto flex flex-col py-4 px-4 gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileOpen(false)}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === link.path
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-secondary"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <a
                href={`https://wa.me/${contact?.whatsapp ?? "918961775554"}?text=${encodeURIComponent(ctaMessage)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 flex items-center justify-center gap-2 bg-gradient-accent text-accent-foreground px-5 py-3 rounded-lg text-sm font-semibold"
              >
                {ctaText}
              </a>
            </nav>
          </div>
        )}
      </header>
    </>
  );
};

export default Header;
