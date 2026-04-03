import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
  const queryClient = useQueryClient();
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
    staleTime: 0,
    gcTime: 1000 * 60 * 5,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    const id = Math.random().toString(36).slice(2, 8);
    const channel = supabase
      .channel(`page-content-${pageName}-${id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "page_content",
          filter: `page_name=eq.${pageName}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["page_content", pageName] });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [pageName, queryClient]);

  const getSection = (sectionId: string): PageSection | undefined =>
    query.data?.find((s) => s.section_id === sectionId);

  return { ...query, sections: query.data ?? [], getSection };
};
