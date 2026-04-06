import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SiteSettings {
  general: {
    clinic_name: string;
    tagline: string;
    doctor_name: string;
    year_established: number;
    google_rating: number;
    review_count: number;
  };
  contact: {
    address: string;
    address_full: string;
    phone: string;
    phone_formatted: string;
    emergency: string;
    email: string;
    whatsapp: string;
  };
  hours: {
    morning: string;
    evening: string;
    days: string;
    closed: string;
  };
  links: {
    website: string;
    google_maps_url: string;
    facebook: string;
    instagram: string;
    youtube: string;
  };
  seo: {
    default_title: string;
    default_description: string;
    default_keywords: string;
  };
  appearance: {
    font_family: string;
    logo_url: string;
    default_banner_image: string;
    footer_text: string;
  };
  header: {
    show_top_bar: boolean;
    nav_links: { label: string; path: string }[];
    cta_text: string;
    cta_message: string;
    logo_max_height: number;
  };
  footer: {
    show_quick_links: boolean;
    show_services: boolean;
    show_contact: boolean;
    quick_links: { label: string; path: string }[];
    custom_copyright: string;
    layout: "standard" | "minimal" | "centered";
    show_social_icons: boolean;
  };
  coordinates: {
    lat: number;
    lng: number;
  };
}

const DEFAULT_SETTINGS: SiteSettings = {
  general: { clinic_name: "Smilz Dental Treatment Facility", tagline: "Bridging Gaps... Spreading Smiles!", doctor_name: "Dr. Dibyendu Dutta", year_established: 1999, google_rating: 4.8, review_count: 44 },
  contact: { address: "21, Garia Park, Kolkata 700084", address_full: "Smilz Dental Treatment Facility, 21, Garia Park Opposite Garia Park Club Near, Andrews College, Garia, Kolkata, West Bengal 700084", phone: "8961775554", phone_formatted: "8961 77 5554", emergency: "9831070248", email: "dr.d.dutta@gmail.com", whatsapp: "918961775554" },
  hours: { morning: "9:00 AM – 1:00 PM", evening: "5:00 PM – 9:00 PM", days: "Monday – Saturday", closed: "Sunday" },
  links: { website: "https://smilz.net", google_maps_url: "https://www.google.com/maps/search/?api=1&query=22.46966133744312,88.37928013838973", facebook: "", instagram: "", youtube: "" },
  seo: { default_title: "Best Dental Clinic in Garia, South Kolkata", default_description: "Smilz Dental Treatment Facility - Trusted dental clinic in Garia Park, Kolkata since 1999.", default_keywords: "dental clinic Garia Kolkata, dentist South Kolkata" },
  appearance: { font_family: "Poppins", logo_url: "", default_banner_image: "", footer_text: "" },
  header: {
    show_top_bar: true,
    nav_links: [
      { label: "Home", path: "/" },
      { label: "Services", path: "/services" },
      { label: "About Us", path: "/about" },
      { label: "Gallery", path: "/gallery" },
      { label: "Insights", path: "/blog" },
      { label: "Contact", path: "/contact" },
    ],
    cta_text: "Book Appointment",
    cta_message: "Hi, I would like to book an appointment.",
    logo_max_height: 48,
  },
  footer: {
    show_quick_links: true,
    show_services: true,
    show_contact: true,
    quick_links: [
      { label: "Home", path: "/" },
      { label: "About Us", path: "/about" },
      { label: "Services", path: "/services" },
      { label: "Gallery", path: "/gallery" },
      { label: "Blog", path: "/blog" },
      { label: "Contact", path: "/contact" },
      { label: "Referral Registration", path: "/referral" },
    ],
    custom_copyright: "",
    layout: "standard",
    show_social_icons: true,
  },
  coordinates: { lat: 22.46966133744312, lng: 88.37928013838973 },
};

export const useSiteSettings = () => {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["site_settings"],
    queryFn: async (): Promise<SiteSettings> => {
      const { data, error } = await supabase.from("site_settings").select("*");
      if (error) {
        console.warn("site_settings table not found, using defaults", error.message);
        return DEFAULT_SETTINGS;
      }
      if (!data || data.length === 0) return DEFAULT_SETTINGS;

      const settings = { ...DEFAULT_SETTINGS };
      for (const row of data) {
        if (row.key in settings) {
          (settings as any)[row.key] = { ...(settings as any)[row.key], ...row.value };
        }
      }
      return settings;
    },
    gcTime: 1000 * 60 * 10,
  });

  useEffect(() => {
    const id = Math.random().toString(36).slice(2, 8);
    const channel = supabase
      .channel(`site-settings-live-${id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "site_settings",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["site_settings"] });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
};

export const useUpdateSetting = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: any }) => {
      const { error } = await supabase
        .from("site_settings")
        .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["site_settings"] }),
  });
};

export { DEFAULT_SETTINGS };
