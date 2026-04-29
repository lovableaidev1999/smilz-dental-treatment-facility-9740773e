import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react";
import ImageUrlInput from "@/components/admin/ImageUrlInput";
import { normalizeServiceSlug } from "@/lib/slugs";

const AdminServiceEdit = () => {
  const { id } = useParams<{ id: string }>();
  const isNew = id === "new";
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { toast } = useToast();

  const [form, setForm] = useState({
    title: "", slug: "", short_desc: "", description: "",
    icon: "", keywords: "", sort_order: 0, is_active: true,
    seo_title: "", seo_description: "", featured_image: "",
    is_featured: false,
    faqs: [] as Array<{ q: string; a: string }>,
  });

  const { data: service, isLoading } = useQuery({
    queryKey: ["admin_service", id],
    queryFn: async () => {
      if (isNew) return null;
      const { data, error } = await supabase.from("services").select("*").eq("id", id).single();
      if (error) throw error;
      return data;
    },
    enabled: !isNew,
  });

  useEffect(() => {
    if (service) {
      setForm({
        title: service.title ?? "",
        slug: service.slug ?? "",
        short_desc: service.short_desc ?? "",
        description: service.description ?? "",
        icon: service.icon ?? "",
        keywords: service.keywords ?? "",
        sort_order: service.sort_order ?? 0,
        is_active: service.is_active ?? true,
        seo_title: service.seo_title ?? "",
        seo_description: service.seo_description ?? "",
        featured_image: service.featured_image ?? "",
        is_featured: service.is_featured ?? false,
        faqs: Array.isArray(service.faqs) ? (service.faqs as any[]) : [],
      });
    }
  }, [service]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        ...form,
        slug: normalizeServiceSlug(form.slug || form.title),
        updated_at: new Date().toISOString(),
      };
      if (isNew) {
        const { error } = await supabase.from("services").insert(payload);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("services").update(payload).eq("id", id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin_services"] });
      qc.invalidateQueries({ queryKey: ["services"] });
      toast({ title: isNew ? "Service created!" : "Service updated!" });
      navigate("/admin/services");
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const autoSlug = () => {
    if (!form.slug) setForm((p) => ({ ...p, slug: normalizeServiceSlug(form.title) }));
  };

  const addFaq = () => setForm((p) => ({ ...p, faqs: [...p.faqs, { q: "", a: "" }] }));
  const removeFaq = (i: number) => setForm((p) => ({ ...p, faqs: p.faqs.filter((_, idx) => idx !== i) }));
  const updateFaq = (i: number, field: "q" | "a", val: string) => {
    setForm((p) => ({ ...p, faqs: p.faqs.map((f, idx) => idx === i ? { ...f, [field]: val } : f) }));
  };

  if (!isNew && isLoading) return <div className="animate-pulse"><div className="h-8 bg-secondary rounded w-1/3 mb-4" /><div className="h-96 bg-secondary rounded" /></div>;

  return (
    <div>
      <div className="flex items-center gap-4 mb-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin/services")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-heading font-bold text-foreground">
          {isNew ? "New Service" : "Edit Service Content & SEO"}
        </h1>
      </div>

      {!isNew && (
        <div className="mb-6 rounded-lg border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
          This editor manages the <span className="font-medium text-foreground">content and SEO</span> for this service
          (title, description, featured image, FAQs, meta tags).
          To change the <span className="font-medium text-foreground">page layout, sections or image placement</span>,
          go back to Services and click <span className="font-medium text-foreground">Edit Design</span>.
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle>Service Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Title</label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} onBlur={autoSlug} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Slug</label>
                <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: normalizeServiceSlug(e.target.value) })} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Short Description</label>
                <Textarea value={form.short_desc} onChange={(e) => setForm({ ...form, short_desc: e.target.value })} rows={2} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Full Description</label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={6} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Icon/Emoji</label>
                  <Input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Featured Image URL</label>
                  <ImageUrlInput value={form.featured_image} onChange={(url) => setForm({ ...form, featured_image: url })} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* FAQs */}
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>FAQs</CardTitle>
              <Button variant="outline" size="sm" onClick={addFaq} className="gap-1"><Plus className="h-3 w-3" /> Add FAQ</Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {form.faqs.map((faq, i) => (
                <div key={i} className="border border-border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">FAQ #{i + 1}</span>
                    <Button variant="ghost" size="icon" onClick={() => removeFaq(i)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                  <Input placeholder="Question" value={faq.q} onChange={(e) => updateFaq(i, "q", e.target.value)} />
                  <Textarea placeholder="Answer" value={faq.a} onChange={(e) => updateFaq(i, "a", e.target.value)} rows={2} />
                </div>
              ))}
              {form.faqs.length === 0 && <p className="text-sm text-muted-foreground">No FAQs added yet.</p>}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Publish</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="rounded" />
                <label className="text-sm">Active (visible on website)</label>
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} className="rounded" />
                <label className="text-sm">Featured</label>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Sort Order</label>
                <Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} />
              </div>
              <Button onClick={() => saveMutation.mutate()} className="w-full gap-2" disabled={saveMutation.isPending}>
                <Save className="h-4 w-4" /> {isNew ? "Create Service" : "Save & Publish"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>SEO Settings <span className="text-xs font-normal text-muted-foreground">(meta title, description, keywords)</span></CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">SEO Title</label>
                <Input value={form.seo_title} onChange={(e) => setForm({ ...form, seo_title: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">SEO Description</label>
                <Textarea value={form.seo_description} onChange={(e) => setForm({ ...form, seo_description: e.target.value })} rows={3} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Keywords</label>
                <Input value={form.keywords} onChange={(e) => setForm({ ...form, keywords: e.target.value })} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminServiceEdit;
