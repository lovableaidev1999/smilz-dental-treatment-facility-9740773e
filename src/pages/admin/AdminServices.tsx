import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Eye, EyeOff, GripVertical, Paintbrush } from "lucide-react";
import { getExistingDesign } from "@/lib/existingDesignTemplates";
import { resolveTemplateVars } from "@/lib/resolveTemplateVars";
import { resolveImageUrl } from "@/lib/wpImageFallback";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type Service = {
  id: string;
  title: string;
  short_desc: string | null;
  slug: string;
  is_active: boolean;
  featured_image: string | null;
  sort_order: number | null;
  description: string | null;
  faqs: any;
};

const AdminServices = () => {
  const qc = useQueryClient();
  const { toast } = useToast();
  const navigate = useNavigate();

  const { data: services, isLoading } = useQuery({
    queryKey: ["admin_services"],
    queryFn: async () => {
      const { data, error } = await supabase.from("services").select("*").order("sort_order");
      if (error) throw error;
      return data as Service[];
    },
  });

  // Local ordered copy so dragging feels instant.
  const [items, setItems] = useState<Service[]>([]);
  useEffect(() => {
    if (services) setItems(services);
  }, [services]);

  const { data: layouts } = useQuery({
    queryKey: ["page_layouts"],
    queryFn: async () => {
      const { data, error } = await supabase.from("page_layouts").select("id, page_slug");
      if (error) throw error;
      return data as { id: string; page_slug: string }[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("services").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin_services"] });
      qc.invalidateQueries({ queryKey: ["services"] });
      toast({ title: "Service deleted" });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("services").update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin_services"] });
      qc.invalidateQueries({ queryKey: ["services"] });
    },
  });

  const reorderMutation = useMutation({
    mutationFn: async (ordered: Service[]) => {
      // Persist new sort_order for every item (index = new order).
      await Promise.all(
        ordered.map((s, idx) =>
          supabase.from("services").update({ sort_order: idx }).eq("id", s.id),
        ),
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin_services"] });
      qc.invalidateQueries({ queryKey: ["services"] });
      toast({ title: "Order updated" });
    },
    onError: (err: Error) => {
      toast({ title: "Couldn't save order", description: err.message, variant: "destructive" });
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const next = arrayMove(items, oldIndex, newIndex);
    setItems(next);
    reorderMutation.mutate(next);
  };

  const handleOpenBuilder = async (service: any) => {
    const layoutSlug = `service-${service.slug}`;
    const existing = layouts?.find(l => l.page_slug === layoutSlug);
    const serviceFaqs = Array.isArray(service.faqs)
      ? service.faqs.map((faq: any) => ({ question: faq.q || faq.question || '', answer: faq.a || faq.answer || '' })).filter((faq: any) => faq.question || faq.answer)
      : [];

    const template = getExistingDesign(layoutSlug);
    if (template) {
      const resolved = resolveTemplateVars(template, {
        Service_Title: service.title,
        Service_Short_Desc: service.short_desc || '',
        Service_Image: service.featured_image ? resolveImageUrl(service.featured_image) : '',
        Service_Content: service.description || '',
        Service_FAQs: serviceFaqs,
      });
      sessionStorage.setItem('builder_template', JSON.stringify(resolved));
    }

    if (existing) {
      navigate(`/admin/page-builder/${existing.id}?template=true`);
    } else {
      navigate(`/admin/page-builder/new?slug=${encodeURIComponent(layoutSlug)}&title=${encodeURIComponent(service.title)}${template ? '&template=true' : ''}`);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-heading font-bold text-foreground">Services</h1>
        <Button asChild className="gap-2">
          <Link to="/admin/services/new"><Plus className="h-4 w-4" /> Add Service</Link>
        </Button>
      </div>
      <p className="text-sm text-muted-foreground mb-6">
        Drag the <span className="font-medium text-foreground">⋮⋮ handle</span> to reorder services.
        Use <span className="font-medium text-foreground">Edit Design</span> to change layout, sections & image placement (Visual Builder).
        Use <span className="font-medium text-foreground">Edit Content & SEO</span> to update text, featured image, FAQs and meta tags.
      </p>

      {isLoading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-secondary rounded-lg animate-pulse" />)}</div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {items.map((s) => (
                <SortableServiceRow
                  key={s.id}
                  service={s}
                  onToggle={() => toggleMutation.mutate({ id: s.id, is_active: !s.is_active })}
                  onDelete={() => { if (confirm("Delete this service?")) deleteMutation.mutate(s.id); }}
                  onEditDesign={() => handleOpenBuilder(s)}
                />
              ))}
              {items.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <p className="mb-4">No services yet. Click "Seed from Website" to import all services from smilz.net.</p>
                </div>
              )}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
};

const SortableServiceRow = ({
  service: s,
  onToggle,
  onDelete,
  onEditDesign,
}: {
  service: Service;
  onToggle: () => void;
  onDelete: () => void;
  onEditDesign: () => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: s.id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card className={!s.is_active ? "opacity-60" : ""}>
        <CardContent className="p-4 flex items-center gap-4">
          <button
            type="button"
            aria-label="Drag to reorder"
            className="touch-none p-1 -m-1 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-5 w-5" />
          </button>
          {s.featured_image && (
            <img
              src={resolveImageUrl(s.featured_image)}
              alt={s.title}
              className="w-12 h-12 rounded-lg object-cover flex-shrink-0 bg-secondary"
              width={48}
              height={48}
              loading="lazy"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
            />
          )}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground truncate">{s.title}</p>
            <p className="text-sm text-muted-foreground truncate">{s.short_desc}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <Button variant="ghost" size="icon" onClick={onToggle} title={s.is_active ? "Deactivate" : "Activate"}>
              {s.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </Button>
            <Button variant="default" size="sm" onClick={onEditDesign} className="gap-1.5" title="Edit page layout, sections & images in the Visual Builder">
              <Paintbrush className="h-3.5 w-3.5" /> Edit Design
            </Button>
            <Button variant="outline" size="sm" asChild className="gap-1.5" title="Edit text content, featured image, FAQs and SEO meta tags">
              <Link to={`/admin/services/${s.id}`}><Edit className="h-3.5 w-3.5" /> Edit Content & SEO</Link>
            </Button>
            <Button variant="ghost" size="icon" onClick={onDelete} title="Delete service">
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminServices;
