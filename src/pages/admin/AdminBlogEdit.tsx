import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, Upload, Loader2 } from "lucide-react";
import { useImageUpload } from "@/hooks/useImageUpload";

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
    title: "", slug: "", excerpt: "", content: "",
    category: "general", tags: [] as string[],
    featured_image: "", author: "Dr. Dibyendu Dutta",
    is_published: true, meta_title: "", meta_description: "",
    published_at: new Date().toISOString().split("T")[0],
  });
  const [tagsInput, setTagsInput] = useState("");

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
      setForm({
        title: post.title ?? "", slug: post.slug ?? "",
        excerpt: post.excerpt ?? "", content: post.content ?? "",
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
    }
  }, [post]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const tags = tagsInput.split(",").map((t) => t.trim()).filter(Boolean);
      const payload: any = {
        ...form,
        tags,
        slug: form.slug || form.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
        published_at: form.published_at ? new Date(form.published_at).toISOString() : null,
        updated_at: new Date().toISOString(),
      };
      if (isNew) {
        payload.created_at = new Date().toISOString();
        const { error } = await supabase.from("blog_posts").insert(payload);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("blog_posts").update(payload).eq("id", id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin_blog"] });
      qc.invalidateQueries({ queryKey: ["blog_posts"] });
      toast({ title: isNew ? "Post created!" : "Post updated!" });
      navigate("/admin/blog");
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const autoSlug = () => {
    if (!form.slug) setForm((p) => ({ ...p, slug: form.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") }));
  };

  if (!isNew && isLoading) return <div className="animate-pulse"><div className="h-8 bg-secondary rounded w-1/3 mb-4" /><div className="h-96 bg-secondary rounded" /></div>;

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin/blog")}><ArrowLeft className="h-5 w-5" /></Button>
        <h1 className="text-2xl font-heading font-bold text-foreground">{isNew ? "New Blog Post" : "Edit Blog Post"}</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle>Post Content</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Title</label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} onBlur={autoSlug} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Slug</label>
                <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Excerpt</label>
                <Textarea value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} rows={3} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Content (HTML)</label>
                <Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={15} className="font-mono text-xs" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Publish</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <input type="checkbox" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} className="rounded" />
                <label className="text-sm">Published</label>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Publish Date</label>
                <Input type="date" value={form.published_at} onChange={(e) => setForm({ ...form, published_at: e.target.value })} />
              </div>
              <Button onClick={() => saveMutation.mutate()} className="w-full gap-2" disabled={saveMutation.isPending}>
                <Save className="h-4 w-4" /> {isNew ? "Create Post" : "Save & Publish"}
              </Button>
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
                <label className="text-sm font-medium mb-1.5 block">Featured Image URL</label>
                <Input value={form.featured_image} onChange={(e) => setForm({ ...form, featured_image: e.target.value })} />
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
