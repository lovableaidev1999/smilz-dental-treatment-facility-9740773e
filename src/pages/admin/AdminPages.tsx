import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Save, Eye, EyeOff, ChevronRight, Plus, Trash2, GripVertical } from "lucide-react";

const PAGES = ["home", "about", "contact", "services", "gallery", "blog"];

const AdminPages = () => {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [activePage, setActivePage] = useState("home");
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [form, setForm] = useState<any>({});
  const [showNewForm, setShowNewForm] = useState(false);
  const [newForm, setNewForm] = useState<any>({
    page_name: "home",
    section_id: "",
    section_title: "",
    heading: "",
    subheading: "",
    body_text: "",
    image_url: "",
    button_text: "",
    button_link: "",
    sort_order: 99,
    is_active: true,
  });

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
      const { id, created_at, updated_at, ...rest } = section;
      if (!rest.section_id || !rest.section_id.trim()) {
        throw new Error("Section ID is required");
      }
      if (!rest.page_name) {
        throw new Error("Page name is missing");
      }
      const payload = { ...rest, updated_at: new Date().toISOString() };
      if (id) {
        const { error } = await supabase.from("page_content").update(payload).eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("page_content").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin_page_content"] });
      qc.invalidateQueries({ queryKey: ["page_content"] });
      toast({ title: "Section saved!" });
      setEditingSection(null);
      setShowNewForm(false);
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("page_content").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin_page_content"] });
      qc.invalidateQueries({ queryKey: ["page_content"] });
      toast({ title: "Section deleted" });
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("page_content").update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin_page_content"] });
      qc.invalidateQueries({ queryKey: ["page_content"] });
    },
  });

  const startEditing = (section: any) => {
    setEditingSection(section.id);
    setForm({ ...section });
    setShowNewForm(false);
  };

  const SectionForm = ({ data, onSave, onCancel, isNew = false }: any) => {
    const [local, setLocal] = useState(data);
    return (
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Section Title</label>
            <Input value={local.section_title ?? ""} onChange={(e) => setLocal({ ...local, section_title: e.target.value })} placeholder="e.g. Hero Section" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Section ID {isNew && <span className="text-destructive">*</span>}</label>
            <Input value={local.section_id ?? ""} onChange={(e) => setLocal({ ...local, section_id: e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, "-") })} disabled={!isNew} className={!isNew ? "opacity-60" : ""} placeholder="e.g. hero" />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium mb-1.5 block">Heading</label>
          <Input value={local.heading ?? ""} onChange={(e) => setLocal({ ...local, heading: e.target.value })} placeholder="Main heading text" />
        </div>
        <div>
          <label className="text-sm font-medium mb-1.5 block">Subheading</label>
          <Input value={local.subheading ?? ""} onChange={(e) => setLocal({ ...local, subheading: e.target.value })} placeholder="Subtitle or tagline" />
        </div>
        <div>
          <label className="text-sm font-medium mb-1.5 block">Body Text</label>
          <Textarea value={local.body_text ?? ""} onChange={(e) => setLocal({ ...local, body_text: e.target.value })} rows={4} placeholder="Paragraph content (use new lines to separate paragraphs)" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Image URL</label>
            <ImageUrlInput value={local.image_url ?? ""} onChange={(url) => setLocal({ ...local, image_url: url })} />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Sort Order</label>
            <Input type="number" value={local.sort_order ?? 0} onChange={(e) => setLocal({ ...local, sort_order: Number(e.target.value) })} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Button Text</label>
            <Input value={local.button_text ?? ""} onChange={(e) => setLocal({ ...local, button_text: e.target.value })} placeholder="e.g. Learn More" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Button Link</label>
            <Input value={local.button_link ?? ""} onChange={(e) => setLocal({ ...local, button_link: e.target.value })} placeholder="e.g. /contact" />
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => onSave(local)} className="gap-2" disabled={saveMutation.isPending}>
            <Save className="h-4 w-4" /> {isNew ? "Create Section" : "Save Section"}
          </Button>
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading font-bold text-foreground">Page Sections</h1>
        <Button
          onClick={() => {
            setShowNewForm(!showNewForm);
            setEditingSection(null);
            setNewForm((f: any) => ({ ...f, page_name: activePage, sort_order: (sections?.length ?? 0) + 1 }));
          }}
          className="gap-2"
          size="sm"
        >
          <Plus className="h-4 w-4" /> Add Section
        </Button>
      </div>

      {/* Page tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {PAGES.map((page) => (
          <button
            key={page}
            onClick={() => { setActivePage(page); setEditingSection(null); setShowNewForm(false); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
              activePage === page ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-primary/10"
            }`}
          >
            {page}
          </button>
        ))}
      </div>

      {/* New section form */}
      {showNewForm && (
        <Card className="mb-4 border-primary/30">
          <CardContent className="p-0">
            <div className="px-6 pt-4 pb-0">
              <p className="text-sm font-medium text-primary">New Section for "{activePage}" page</p>
            </div>
            <SectionForm
              data={{ ...newForm, page_name: activePage }}
              isNew
              onSave={(data: any) => saveMutation.mutate(data)}
              onCancel={() => setShowNewForm(false)}
            />
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-secondary rounded-lg animate-pulse" />)}</div>
      ) : (sections ?? []).length === 0 ? (
        <p className="text-muted-foreground text-center py-12">
          No sections found for this page. Click "Add Section" to create one.
        </p>
      ) : (
        <div className="space-y-3">
          {(sections ?? []).map((section) => (
            <Card key={section.id} className={!section.is_active ? "opacity-50" : ""}>
              <CardContent className="p-0">
                {editingSection === section.id ? (
                  <SectionForm
                    data={section}
                    onSave={(data: any) => saveMutation.mutate(data)}
                    onCancel={() => setEditingSection(null)}
                  />
                ) : (
                  <div className="p-4 flex items-center gap-4 cursor-pointer" onClick={() => startEditing(section)}>
                    <GripVertical className="h-5 w-5 text-muted-foreground/50 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground">{section.section_title || section.section_id}</p>
                      <p className="text-sm text-muted-foreground truncate">{section.heading || "(no heading)"}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">#{section.sort_order}</span>
                      <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded font-mono">{section.section_id}</span>
                      <Button
                        variant="ghost" size="icon"
                        onClick={(e) => { e.stopPropagation(); toggleActive.mutate({ id: section.id, is_active: !section.is_active }); }}
                      >
                        {section.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="ghost" size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Delete "${section.section_title || section.section_id}" section?`)) {
                            deleteMutation.mutate(section.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
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
