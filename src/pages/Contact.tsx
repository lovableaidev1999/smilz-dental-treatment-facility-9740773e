import { useState } from "react";
import { motion } from "framer-motion";
import { Phone, MessageCircle, Mail, MapPin, Clock, Send } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { usePageContent } from "@/hooks/usePageContent";
import { GenericSection } from "@/components/DynamicSections";
import StickyCtaBar from "@/components/StickyCtaBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import type { PageSection } from "@/hooks/usePageContent";

const Contact = () => {
  const { toast } = useToast();
  const { data: settings } = useSiteSettings();
  const { sections } = usePageContent("contact");
  const [form, setForm] = useState({ name: "", email: "", mobile: "", message: "" });

  const contact = settings?.contact;
  const hours = settings?.hours;
  const links = settings?.links;
  const coordinates = settings?.coordinates;
  const KNOWN_IDS = ["hero"];

  let dynamicIndex = 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const msg = encodeURIComponent(
      `Hi, my name is ${form.name}. ${form.message}\n\nEmail: ${form.email}\nMobile: ${form.mobile}`
    );
    window.open(`https://wa.me/${contact?.whatsapp ?? "918961775554"}?text=${msg}`, "_blank");
    toast({ title: "Redirecting to WhatsApp", description: "Your message is ready to send." });
  };

  const renderSection = (section: PageSection) => {
    switch (section.section_id) {
      case "hero":
        return (
          <section key={section.id} className="bg-gradient-primary text-primary-foreground section-padding">
            <div className="container-narrow mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">{section.heading ?? "Contact Us"}</h1>
              <p className="text-primary-foreground/85 max-w-xl mx-auto">{section.subheading ?? "We'd love to hear from you. Book an appointment or reach out with any questions."}</p>
            </div>
          </section>
        );

      default: {
        const imageFirst = dynamicIndex % 2 === 0;
        dynamicIndex++;
        return <GenericSection key={section.id} section={section} imageFirst={imageFirst} />;
      }
    }
  };

  return (
    <>
      <StickyCtaBar />
      <SEOHead
        title="Contact Dentist in Kolkata | Smilz"
        description={`Contact ${settings?.general?.clinic_name ?? "Smilz Dental Clinic"} at Garia Park, Kolkata 700084. Call ${contact?.phone_formatted ?? "8961 77 5554"} or WhatsApp to book your dental appointment today!`}
        keywords="dental clinic near Garia Park, dentist contact Kolkata"
        canonicalUrl={`${links?.website ?? "https://smilz.net"}/contact`}
        breadcrumbs={[
          { name: "Home", url: links?.website ?? "https://smilz.net" },
          { name: "Contact", url: `${links?.website ?? "https://smilz.net"}/contact` },
        ]}
      />

      {sections.map(renderSection)}

      <section className="section-padding">
        <div className="container-narrow mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
              <h2 className="text-2xl font-heading font-bold text-foreground mb-6">Get In Touch</h2>
              <div className="space-y-5 mb-8">
                {[
                  { icon: MapPin, label: "Address", value: contact?.address_full ?? "21, Garia Park, Opposite Garia Park Club, Near Andrews College, Garia, Kolkata, West Bengal 700084" },
                  { icon: Phone, label: "Phone", value: contact?.phone_formatted ?? "8961 77 5554", href: `tel:${contact?.phone ?? "8961775554"}` },
                  { icon: Phone, label: "Emergency", value: contact?.emergency ?? "9831070248", href: `tel:${contact?.emergency ?? "9831070248"}` },
                  { icon: Mail, label: "Email", value: contact?.email ?? "dr.d.dutta@gmail.com", href: `mailto:${contact?.email ?? "dr.d.dutta@gmail.com"}` },
                  { icon: MessageCircle, label: "WhatsApp", value: "Click to chat", href: `https://wa.me/${contact?.whatsapp ?? "918961775554"}` },
                ].map(({ icon: Icon, label, value, href }) => (
                  <div key={label} className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-secondary flex items-center justify-center"><Icon className="h-5 w-5 text-primary" /></div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{label}</p>
                      {href ? (
                        <a href={href} target={href.startsWith("https") ? "_blank" : undefined} rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-primary transition-colors">{value}</a>
                      ) : (
                        <p className="text-sm text-muted-foreground">{value}</p>
                      )}
                    </div>
                  </div>
                ))}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-secondary flex items-center justify-center"><Clock className="h-5 w-5 text-primary" /></div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Clinic Hours</p>
                    <p className="text-sm text-muted-foreground">{hours?.days ?? "Monday – Saturday"}</p>
                    <p className="text-sm text-muted-foreground">Morning: {hours?.morning ?? "9:00 AM – 1:00 PM"}</p>
                    <p className="text-sm text-muted-foreground">Evening: {hours?.evening ?? "5:00 PM – 9:00 PM"}</p>
                    <p className="text-sm text-accent font-medium">{hours?.closed ?? "Sunday"}: Closed</p>
                  </div>
                </div>
              </div>
              <div className="rounded-xl overflow-hidden shadow-card aspect-video">
                <iframe
                  src={`https://www.google.com/maps?q=Smilz+Dental+Treatment+Facility,+21+Garia+Park,+Kolkata+700084&z=16&output=embed`}
                  width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade" title="Smilz Dental location on Google Maps"
                />
              </div>
              <a
                href="https://www.google.com/maps/search/?api=1&query=Smilz+Dental+Treatment+Facility,+21+Garia+Park,+Kolkata+700084"
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-3 text-sm font-medium text-primary hover:underline"
              >
                <MapPin className="h-4 w-4" /> View in Google Maps
              </a>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
              <div className="bg-card rounded-2xl p-8 shadow-card border border-border">
                <h2 className="text-2xl font-heading font-bold text-foreground mb-2">Send a Message</h2>
                <p className="text-sm text-muted-foreground mb-6">Fill the form below and we'll get back to you via WhatsApp.</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div><label className="text-sm font-medium text-foreground mb-1.5 block">Name</label><Input required maxLength={100} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your full name" /></div>
                  <div><label className="text-sm font-medium text-foreground mb-1.5 block">Email</label><Input type="email" required maxLength={255} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="your@email.com" /></div>
                  <div><label className="text-sm font-medium text-foreground mb-1.5 block">Mobile</label><Input type="tel" required maxLength={15} value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} placeholder="+91 XXXXX XXXXX" /></div>
                  <div><label className="text-sm font-medium text-foreground mb-1.5 block">Message</label><Textarea required maxLength={1000} rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Tell us about your dental concern..." /></div>
                  <Button type="submit" className="w-full gap-2"><Send className="h-4 w-4" /> Send via WhatsApp</Button>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Contact;
