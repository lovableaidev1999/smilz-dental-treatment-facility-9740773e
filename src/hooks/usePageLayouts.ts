import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { LayoutNode } from '@/types/visual-builder';

export interface PageLayoutRow {
  id: string;
  page_slug: string;
  page_title: string;
  layout_json: LayoutNode[];
  is_published: boolean;
  is_template: boolean;
  template_type: string | null;
  created_at: string;
  updated_at: string;
}

export const usePageLayouts = () =>
  useQuery({
    queryKey: ['page_layouts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('page_layouts')
        .select('*')
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return (data || []) as PageLayoutRow[];
    },
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });

export const usePageLayout = (pageSlug: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!pageSlug) return;

    const channel = supabase
      .channel(`page-layout-${pageSlug}-${Math.random().toString(36).slice(2, 8)}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'page_layouts',
          filter: `page_slug=eq.${pageSlug}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['page_layouts', pageSlug] });
          queryClient.invalidateQueries({ queryKey: ['page_layouts'] });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [pageSlug, queryClient]);

  return useQuery({
    queryKey: ['page_layouts', pageSlug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('page_layouts')
        .select('*')
        .eq('page_slug', pageSlug)
        .eq('is_published', true)
        .maybeSingle();
      if (error) throw error;
      return data as PageLayoutRow | null;
    },
    enabled: !!pageSlug,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });
};

export const usePageLayoutById = (id: string) =>
  useQuery({
    queryKey: ['page_layouts', 'id', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('page_layouts')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as PageLayoutRow;
    },
    enabled: !!id,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });

export const useSavePageLayout = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (layout: {
      id?: string;
      page_slug: string;
      page_title: string;
      layout_json: LayoutNode[];
      is_published?: boolean;
      is_template?: boolean;
      template_type?: string | null;
    }) => {
      const payload = {
        page_slug: layout.page_slug,
        page_title: layout.page_title,
        layout_json: layout.layout_json as any,
        is_published: layout.is_published ?? false,
        is_template: layout.is_template ?? false,
        template_type: layout.template_type ?? null,
        updated_at: new Date().toISOString(),
      };

      if (layout.id) {
        const { data, error } = await supabase
          .from('page_layouts')
          .update(payload)
          .eq('id', layout.id)
          .select()
          .maybeSingle();
        if (error) throw error;
        if (data) return data as PageLayoutRow;
        // Row not found (deleted or RLS mismatch) — fall through to insert as new
        console.warn('[useSavePageLayout] Update returned no row for id', layout.id, '— inserting new row');
      }
      {
        const { data, error } = await supabase
          .from('page_layouts')
          .insert(payload)
          .select()
          .single();
        if (error) throw error;
        return data as PageLayoutRow;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['page_layouts'] });
    },
  });
};

export const useDeletePageLayout = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('page_layouts').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['page_layouts'] });
    },
  });
};
