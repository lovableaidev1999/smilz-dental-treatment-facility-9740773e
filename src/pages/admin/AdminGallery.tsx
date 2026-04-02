import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useState, useRef } from "react";
import { Plus, Trash2, Eye, EyeOff, Save, Upload, Loader2 } from "lucide-react";
import { useImageUpload } from "@/hooks/useImageUpload";

const AdminGallery = () => {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [newItem, setNewItem] = useState({ src: "", alt: "", caption: "", category: "", sort_order: 0 });

  const { data: items, isLoading } = useQuery({
    queryKey: ["admin_gallery"],
    queryFn: async () => {
      const { data, error } = await supabase.from("gallery").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("gallery").insert({ ...newItem, is_active: true });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin_gallery"] });
      setNewItem({ src: "", alt: "", caption: "", category: "", sort_order: 0 });
      setShowAdd(false);
      toast({ title: "Gallery item added!" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("gallery").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin_gallery"] }); toast({ title: "Deleted" }); },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("gallery").update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin_gallery"] }),
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading font-bold text-foreground">Gallery</h1>
        <Button onClick={() => setShowAdd(true)} className="gap-2"><Plus className="h-4 w-4" /> Add Item</Button>
      </div>

      {showAdd && (
        <Card className="mb-6">
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-medium mb-1.5 block">Image URL</label><Input value={newItem.src} onChange={(e) => setNewItem({ ...newItem, src: e.target.value })} /></div>
              <div><label className="text-sm font-medium mb-1.5 block">Alt Text</label><Input value={newItem.alt} onChange={(e) => setNewItem({ ...newItem, alt: e.target.value })} /></div>
              <div><label className="text-sm font-medium mb-1.5 block">Caption</label><Input value={newItem.caption} onChange={(e) => setNewItem({ ...newItem, caption: e.target.value })} /></div>
              <div><label className="text-sm font-medium mb-1.5 block">Sort Order</label><Input type="number" value={newItem.sort_order} onChange={(e) => setNewItem({ ...newItem, sort_order: Number(e.target.value) })} /></div>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => addMutation.mutate()} className="gap-2"><Save className="h-4 w-4" /> Save</Button>
              <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="aspect-video bg-secondary rounded-lg animate-pulse" />)}</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {(items ?? []).map((item) => (
            <Card key={item.id} className={`group overflow-hidden ${!item.is_active ? "opacity-50" : ""}`}>
              <div className="aspect-video bg-secondary relative">
                <img src={item.src} alt={item.alt} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button size="icon" variant="secondary" onClick={() => toggleMutation.mutate({ id: item.id, is_active: !item.is_active })}>
                    {item.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button size="icon" variant="destructive" onClick={() => { if (confirm("Delete?")) deleteMutation.mutate(item.id); }}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardContent className="p-3">
                <p className="text-sm text-foreground truncate">{item.caption}</p>
                <p className="text-xs text-muted-foreground">{item.alt}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminGallery;
