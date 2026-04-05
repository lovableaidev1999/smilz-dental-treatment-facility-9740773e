import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, Upload, Loader2, Eye, Code, FileText, Trash2, LayoutGrid, Wand2, ExternalLink } from "lucide-react";
import ImageUrlInput from "@/components/admin/ImageUrlInput";
import { useImageUpload } from "@/hooks/useImageUpload";
import TipTapEditor from "@/components/editor/TipTapEditor";
import BlockRenderer from "@/components/BlockRenderer";
import type { JSONContent } from "@tiptap/core";
import type { LayoutNode, BlockType } from "@/types/visual-builder";
import { wrapLegacyContent, convertHtmlToVisualLayout } from "@/lib/legacyMigration";
import {
  createVisualLayoutFallbackContent,
  getStoredVisualLayout,
  isMissingVisualLayoutColumnError,
  isVisualLayoutFallbackContent,
} from "@/lib/visualLayoutStorage";
import { BuilderProvider, useBuilder } from "@/hooks/useBuilderState";
import BuilderCanvas from "@/components/builder/BuilderCanvas";
import BlockPalette from "@/components/builder/BlockPalette";
import PropertiesPanel from "@/components/builder/PropertiesPanel";
import VisualRenderer from "@/components/builder/VisualRenderer";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import { getBlockDefinition, getBlockIcon } from '@/components/builder/block-registry';

