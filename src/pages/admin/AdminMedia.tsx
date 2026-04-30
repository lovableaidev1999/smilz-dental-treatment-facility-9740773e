import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Upload, Trash2, Copy, Image as ImageIcon, Loader2,
  Grid, List, X, Save, ExternalLink
} from "lucide-react";
import { useImageUpload } from "@/hooks/useImageUpload";

interface MediaItem {
  id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  alt_text: string | null;
  folder: string | null;
  file_size: number | null;
  created_at: string;
  caption?: string | null;
  description?: string | null;
}

const AdminMedia = () => {
  const qc = useQueryClient();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [folder, setFolder] = useState("general");
  const { compress, isCompressing } = useImageUpload();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [editFields, setEditFields] = useState({ alt_text: "", caption: "", description: "" });

  const { data: media, isLoading } = useQuery({
    queryKey: ["admin_media"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("media_library")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) {
        console.warn("media_library not available:", error.message);
        return [];
      }
      return data as MediaItem[];
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      setUploading(true);
      const { file: compressedFile } = await compress(file);
      const path = `${folder}/${Date.now()}-${compressedFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from("media")
        .upload(path, compressedFile, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from("media").getPublicUrl(path);
      const { error: dbError } = await supabase.from("media_library").insert({
        file_name: compressedFile.name,
        file_url: urlData.publicUrl,
        file_type: compressedFile.type.startsWith("image") ? "image" : "file",
        alt_text: compressedFile.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "),
        folder,
        file_size: compressedFile.size,
      });
      if (dbError) console.warn("Could not save to media_library:", dbError.message);
      return urlData.publicUrl;
    },
    onSuccess: () => {
      setUploading(false);
      qc.invalidateQueries({ queryKey: ["admin_media"] });
      toast({ title: "Uploaded!", description: "File uploaded successfully." });
    },
    onError: (err: Error) => {
      setUploading(false);
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (item: MediaItem) => {
      const path = item.file_url.split("/media/")[1];
      if (path) {
        await supabase.storage.from("media").remove([decodeURIComponent(path)]);
      }
      const { error } = await supabase.from("media_library").delete().eq("id", item.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin_media"] });
      setSelectedItem(null);
      toast({ title: "Deleted" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, fields }: { id: string; fields: Record<string, string> }) => {
      // Only send alt_text which is a known column; caption & description need migration
      const safeFields: Record<string, string> = {};
      if (fields.alt_text !== undefined) safeFields.alt_text = fields.alt_text;
      const { error } = await supabase.from("media_library").update(safeFields).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin_media"] });
      toast({ title: "Updated!" });
    },
    onError: (err: Error) => {
      toast({ title: "Update failed", description: err.message, variant: "destructive" });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    for (let i = 0; i < files.length; i++) {
      uploadMutation.mutate(files[i]);
    }
    e.target.value = "";
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({ title: "URL Copied!" });
  };

  const openDetail = (item: MediaItem) => {
    setSelectedItem(item);
    setEditFields({
      alt_text: item.alt_text || "",
      caption: (item as any).caption || "",
      description: (item as any).description || "",
    });
  };

  const handleSave = () => {
    if (!selectedItem) return;
    updateMutation.mutate({ id: selectedItem.id, fields: editFields });
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "—";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="flex gap-0 h-full">
      {/* Main content */}
      <div className={`flex-1 ${selectedItem ? "mr-0" : ""}`}>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-heading font-bold text-foreground">Media Library</h1>
          <div className="flex items-center gap-3">
            {/* View toggle */}
            <div className="flex items-center border border-input rounded-md overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 ${viewMode === "grid" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:bg-secondary"}`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 ${viewMode === "list" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:bg-secondary"}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
            <select
              value={folder}
              onChange={(e) => setFolder(e.target.value)}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="general">General</option>
              <option value="services">Services</option>
              <option value="blog">Blog</option>
              <option value="gallery">Gallery</option>
              <option value="banners">Banners</option>
            </select>
            <Button onClick={() => fileRef.current?.click()} className="gap-2" disabled={uploading || isCompressing}>
              {(uploading || isCompressing) ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {isCompressing ? "Compressing..." : "Upload"}
            </Button>
            <input ref={fileRef} type="file" multiple accept="image/*,video/*,.pdf" className="hidden" onChange={handleFileChange} />
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-square bg-secondary rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (media ?? []).length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <ImageIcon className="h-16 w-16 mx-auto mb-4 opacity-30" />
            <p>No media files uploaded yet.</p>
            <p className="text-sm mt-1">Click "Upload" to add images and files.</p>
          </div>
        ) : viewMode === "grid" ? (
          /* Grid View */
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {(media ?? []).map((item) => (
              <Card
                key={item.id}
                className={`group overflow-hidden cursor-pointer transition-all ${selectedItem?.id === item.id ? "ring-2 ring-primary" : ""}`}
                onClick={() => openDetail(item)}
              >
                <div className="aspect-square bg-secondary relative">
                  {item.file_type?.startsWith("image") ? (
                    <img src={item.file_url} alt={item.alt_text || ""} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <CardContent className="p-2">
                  <p className="text-xs text-muted-foreground truncate">{item.file_name}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground w-16"></th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">File</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Folder</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Date</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Size</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground w-24">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(media ?? []).map((item) => (
                  <tr
                    key={item.id}
                    className={`border-b border-border hover:bg-muted/30 cursor-pointer transition-colors ${selectedItem?.id === item.id ? "bg-primary/5" : ""}`}
                    onClick={() => openDetail(item)}
                  >
                    <td className="px-4 py-2">
                      <div className="w-12 h-12 rounded bg-secondary overflow-hidden flex-shrink-0">
                        {item.file_type?.startsWith("image") ? (
                          <img src={item.file_url} alt={item.alt_text || ""} className="w-full h-full object-cover" loading="lazy" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <p className="font-medium text-foreground truncate max-w-[200px]">{item.file_name}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[200px]">{item.alt_text}</p>
                    </td>
                    <td className="px-4 py-2 text-muted-foreground hidden md:table-cell capitalize">{item.folder || "—"}</td>
                    <td className="px-4 py-2 text-muted-foreground hidden md:table-cell">{formatDate(item.created_at)}</td>
                    <td className="px-4 py-2 text-muted-foreground text-right hidden lg:table-cell">{formatFileSize(item.file_size)}</td>
                    <td className="px-4 py-2 text-right">
                      <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => copyUrl(item.file_url)}>
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => { if (confirm("Delete?")) deleteMutation.mutate(item); }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail / Edit Panel (slides in from right) */}
      {selectedItem && (
        <div className="w-[380px] flex-shrink-0 border-l border-border bg-background overflow-y-auto ml-4">
          <div className="sticky top-0 bg-background z-10 border-b border-border px-4 py-3 flex items-center justify-between">
            <h2 className="font-semibold text-foreground text-sm">Attachment Details</h2>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelectedItem(null)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="p-4 space-y-5">
            {/* Image Preview */}
            {selectedItem.file_type === "image" ? (
              <div className="rounded-lg overflow-hidden border border-border bg-secondary">
                <img
                  src={selectedItem.file_url}
                  alt={selectedItem.alt_text || ""}
                  className="w-full max-h-[250px] object-contain"
                />
              </div>
            ) : (
              <div className="rounded-lg border border-border bg-secondary flex items-center justify-center h-40">
                <ImageIcon className="h-12 w-12 text-muted-foreground" />
              </div>
            )}

            {/* File Info */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">File name:</span>
                <span className="text-foreground font-medium truncate ml-2 max-w-[200px]">{selectedItem.file_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">File type:</span>
                <span className="text-foreground">{selectedItem.file_type?.toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">File size:</span>
                <span className="text-foreground">{formatFileSize(selectedItem.file_size)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Uploaded:</span>
                <span className="text-foreground">{formatDate(selectedItem.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Folder:</span>
                <span className="text-foreground capitalize">{selectedItem.folder || "—"}</span>
              </div>
            </div>

            {/* File URL */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">File URL</label>
              <div className="flex gap-2">
                <Input
                  value={selectedItem.file_url}
                  readOnly
                  className="text-xs h-8 bg-muted/50"
                />
                <Button size="sm" variant="outline" className="h-8 px-2 flex-shrink-0" onClick={() => copyUrl(selectedItem.file_url)}>
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </div>
              <a
                href={selectedItem.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline inline-flex items-center gap-1"
              >
                View file <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            <hr className="border-border" />

            {/* Editable Fields */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Alternative Text</label>
                <Input
                  value={editFields.alt_text}
                  onChange={(e) => setEditFields((p) => ({ ...p, alt_text: e.target.value }))}
                  placeholder="Describe this image for accessibility & SEO"
                  className="text-sm h-9"
                />
                <p className="text-xs text-muted-foreground">
                  Describe the purpose of the image. Leave empty if decorative.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Caption</label>
                <Input
                  value={editFields.caption}
                  onChange={(e) => setEditFields((p) => ({ ...p, caption: e.target.value }))}
                  placeholder="Caption (optional)"
                  className="text-sm h-9"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Description</label>
                <Textarea
                  value={editFields.description}
                  onChange={(e) => setEditFields((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Description (optional)"
                  className="text-sm min-h-[80px]"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              <Button
                variant="destructive"
                size="sm"
                className="gap-1.5"
                onClick={() => {
                  if (confirm("Delete this file permanently?")) deleteMutation.mutate(selectedItem);
                }}
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete permanently
              </Button>
              <Button size="sm" className="gap-1.5" onClick={handleSave}>
                <Save className="h-3.5 w-3.5" /> Update
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMedia;
