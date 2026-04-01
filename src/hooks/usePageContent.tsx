import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PageSection {
  id: string;
  page_name: string;
  section_id: string;
  section_title: string | null;
  heading: string | null;
  subheading: string | null;
  body_text: string | null;
  image_url: string | null;
  button_text: string | null;
  button_link: string | null;
  sort_order: number;
  is_active: boolean;
  seo_title?: string | null;
  seo_description?: string | null;
  seo_keywords?: string | null;
}

export const usePageContent = (pageName: string) => {
  const query = useQuery({
    queryKey: ["page_content", pageName],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("page_content")
        .select("*")
        .eq("page_name", pageName)
        .eq("is_active", true)
        .order("sort_order");
      if (error) {
        console.warn("page_content not available:", error.message);
        return [] as PageSection[];
      }
      return data as PageSection[];
    },
    staleTime: 1000 * 60 * 2,
  });

  const getSection = (sectionId: string): PageSection | undefined =>
    query.data?.find((s) => s.section_id === sectionId);

  return { ...query, getSection };
};
