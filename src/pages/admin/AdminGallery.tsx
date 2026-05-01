import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useState, useRef } from "react";
import { Plus, Trash2, Eye, EyeOff, Save, Upload, Loader2, Image as ImageIcon, Pencil } from "lucide-react";
import { useImageUpload } from "@/hooks/useImageUpload";
import { resolveImageUrl } from "@/lib/wpImageFallback";
import MediaPickerDialog from "@/components/builder/MediaPickerDialog";

const AdminGallery = () => {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [newItem, setNewItem] = useState({ src: "", alt: "", caption: "", category: "", sort_order: 0 });
  const fileRef = useRef<HTMLInputElement>(null);
  const { compress, isCompressing } = useImageUpload();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { file: compressed } = await compress(file);
      const path = `gallery/${Date.now()}-${compressed.name}`;
      const { error } = await supabase.storage.from("media").upload(path, compressed, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from("media").getPublicUrl(path);
      // Also register in media_library so it shows up in the picker
      await supabase.from("media_library").insert({
        file_name: compressed.name,
        file_url: data.publicUrl,
        file_type: compressed.type,
        file_size: compressed.size,
        alt_text: compressed.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "),
      });
      setNewItem((p) => ({ ...p, src: data.publicUrl, alt: p.alt || compressed.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ") }));
      toast({ title: "Image uploaded & added to Media Library!" });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    }
    e.target.value = "";
  };

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
              <div>
                <label className="text-sm font-medium mb-1.5 block">Image</label>
                <div className="flex gap-2">
                  <Input value={newItem.src} onChange={(e) => setNewItem({ ...newItem, src: e.target.value })} placeholder="URL or upload →" className="flex-1" />
                  <Button type="button" variant="outline" size="icon" onClick={() => fileRef.current?.click()} disabled={isCompressing}>
                    {isCompressing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  </Button>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </div>
              </div>
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
                <img src={resolveImageUrl(item.src) ?? item.src} alt={item.alt} className="w-full h-full object-cover" onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = '0.2'; }} />
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
