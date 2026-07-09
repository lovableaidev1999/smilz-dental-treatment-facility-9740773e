import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Info } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Save, Eye, EyeOff, ExternalLink, Plus, Trash2, GripVertical } from "lucide-react";
import ImageUrlInput from "@/components/admin/ImageUrlInput";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";

const PAGES = ["home", "about", "contact", "services", "gallery", "blog", "referral"];

const PAGE_ROUTES: Record<string, string> = {
  home: "/",
  about: "/about",
  contact: "/contact",
  services: "/services",
  gallery: "/gallery",
  blog: "/blog",
  referral: "/referral",
};

const openPagePreview = (page: string) => {
  const route = PAGE_ROUTES[page] || `/${page}`;
  window.open(`${route}?t=${Date.now()}`, "_blank");
};

const SortableSectionCard = ({ section, isEditing, onEdit, onSave, onCancelEdit, onToggleActive, onDelete, savePending, activePage, SectionForm }: any) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id });
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 10 : undefined, opacity: isDragging ? 0.8 : undefined };

  return (
    <div ref={setNodeRef} style={style}>
      <Card className={!section.is_active ? "opacity-50" : ""}>
        <CardContent className="p-0">
          {isEditing ? (
            <SectionForm data={section} onSave={onSave} onCancel={onCancelEdit} />
          ) : (
            <div className="p-4 flex items-center gap-4 cursor-pointer" onClick={onEdit}>
              <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing touch-none">
                <GripVertical className="h-5 w-5 text-muted-foreground/50 flex-shrink-0" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground">{section.section_title || section.section_id}</p>
                <p className="text-sm text-muted-foreground truncate">{section.heading || "(no heading)"}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">#{section.sort_order}</span>
                <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded font-mono">{section.section_id}</span>
                <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onToggleActive(); }}>
                  {section.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={(e) => { e.stopPropagation(); onDelete(); }}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
const AdminPages = () => {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialPage = (() => {
    const p = searchParams.get("page");
    return p && PAGES.includes(p) ? p : "home";
  })();
  const [activePage, setActivePage] = useState(initialPage);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [form, setForm] = useState<any>({});

  // Keep state in sync when the ?page= query param changes (e.g. deep link
  // from Visual Page Builder "Edit Content" button).
  useEffect(() => {
    const p = searchParams.get("page");
    if (p && PAGES.includes(p) && p !== activePage) {
      setActivePage(p);
      setEditingSection(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

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
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const reorderMutation = useMutation({
    mutationFn: async (items: { id: string; sort_order: number }[]) => {
      for (const item of items) {
        const { error } = await supabase.from("page_content").update({ sort_order: item.sort_order }).eq("id", item.id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin_page_content"] });
      qc.invalidateQueries({ queryKey: ["page_content"] });
      toast({ title: "Order updated!" });
    },
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !sections) return;
    const oldIndex = sections.findIndex((s) => s.id === active.id);
    const newIndex = sections.findIndex((s) => s.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const reordered = [...sections];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);
    const updates = reordered.map((s, i) => ({ id: s.id, sort_order: i + 1 }));
    reorderMutation.mutate(updates);
  };

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

        {/* Live hero preview — shown for hero sections so admins can confirm the image before saving */}
        {local.section_id === "hero" && (
          <div>
            <label className="text-sm font-medium mb-1.5 block flex items-center gap-2">
              Live Hero Preview
              <span className="text-xs text-muted-foreground font-normal">(updates as you type)</span>
            </label>
            <div className="relative overflow-hidden rounded-lg border border-border aspect-[16/6] bg-gradient-to-br from-primary to-primary/70">
              {local.image_url ? (
                <>
                  <img
                    src={local.image_url}
                    alt={local.heading || "Hero preview"}
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/85 via-primary/70 to-primary/50" />
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-primary-foreground/60 text-xs">
                  No image set — gradient fallback will be used
                </div>
              )}
              <div className="relative h-full flex flex-col items-center justify-center text-center px-6 text-primary-foreground">
                <h3 className="text-2xl md:text-3xl font-heading font-bold mb-2 line-clamp-2">
                  {local.heading || "Hero heading"}
                </h3>
                {local.subheading && (
                  <p className="text-primary-foreground/85 text-sm md:text-base max-w-xl line-clamp-2">
                    {local.subheading}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

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
          <Button
            onClick={() => {
              onSave(local);
              setTimeout(() => openPagePreview(local.page_name || activePage), 600);
            }}
            className="gap-2"
            disabled={saveMutation.isPending}
          >
            <Save className="h-4 w-4" /> {isNew ? "Create & Preview" : "Save & Preview"}
          </Button>
          <Button onClick={() => onSave(local)} variant="secondary" className="gap-2" disabled={saveMutation.isPending}>
            <Save className="h-4 w-4" /> {isNew ? "Create" : "Save"}
          </Button>
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-heading font-bold text-foreground">Page Sections</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => openPagePreview(activePage)}
          >
            <ExternalLink className="h-4 w-4" /> Preview Page
          </Button>
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
      </div>

      {/* Safety banner */}
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-900 px-4 py-3 mb-6 text-sm flex gap-2">
        <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
        <div>
          <strong>Safe to edit.</strong> Changes here update the text, images, and CTAs inside your existing page design — the layout and styling of the live site will not change.
        </div>
      </div>

      {/* Page tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {PAGES.map((page) => (
          <button
            key={page}
            onClick={() => {
              setActivePage(page);
              setEditingSection(null);
              setShowNewForm(false);
              const next = new URLSearchParams(searchParams);
              next.set("page", page);
              setSearchParams(next, { replace: true });
            }}
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
        <DndContext sensors={sensors} collisionDetection={closestCenter} modifiers={[restrictToVerticalAxis]} onDragEnd={handleDragEnd}>
          <SortableContext items={(sections ?? []).map((s) => s.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {(sections ?? []).map((section) => (
                <SortableSectionCard
                  key={section.id}
                  section={section}
                  isEditing={editingSection === section.id}
                  onEdit={() => startEditing(section)}
                  onSave={(data: any) => saveMutation.mutate(data)}
                  onCancelEdit={() => setEditingSection(null)}
                  onToggleActive={() => toggleActive.mutate({ id: section.id, is_active: !section.is_active })}
                  onDelete={() => {
                    if (confirm(`Delete "${section.section_title || section.section_id}" section?`)) {
                      deleteMutation.mutate(section.id);
                    }
                  }}
                  savePending={saveMutation.isPending}
                  activePage={activePage}
                  SectionForm={SectionForm}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
};

export default AdminPages;
