import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Upload, Trash2, Copy, Image as ImageIcon, Loader2 } from "lucide-react";
import { useImageUpload } from "@/hooks/useImageUpload";

const AdminMedia = () => {
  const qc = useQueryClient();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [folder, setFolder] = useState("general");
  const { compress, isCompressing } = useImageUpload();

  const { data: media, isLoading } = useQuery({
    queryKey: ["admin_media"],
    queryFn: async () => {
      const { data, error } = await supabase.from("media_library").select("*").order("created_at", { ascending: false });
      if (error) {
        console.warn("media_library not available:", error.message);
        return [];
      }
      return data;
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      setUploading(true);
      // Compress image before upload
      const { file: compressedFile } = await compress(file);
      const path = `${folder}/${Date.now()}-${compressedFile.name}`;

      const { error: uploadError } = await supabase.storage.from("media").upload(path, compressedFile, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("media").getPublicUrl(path);

      const { error: dbError } = await supabase.from("media_library").insert({
        file_name: file.name,
        file_url: urlData.publicUrl,
        file_type: file.type.startsWith("image") ? "image" : "file",
        alt_text: file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "),
        folder,
        file_size: file.size,
      });
      if (dbError) console.warn("Could not save to media_library:", dbError.message);

      return urlData.publicUrl;
    },
    onSuccess: (url) => {
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
    mutationFn: async (item: any) => {
      // Delete from storage
      const path = item.file_url.split("/media/")[1];
      if (path) {
        await supabase.storage.from("media").remove([decodeURIComponent(path)]);
      }
      // Delete from DB
      const { error } = await supabase.from("media_library").delete().eq("id", item.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin_media"] });
      toast({ title: "Deleted" });
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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading font-bold text-foreground">Media Library</h1>
        <div className="flex items-center gap-3">
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
          <Button onClick={() => fileRef.current?.click()} className="gap-2" disabled={uploading}>
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Upload
          </Button>
          <input ref={fileRef} type="file" multiple accept="image/*,video/*,.pdf" className="hidden" onChange={handleFileChange} />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="aspect-square bg-secondary rounded-lg animate-pulse" />)}
        </div>
      ) : (media ?? []).length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <ImageIcon className="h-16 w-16 mx-auto mb-4 opacity-30" />
          <p>No media files uploaded yet.</p>
          <p className="text-sm mt-1">Click "Upload" to add images and files.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {(media ?? []).map((item) => (
            <Card key={item.id} className="group overflow-hidden">
              <div className="aspect-square bg-secondary relative">
                {item.file_type === "image" ? (
                  <img src={item.file_url} alt={item.alt_text} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute inset-0 bg-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button size="icon" variant="secondary" onClick={() => copyUrl(item.file_url)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="destructive" onClick={() => { if (confirm("Delete?")) deleteMutation.mutate(item); }}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardContent className="p-2">
                <p className="text-xs text-muted-foreground truncate">{item.file_name}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminMedia;
