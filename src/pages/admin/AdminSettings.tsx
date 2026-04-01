import { useState, useEffect } from "react";
import { useSiteSettings, useUpdateSetting } from "@/hooks/useSiteSettings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Save } from "lucide-react";

const FONT_OPTIONS = [
  "Playfair Display", "Lora", "Merriweather", "Cormorant Garamond",
  "Inter", "Montserrat", "Poppins", "Open Sans",
  "Lato", "Raleway", "Outfit", "Roboto",
];

const AdminSettings = () => {
  const { data: settings, isLoading } = useSiteSettings();
  const updateSetting = useUpdateSetting();
  const { toast } = useToast();
  const [form, setForm] = useState<any>({});

  useEffect(() => {
    if (settings) setForm(JSON.parse(JSON.stringify(settings)));
  }, [settings]);

  if (isLoading || !form.general) return <div className="animate-pulse space-y-4"><div className="h-8 bg-secondary rounded w-1/3" /><div className="h-40 bg-secondary rounded" /></div>;

  const saveSection = async (key: string) => {
    try {
      await updateSetting.mutateAsync({ key, value: form[key] });
      toast({ title: "Saved!", description: `${key} settings updated.` });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const Field = ({ label, section, field, type = "text", textarea = false }: any) => {
    const value = form[section]?.[field] ?? "";
    const onChange = (val: string) => {
      setForm((p: any) => ({ ...p, [section]: { ...p[section], [field]: type === "number" ? Number(val) : val } }));
    };
    return (
      <div>
        <label className="text-sm font-medium text-foreground mb-1.5 block">{label}</label>
        {textarea ? (
          <Textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} />
        ) : (
          <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} />
        )}
      </div>
    );
  };

  const sections = [
    {
      key: "general", title: "General Information",
      fields: [
        { label: "Clinic Name", field: "clinic_name" },
        { label: "Tagline", field: "tagline" },
        { label: "Doctor Name", field: "doctor_name" },
        { label: "Year Established", field: "year_established", type: "number" },
        { label: "Google Rating", field: "google_rating", type: "number" },
        { label: "Review Count", field: "review_count", type: "number" },
      ],
    },
    {
      key: "contact", title: "Contact Information",
      fields: [
        { label: "Address", field: "address" },
        { label: "Full Address", field: "address_full" },
        { label: "Phone", field: "phone" },
        { label: "Phone Formatted", field: "phone_formatted" },
        { label: "Emergency Phone", field: "emergency" },
        { label: "Email", field: "email" },
        { label: "WhatsApp Number", field: "whatsapp" },
      ],
    },
    {
      key: "hours", title: "Business Hours",
      fields: [
        { label: "Days Open", field: "days" },
        { label: "Morning Hours", field: "morning" },
        { label: "Evening Hours", field: "evening" },
        { label: "Closed Day", field: "closed" },
      ],
    },
    {
      key: "links", title: "Links & Social",
      fields: [
        { label: "Website URL", field: "website" },
        { label: "Google Maps URL", field: "google_maps_url" },
        { label: "Facebook URL", field: "facebook" },
        { label: "Instagram URL", field: "instagram" },
        { label: "YouTube URL", field: "youtube" },
      ],
    },
    {
      key: "seo", title: "Default SEO",
      fields: [
        { label: "Default Page Title", field: "default_title" },
        { label: "Default Description", field: "default_description", textarea: true },
        { label: "Default Keywords", field: "default_keywords" },
      ],
    },
    {
      key: "appearance", title: "Appearance",
      fields: [
        { label: "Logo URL", field: "logo_url" },
        { label: "Default Banner Image URL", field: "default_banner_image" },
        { label: "Footer Text", field: "footer_text", textarea: true },
      ],
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-heading font-bold text-foreground mb-6">Site Settings</h1>

      <div className="space-y-6">
        {sections.map((sec) => (
          <Card key={sec.key}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{sec.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {sec.fields.map((f) => (
                <Field key={f.field} section={sec.key} {...f} />
              ))}
              {sec.key === "appearance" && (
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Font Family</label>
                  <select
                    value={form.appearance?.font_family ?? "Poppins"}
                    onChange={(e) => setForm((p: any) => ({ ...p, appearance: { ...p.appearance, font_family: e.target.value } }))}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <optgroup label="Serif">
                      {FONT_OPTIONS.slice(0, 4).map((f) => <option key={f} value={f}>{f}</option>)}
                    </optgroup>
                    <optgroup label="Sans-Serif">
                      {FONT_OPTIONS.slice(4, 8).map((f) => <option key={f} value={f}>{f}</option>)}
                    </optgroup>
                    <optgroup label="Modern">
                      {FONT_OPTIONS.slice(8).map((f) => <option key={f} value={f}>{f}</option>)}
                    </optgroup>
                  </select>
                </div>
              )}
              <Button onClick={() => saveSection(sec.key)} className="gap-2" disabled={updateSetting.isPending}>
                <Save className="h-4 w-4" /> Save {sec.title}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminSettings;
