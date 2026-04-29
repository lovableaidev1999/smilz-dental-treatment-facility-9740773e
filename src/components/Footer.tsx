import { Link } from "react-router-dom";
import { Phone, MessageCircle, Mail, MapPin, Clock, Facebook, Instagram, Youtube } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useServices } from "@/integrations/supabase/hooks";
import { servicePath } from "@/lib/slugs";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { data: settings } = useSiteSettings();
  const { data: services } = useServices();

  const general = settings?.general;
  const contact = settings?.contact;
  const hours = settings?.hours;
  const links = settings?.links;
  const appearance = settings?.appearance;
  const footer = settings?.footer;

  const layout = footer?.layout ?? "standard";
  const showQuickLinks = footer?.show_quick_links ?? true;
  const showServices = footer?.show_services ?? true;
  const showContact = footer?.show_contact ?? true;
  const showSocial = footer?.show_social_icons ?? true;
  const quickLinks = footer?.quick_links ?? [
    { label: "Home", path: "/" },
    { label: "About Us", path: "/about" },
    { label: "Services", path: "/services" },
    { label: "Gallery", path: "/gallery" },
    { label: "Blog", path: "/blog" },
    { label: "Contact", path: "/contact" },
    { label: "Referral Registration", path: "/referral" },
  ];

  const copyrightText = footer?.custom_copyright
    ? `© ${currentYear} ${footer.custom_copyright}`
    : `© ${currentYear} ${general?.clinic_name ?? "Smilz Dental Treatment Facility"}. All rights reserved.`;

  const socialLinks = [
    { url: links?.facebook, icon: Facebook, label: "Facebook" },
    { url: links?.instagram, icon: Instagram, label: "Instagram" },
    { url: links?.youtube, icon: Youtube, label: "YouTube" },
  ].filter((s) => s.url);

  // ── Centered Layout ──
  if (layout === "centered") {
    return (
      <footer className="bg-primary text-primary-foreground">
        <div className="container-narrow mx-auto section-padding text-center">
          <h3 className="text-xl font-heading font-bold mb-2">{general?.clinic_name ?? "Smilz Dental Treatment Facility"}</h3>
          <p className="text-sm opacity-80 mb-6">{general?.tagline ?? "Bridging Gaps... Spreading Smiles!"}</p>

          {showQuickLinks && (
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-6">
              {quickLinks.map((link) => (
                <Link key={link.path} to={link.path} className="text-sm opacity-80 hover:opacity-100 transition-opacity">
                  {link.label}
                </Link>
              ))}
            </div>
          )}

          {showContact && (
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm opacity-80 mb-6">
              <a href={`tel:${contact?.phone ?? "8961775554"}`} className="flex items-center gap-1.5 hover:opacity-100">
                <Phone className="h-3.5 w-3.5" /> {contact?.phone_formatted ?? "8961 77 5554"}
              </a>
              <a href={`mailto:${contact?.email ?? "dr.d.dutta@gmail.com"}`} className="flex items-center gap-1.5 hover:opacity-100">
                <Mail className="h-3.5 w-3.5" /> {contact?.email ?? "dr.d.dutta@gmail.com"}
              </a>
            </div>
          )}

          {showSocial && socialLinks.length > 0 && (
            <div className="flex justify-center gap-4 mb-6">
              {socialLinks.map((s) => (
                <a key={s.label} href={s.url!} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors">
                  <s.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          )}

          <div className="pt-6 border-t border-primary-foreground/20 text-sm opacity-70">
            <p>{copyrightText}</p>
          </div>
        </div>
      </footer>
    );
  }

  // ── Minimal Layout ──
  if (layout === "minimal") {
    return (
      <footer className="bg-primary text-primary-foreground">
        <div className="container-narrow mx-auto section-padding">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-heading font-bold mb-2">{general?.clinic_name ?? "Smilz Dental Treatment Facility"}</h3>
              <p className="text-sm opacity-80 mb-4">{general?.tagline ?? "Bridging Gaps... Spreading Smiles!"}</p>
              {showSocial && socialLinks.length > 0 && (
                <div className="flex gap-3">
                  {socialLinks.map((s) => (
                    <a key={s.label} href={s.url!} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors">
                      <s.icon className="h-4 w-4" />
                    </a>
                  ))}
                </div>
              )}
            </div>
            <div className="md:text-right">
              {showContact && (
                <div className="space-y-2 text-sm opacity-80">
                  <p>{contact?.address_full ?? "21, Garia Park, Opposite Garia Park Club, Near Andrews College, Garia, Kolkata, West Bengal 700084"}</p>
                  <p>{contact?.phone_formatted ?? "8961 77 5554"} | {contact?.email ?? "dr.d.dutta@gmail.com"}</p>
                  <p>{hours?.days ?? "Monday – Saturday"}: {hours?.morning ?? "9 AM – 1 PM"} & {hours?.evening ?? "5 PM – 9 PM"}</p>
                </div>
              )}
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-primary-foreground/20 text-center text-sm opacity-70">
            <p>{copyrightText}</p>
          </div>
        </div>
      </footer>
    );
  }

  // ── Standard Layout (default 4-column) ──
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container-narrow mx-auto section-padding">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-10">
          {/* Clinic info */}
          <div>
            <h3 className="text-lg font-heading font-bold mb-4">{general?.clinic_name ?? "Smilz Dental Treatment Facility"}</h3>
            <p className="text-sm opacity-80 mb-4">{general?.tagline ?? "Bridging Gaps... Spreading Smiles!"}</p>
            <p className="text-sm opacity-80">
              {appearance?.footer_text || `Trusted dental care in South Kolkata since ${general?.year_established ?? 1999}. Comprehensive, affordable, and patient-centric dental treatments.`}
            </p>
            {showSocial && socialLinks.length > 0 && (
              <div className="flex gap-3 mt-4">
                {socialLinks.map((s) => (
                  <a key={s.label} href={s.url!} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors">
                    <s.icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Quick Links */}
          {showQuickLinks && (
            <div>
              <h3 className="text-lg font-heading font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                {quickLinks.map((link) => (
                  <li key={link.path}>
                    <Link to={link.path} className="opacity-80 hover:opacity-100 transition-opacity">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Services */}
          {showServices && (
            <div>
              <h3 className="text-lg font-heading font-bold mb-4">Our Services</h3>
              <ul className="space-y-2 text-sm">
                {(services ?? []).map((service) => (
                  <li key={service.slug}>
                    <Link to={servicePath(service.slug)} className="opacity-80 hover:opacity-100 transition-opacity">
                      {service.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Areas We Serve — collapsible internal link cluster for local SEO (CMS-managed) */}
          {(footer?.show_areas_we_serve ?? true) && (footer?.areas_we_serve?.length ?? 0) > 0 && (
            <div>
              <details className="group">
                <summary className="flex items-center justify-between cursor-pointer list-none mb-4">
                  <h3 className="text-lg font-heading font-bold">Areas We Serve</h3>
                  <span className="text-sm opacity-70 transition-transform group-open:rotate-180" aria-hidden="true">▾</span>
                </summary>
                <ul className="space-y-2 text-sm">
                  {(footer?.areas_we_serve ?? []).map((a, idx) => (
                    <li key={`${a.path}-${idx}`}>
                      <Link to={a.path} className="opacity-80 hover:opacity-100 transition-opacity">
                        {a.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </details>
            </div>
          )}

          {/* Contact */}
          {showContact && (
            <div>
              <h3 className="text-lg font-heading font-bold mb-4">Contact Us</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2 opacity-80">
                  <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>{contact?.address_full ?? "21, Garia Park, Opposite Garia Park Club, Near Andrews College, Garia, Kolkata, West Bengal 700084"}</span>
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
          )}
        </div>

        <div className="mt-12 pt-8 border-t border-primary-foreground/20 text-center text-sm opacity-70">
          <p>{copyrightText}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
