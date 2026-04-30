import { useState } from "react";
import { motion } from "framer-motion";
import { Send, UserPlus } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import PageHero from "@/components/PageHero";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { usePageContent } from "@/hooks/usePageContent";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const Referral = () => {
  const { toast } = useToast();
  const { data: settings } = useSiteSettings();
  const { getSection } = usePageContent("referral");
  const heroSection = getSection("hero");
  const contact = settings?.contact;
  const links = settings?.links;

  const [form, setForm] = useState({
    referrerName: "", referrerPhone: "", patientName: "", patientPhone: "", notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const msg = encodeURIComponent(
      `Referral Registration:\n\nReferred by: ${form.referrerName} (${form.referrerPhone})\nPatient: ${form.patientName} (${form.patientPhone})\nNotes: ${form.notes}`
    );
    window.open(`https://wa.me/${contact?.whatsapp ?? "918961775554"}?text=${msg}`, "_blank");
    toast({ title: "Redirecting to WhatsApp", description: "Your referral is ready to send." });
  };

  return (
    <>
      <SEOHead
        title="Referral Registration"
        description={`Refer a patient to ${settings?.general?.clinic_name ?? "Smilz Dental Treatment Facility"}.`}
        canonicalUrl={`${links?.website ?? "https://smilz.net"}/referral`}
        robots="noindex, nofollow"
      />

      <PageHero
        title={heroSection?.heading ?? "Smilz Referral"}
        subtitle={
          heroSection?.subheading ??
          `Refer a friend or family member to ${settings?.general?.clinic_name ?? "Smilz Dental Treatment Facility"}.`
        }
        imageUrl={heroSection?.image_url}
        breadcrumbs={[{ label: "Home", to: "/" }, { label: "Smilz Referral" }]}
        contact={contact}
        whatsappMessage="Hi, I'd like to refer someone to Smilz Dental."
        primaryCta={{
          label: "Start Referring",
          href: "https://referral.smilz.net/login",
          external: true,
        }}
      />

      <section className="section-padding">
        <div className="max-w-lg mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl p-8 shadow-card border border-border">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center"><UserPlus className="h-5 w-5 text-primary" /></div>
              <h2 className="text-xl font-heading font-bold text-foreground">Referral Form</h2>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="text-sm font-medium text-foreground mb-1.5 block">Your Name</label><Input required maxLength={100} value={form.referrerName} onChange={(e) => setForm({ ...form, referrerName: e.target.value })} placeholder="Your full name" /></div>
              <div><label className="text-sm font-medium text-foreground mb-1.5 block">Your Phone</label><Input type="tel" required maxLength={15} value={form.referrerPhone} onChange={(e) => setForm({ ...form, referrerPhone: e.target.value })} placeholder="+91 XXXXX XXXXX" /></div>
              <div><label className="text-sm font-medium text-foreground mb-1.5 block">Patient Name</label><Input required maxLength={100} value={form.patientName} onChange={(e) => setForm({ ...form, patientName: e.target.value })} placeholder="Patient's full name" /></div>
              <div><label className="text-sm font-medium text-foreground mb-1.5 block">Patient Phone</label><Input type="tel" required maxLength={15} value={form.patientPhone} onChange={(e) => setForm({ ...form, patientPhone: e.target.value })} placeholder="+91 XXXXX XXXXX" /></div>
              <div><label className="text-sm font-medium text-foreground mb-1.5 block">Additional Notes</label><Textarea maxLength={500} rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Any specific dental concern or notes..." /></div>
              <Button type="submit" className="w-full gap-2"><Send className="h-4 w-4" /> Submit Referral via WhatsApp</Button>
            </form>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default Referral;
