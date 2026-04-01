import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Save, Eye, EyeOff, ChevronDown, ChevronRight } from "lucide-react";

const PAGES = ["home", "about", "contact", "services", "gallery", "blog"];

const AdminPages = () => {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [activePage, setActivePage] = useState("home");
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [form, setForm] = useState<any>({});

  const { data: sections, isLoading } = useQuery({
    queryKey: ["admin_page_content", activePage],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("page_content")
        .select("*")
        .eq("page_name", activePage)
        .order("sort_order");
      if (error) {
        console.warn("page_content not available:", error.message);
        return [];
      }
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (section: any) => {
      const { error } = await supabase
        .from("page_content")
        .upsert({
          ...section,
          updated_at: new Date().toISOString(),
        }, { onConflict: "page_name,section_id" });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin_page_content"] });
      toast({ title: "Section saved!" });
      setEditingSection(null);
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("page_content").update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin_page_content"] }),
  });

  const startEditing = (section: any) => {
    setEditingSection(section.id);
    setForm({ ...section });
  };

  return (
    <div>
      <h1 className="text-2xl font-heading font-bold text-foreground mb-6">Page Sections</h1>

      {/* Page tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {PAGES.map((page) => (
          <button
            key={page}
            onClick={() => { setActivePage(page); setEditingSection(null); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
              activePage === page ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-primary/10"
            }`}
          >
            {page}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-secondary rounded-lg animate-pulse" />)}</div>
      ) : (sections ?? []).length === 0 ? (
        <p className="text-muted-foreground text-center py-12">
          No sections found for this page. Run the DATABASE_SETUP.sql to seed page content.
        </p>
      ) : (
        <div className="space-y-3">
          {(sections ?? []).map((section) => (
            <Card key={section.id} className={!section.is_active ? "opacity-50" : ""}>
              <CardContent className="p-0">
                {editingSection === section.id ? (
                  <div className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-1.5 block">Section Title</label>
                        <Input value={form.section_title ?? ""} onChange={(e) => setForm({ ...form, section_title: e.target.value })} />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1.5 block">Section ID</label>
                        <Input value={form.section_id ?? ""} disabled className="opacity-60" />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Heading</label>
                      <Input value={form.heading ?? ""} onChange={(e) => setForm({ ...form, heading: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Subheading</label>
                      <Input value={form.subheading ?? ""} onChange={(e) => setForm({ ...form, subheading: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Body Text</label>
                      <Textarea value={form.body_text ?? ""} onChange={(e) => setForm({ ...form, body_text: e.target.value })} rows={4} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-1.5 block">Image URL</label>
                        <Input value={form.image_url ?? ""} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1.5 block">Sort Order</label>
                        <Input type="number" value={form.sort_order ?? 0} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-1.5 block">Button Text</label>
                        <Input value={form.button_text ?? ""} onChange={(e) => setForm({ ...form, button_text: e.target.value })} />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1.5 block">Button Link</label>
                        <Input value={form.button_link ?? ""} onChange={(e) => setForm({ ...form, button_link: e.target.value })} />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => saveMutation.mutate(form)} className="gap-2" disabled={saveMutation.isPending}>
                        <Save className="h-4 w-4" /> Save Section
                      </Button>
                      <Button variant="outline" onClick={() => setEditingSection(null)}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 flex items-center gap-4 cursor-pointer" onClick={() => startEditing(section)}>
                    <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground">{section.section_title || section.section_id}</p>
                      <p className="text-sm text-muted-foreground truncate">{section.heading}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">#{section.sort_order}</span>
                      <Button
                        variant="ghost" size="icon"
                        onClick={(e) => { e.stopPropagation(); toggleActive.mutate({ id: section.id, is_active: !section.is_active }); }}
                      >
                        {section.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPages;