// ─── Inner blog builder with DnD ────────────────────────
const BlogBuilderInner = ({ title, postId, onBack, onSave, isSaving }: {
  title: string;
  postId?: string;
  onBack: (layout: LayoutNode[]) => void;
  onSave: (layout: LayoutNode[], asDraft: boolean) => void;
  isSaving: boolean;
}) => {
  const { state, dispatch, addBlock } = useBuilder();
  const [activeDragType, setActiveDragType] = useState<BlockType | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const data = event.active.data.current;
    if (data?.fromPalette) setActiveDragType(data.blockType);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragType(null);
    const { active, over } = event;
    if (!over) return;
    const activeData = active.data.current;
    const overData = over.data.current;
    if (activeData?.fromPalette) {
      const blockType = activeData.blockType as BlockType;
      let targetParentId: string | null = null;
      if (overData?.containerId !== undefined) targetParentId = overData.containerId;
      else if (overData?.parentId !== undefined) targetParentId = overData.parentId;
      addBlock(blockType, targetParentId);
      return;
    }
    if (activeData?.blockId && !activeData.fromPalette) {
      const activeId = activeData.blockId;
      const overId = over.id as string;
      if (activeId === overId) return;
      const overContainerId = overData?.containerId ?? overData?.parentId ?? null;
      dispatch({
        type: 'MOVE_BLOCK',
        payload: { blockId: activeId, targetParentId: overContainerId, targetIndex: 0 },
      });
    }
  };

  const activeDef = activeDragType ? getBlockDefinition(activeDragType) : null;
  const DragIcon = activeDef ? getBlockIcon(activeDef) : null;

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="fixed inset-0 z-50 bg-background flex flex-col">
        <div className="flex items-center gap-3 px-4 py-2 border-b border-border bg-card">
          <Button variant="ghost" size="sm" onClick={() => onBack(state.layout)} className="gap-1">
            <ArrowLeft className="h-4 w-4" /> Back to Editor
          </Button>
          <span className="text-sm font-medium text-foreground">Visual Builder — {title || 'Untitled'}</span>
          <div className="ml-auto flex gap-2">
            {postId && (
              <Button variant="secondary" size="sm" onClick={() => window.open(`/preview/blog/${postId}?t=${Date.now()}`, 'blog-preview')} className="gap-1">
                <ExternalLink className="h-4 w-4" /> View
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => onSave(state.layout, true)} disabled={isSaving}>
              <FileText className="h-4 w-4 mr-1" /> Save Draft
            </Button>
            <Button size="sm" onClick={() => onSave(state.layout, false)} disabled={isSaving}>
              <Save className="h-4 w-4 mr-1" /> Publish
            </Button>
          </div>
        </div>
        <div className="flex flex-1 overflow-hidden">
          <div className="w-56 border-r border-border overflow-y-auto bg-card">
            <BlockPalette />
          </div>
          <div className="flex-1 overflow-auto bg-muted/30">
            <BuilderCanvas />
          </div>
          <div className="w-72 border-l border-border overflow-y-auto bg-card">
            <PropertiesPanel />
          </div>
        </div>
      </div>
      <DragOverlay>
        {activeDragType && DragIcon && (
          <div className="flex items-center gap-2 bg-card border border-border shadow-lg rounded-lg px-3 py-2 text-sm">
            <DragIcon className="h-4 w-4" />
            <span>{getBlockDefinition(activeDragType)?.label}</span>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
};

const CATEGORIES = [
  "oral-hygiene", "procedures", "general-health", "guides", "awareness",
  "dental-implant", "braces", "orthodontics", "rct", "caries",
  "veneers-and-crowns", "aligners", "emergency", "wisdom-tooth", "general",
];

const AdminBlogEdit = () => {
  const { id } = useParams<{ id: string }>();
  const isNew = id === "new";
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { toast } = useToast();

  const [form, setForm] = useState({
    title: "", slug: "", excerpt: "",
    category: "general", tags: [] as string[],
    featured_image: "", author: "Dr. Dibyendu Dutta",
    is_published: true, meta_title: "", meta_description: "",
    published_at: new Date().toISOString().split("T")[0],
  });
  const [contentJson, setContentJson] = useState<JSONContent | null>(null);
  const [legacyHtml, setLegacyHtml] = useState("");
  const [visualLayout, setVisualLayout] = useState<LayoutNode[] | null>(null);
  const [editorMode, setEditorMode] = useState<"blocks" | "html" | "visual" | "preview">("blocks");
  const [tagsInput, setTagsInput] = useState("");
  const imgRef = useRef<HTMLInputElement>(null);
  const { compress, isCompressing } = useImageUpload();

  const handleFeaturedUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { file: compressed } = await compress(file);
      const path = `blog/${Date.now()}-${compressed.name}`;
      const { error } = await supabase.storage.from("media").upload(path, compressed, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from("media").getPublicUrl(path);
      setForm((p) => ({ ...p, featured_image: data.publicUrl }));
      toast({ title: "Featured image uploaded & compressed!" });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    }
    e.target.value = "";
  };

  const { data: post, isLoading } = useQuery({
    queryKey: ["admin_blog_post", id],
    queryFn: async () => {
      if (isNew) return null;
      const { data, error } = await supabase.from("blog_posts").select("*").eq("id", id).single();
      if (error) throw error;
      return data;
    },
    enabled: !isNew,
  });

  useEffect(() => {
    if (post) {
      const storedVisualLayout = getStoredVisualLayout(post as any);
      const hasStoredVisualLayout = !!storedVisualLayout?.length;
      const usesVisualFallback = isVisualLayoutFallbackContent(post.content_json);

      setForm({
        title: post.title ?? "", slug: post.slug ?? "",
        excerpt: post.excerpt ?? "",
        category: post.category ?? "general",
        tags: Array.isArray(post.tags) ? post.tags : [],
        featured_image: post.featured_image ?? "",
        author: post.author ?? "Dr. Dibyendu Dutta",
        is_published: post.is_published ?? true,
        meta_title: post.meta_title ?? "",
        meta_description: post.meta_description ?? "",
        published_at: post.published_at ? post.published_at.split("T")[0] : "",
      });
      setTagsInput(Array.isArray(post.tags) ? post.tags.join(", ") : "");

      if (hasStoredVisualLayout) {
        setVisualLayout(storedVisualLayout);
      }

      if (usesVisualFallback) {
        setContentJson(null);
        setLegacyHtml(post.content ?? "");
        setEditorMode("visual");
        return;
      }

      if (post.content_json) {
        setContentJson(post.content_json as JSONContent);
        if (hasStoredVisualLayout) {
          setEditorMode("visual");
        } else {
          setEditorMode("blocks");
        }
      } else if (post.content) {
        setLegacyHtml(post.content);
        if (!hasStoredVisualLayout) {
          setVisualLayout(wrapLegacyContent(post.content));
        }
        if (hasStoredVisualLayout) {
          setEditorMode("visual");
        } else {
          setEditorMode("html");
        }
      } else if (hasStoredVisualLayout) {
        setLegacyHtml(post.content ?? "");
        setEditorMode("visual");
      }
    }
  }, [post]);

  const saveMutation = useMutation({
    mutationFn: async ({ asDraft, visualLayoutJson }: { asDraft?: boolean; visualLayoutJson?: LayoutNode[] }) => {
      const tags = tagsInput.split(",").map((t) => t.trim()).filter(Boolean);
      const isPublished = asDraft === true ? false : true;
      const layoutToSave = visualLayoutJson || visualLayout;
      // When publishing, always use current timestamp so post appears as latest
      const publishedAt = isPublished
        ? new Date().toISOString()
        : (form.published_at ? new Date(form.published_at).toISOString() : null);
      const payload: any = {
        ...form,
        is_published: isPublished,
        tags,
        slug: form.slug || form.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
        published_at: publishedAt,
        updated_at: new Date().toISOString(),
        content_json: contentJson,
        content: legacyHtml || "",
      };
      if (layoutToSave && layoutToSave.length > 0) {
        payload.visual_layout_json = layoutToSave;
      }

      const persistPost = async (data: any) => {
        if (isNew) {
          const { error } = await supabase
            .from("blog_posts")
            .insert({ ...data, created_at: new Date().toISOString() });
          return error;
        }

        const { error } = await supabase.from("blog_posts").update(data).eq("id", id);
        return error;
      };

      let error = await persistPost(payload);

      if (error && layoutToSave && layoutToSave.length > 0 && isMissingVisualLayoutColumnError(error)) {
        const fallbackPayload = {
          ...payload,
          content_json: createVisualLayoutFallbackContent(layoutToSave),
        };

        delete fallbackPayload.visual_layout_json;
        error = await persistPost(fallbackPayload);
      }

      if (error) throw error;

      return asDraft;
    },
    onSuccess: (asDraft) => {
      qc.invalidateQueries({ queryKey: ["admin_blog"] });
      qc.invalidateQueries({ queryKey: ["blog_posts"] });
      toast({ title: asDraft ? "Saved as draft!" : (isNew ? "Post created!" : "Post updated!") });
      navigate("/admin/blog");
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (isNew) return;
      const { error } = await supabase.from("blog_posts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin_blog"] });
      toast({ title: "Post deleted" });
      navigate("/admin/blog");
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const autoSlug = () => {
    if (!form.slug) setForm((p) => ({ ...p, slug: form.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") }));
  };

  if (!isNew && isLoading) return <div className="animate-pulse"><div className="h-8 bg-secondary rounded w-1/3 mb-4" /><div className="h-96 bg-secondary rounded" /></div>;

  // Visual builder mode renders full-screen
  if (editorMode === "visual") {
    return (
      <BuilderProvider initialLayout={visualLayout || []}>
        <BlogBuilderInner
          title={form.title}
          postId={isNew ? undefined : id}
          onBack={(layout) => {
            setVisualLayout(layout);
            setEditorMode("blocks");
          }}
          onSave={(layout, asDraft) => {
            setVisualLayout(layout);
            saveMutation.mutate({ asDraft, visualLayoutJson: layout });
          }}
          isSaving={saveMutation.isPending}
        />
      </BuilderProvider>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin/blog")}><ArrowLeft className="h-5 w-5" /></Button>
        <h1 className="text-2xl font-heading font-bold text-foreground">{isNew ? "New Blog Post" : "Edit Blog Post"}</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Title & Slug */}
          <Card>
            <CardHeader><CardTitle>Post Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Title</label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} onBlur={autoSlug} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">URL Slug <span className="text-destructive">*</span></label>
                <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-") })} placeholder="e.g. best-dental-implants-kolkata" className="font-mono text-sm" />
                {form.slug && (
                  <p className="text-xs text-muted-foreground mt-1.5 font-mono bg-secondary px-2 py-1 rounded">
                    smilz.net/blog/<span className="text-primary font-semibold">{form.slug}</span>
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Excerpt</label>
                <Textarea value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} rows={3} />
              </div>
            </CardContent>
          </Card>

          {/* Content Editor */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Content</CardTitle>
                <div className="flex gap-1 bg-secondary rounded-lg p-0.5">
                  <button
                    onClick={() => setEditorMode("blocks")}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${editorMode === "blocks" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    Blocks
                  </button>
                  <button
                    onClick={() => {
                      // Auto-generate visual layout from legacy content if none exists
                      if (!visualLayout || visualLayout.length === 0) {
                        if (legacyHtml) {
                          setVisualLayout(wrapLegacyContent(legacyHtml));
                        } else {
                          // Empty layout — user starts fresh
                          setVisualLayout([]);
                        }
                      }
                      setEditorMode("visual");
                    }}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1 ${(editorMode as string) === "visual" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    <LayoutGrid className="h-3 w-3" /> Visual Builder
                  </button>
                  <button
                    onClick={() => setEditorMode("html")}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1 ${editorMode === "html" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    <Code className="h-3 w-3" /> HTML
                  </button>
                  <button
                    onClick={() => setEditorMode("preview")}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1 ${editorMode === "preview" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    <Eye className="h-3 w-3" /> Preview
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {editorMode === "blocks" && (
                <TipTapEditor
                  content={contentJson}
                  onChange={setContentJson}
                  placeholder="Start writing your blog post… Use the toolbar to add headings, images, CTAs, and FAQs."
                />
              )}
              {editorMode === "html" && (
                <div className="space-y-3">
                  <Textarea
                    value={legacyHtml}
                    onChange={(e) => setLegacyHtml(e.target.value)}
                    rows={15}
                    className="font-mono text-xs"
                    placeholder="Legacy HTML content…"
                  />
                  {legacyHtml && (
                    <Button
                      variant="outline"
                      className="gap-2"
                      onClick={() => {
                        const layout = convertHtmlToVisualLayout(legacyHtml);
                        setVisualLayout(layout);
                        setEditorMode("visual");
                        toast({ title: "Converted!", description: `Legacy HTML split into ${layout[0]?.children?.[0]?.children?.length || 0} structured blocks.` });
                      }}
                    >
                      <Wand2 className="h-4 w-4" /> Convert to Visual Layout
                    </Button>
                  )}
                </div>
              )}
              {editorMode === "preview" && contentJson && (
                <div className="border border-border rounded-lg p-6 bg-background min-h-[400px]">
                  <BlockRenderer content={contentJson} />
                </div>
              )}
              {editorMode === "preview" && visualLayout && visualLayout.length > 0 && (
                <div className="border border-border rounded-lg p-6 bg-background min-h-[400px]">
                  <VisualRenderer layout={visualLayout} />
                </div>
              )}
              {editorMode === "preview" && !contentJson && !visualLayout?.length && legacyHtml && (
                <div
                  className="prose prose-sm max-w-none p-6 border border-border rounded-lg min-h-[400px]"
                  dangerouslySetInnerHTML={{ __html: legacyHtml }}
                />
              )}
              {editorMode === "preview" && !contentJson && !visualLayout?.length && !legacyHtml && (
                <div className="text-center text-muted-foreground py-20">No content yet. Switch to Blocks, Visual Builder, or HTML mode to add content.</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Publish</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Publish Date</label>
                <Input type="date" value={form.published_at} onChange={(e) => setForm({ ...form, published_at: e.target.value })} />
              </div>
              <Button onClick={() => saveMutation.mutate({ asDraft: false })} className="w-full gap-2" disabled={saveMutation.isPending}>
                <Save className="h-4 w-4" /> {isNew ? "Create & Publish" : "Save & Publish"}
              </Button>
              <Button variant="outline" onClick={() => saveMutation.mutate({ asDraft: true })} className="w-full gap-2" disabled={saveMutation.isPending}>
                <FileText className="h-4 w-4" /> Save as Draft
              </Button>
              {!isNew && id && (
                <Button variant="secondary" className="w-full gap-2" onClick={() => window.open(`/preview/blog/${id}?t=${Date.now()}`, 'blog-preview')}>
                  <ExternalLink className="h-4 w-4" /> View Post
                </Button>
              )}
              {!isNew && (
                <Button variant="destructive" onClick={() => { if (confirm("Delete this post permanently?")) deleteMutation.mutate(); }} className="w-full gap-2" disabled={deleteMutation.isPending}>
                  <Trash2 className="h-4 w-4" /> Delete Post
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Category</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase())}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Tags (comma separated)</label>
                <Input value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} placeholder="dental, health, tips" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Author</label>
                <Input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Featured Image</label>
                <div className="flex gap-2">
                  <ImageUrlInput value={form.featured_image} onChange={(url) => setForm({ ...form, featured_image: url })} placeholder="URL or pick from media" />
                </div>
                {form.featured_image && <img src={form.featured_image} alt="Preview" className="mt-2 rounded-md max-h-32 object-cover" />}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>SEO</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Meta Title</label>
                <Input value={form.meta_title} onChange={(e) => setForm({ ...form, meta_title: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Meta Description</label>
                <Textarea value={form.meta_description} onChange={(e) => setForm({ ...form, meta_description: e.target.value })} rows={3} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminBlogEdit;
