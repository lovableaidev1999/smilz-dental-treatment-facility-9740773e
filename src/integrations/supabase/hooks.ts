import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "./client";

const useLiveTableInvalidation = (table: string, queryKey: readonly unknown[]) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const id = Math.random().toString(36).slice(2, 8);
    const channel = supabase
      .channel(`${table}-live-${id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: queryKey as unknown[] });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryClient, table]);
};

export const useSiteContent = (category?: string) => {
  useLiveTableInvalidation("site_content", ["site_content", category]);

  return useQuery({
    queryKey: ["site_content", category],
    queryFn: async () => {
      let query = supabase.from("site_content").select("*");
      if (category) query = query.eq("category", category);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });
};

export const useServices = () => {
  useLiveTableInvalidation("services", ["services"]);

  return useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return data;
    },
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });
};

export const useService = (slug: string) => {
  useLiveTableInvalidation("services", ["services", slug]);

  return useQuery({
    queryKey: ["services", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });
};

export const useBlogPosts = (category?: string) => {
  useLiveTableInvalidation("blog_posts", ["blog_posts", category]);

  return useQuery({
    queryKey: ["blog_posts", category],
    queryFn: async () => {
      let query = supabase
        .from("blog_posts")
        .select("*")
        .eq("is_published", true)
        .order("published_at", { ascending: false });
      if (category) query = query.eq("category", category);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });
};

export const useBlogPost = (slug: string) => {
  useLiveTableInvalidation("blog_posts", ["blog_posts", slug]);

  return useQuery({
    queryKey: ["blog_posts", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });
};

export const useBlogPostById = (id: string, enabled = true) => {
  useLiveTableInvalidation("blog_posts", ["blog_posts", "id", id]);

  return useQuery({
    queryKey: ["blog_posts", "id", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("id", id);
      if (error) throw error;
      return data?.[0] ?? null;
    },
    enabled: !!id && enabled,
    retry: 3,
    retryDelay: 500,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    staleTime: 0,
  });
};

export const useGallery = () => {
  useLiveTableInvalidation("gallery", ["gallery"]);

  return useQuery({
    queryKey: ["gallery"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gallery")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return data;
    },
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });
};
