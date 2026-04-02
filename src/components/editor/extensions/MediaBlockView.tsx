import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import { useRef, useState } from "react";
import { Upload, Loader2, X, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useImageUpload } from "@/hooks/useImageUpload";

const MediaBlockView = ({ node, updateAttributes, deleteNode, selected }: NodeViewProps) => {
  const { src, alt, caption } = node.attrs;
  const fileRef = useRef<HTMLInputElement>(null);
  const { compress, isCompressing } = useImageUpload();
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file: compressed } = await compress(file);
      const path = `blog/${Date.now()}-${compressed.name}`;
      const { error } = await supabase.storage.from("media").upload(path, compressed, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from("media").getPublicUrl(path);
      updateAttributes({ src: data.publicUrl });
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const busy = isCompressing || uploading;

  return (
    <NodeViewWrapper className={`my-4 relative group rounded-xl border-2 transition-colors ${selected ? "border-primary" : "border-border"}`}>
      <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="destructive" size="icon" className="h-7 w-7" onClick={deleteNode}>
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>

      {src ? (
        <div className="p-3">
          <img src={src} alt={alt || "Dental image"} className="rounded-lg w-full max-h-96 object-cover" />
          <div className="mt-2 space-y-2">
            <Input
              value={alt}
              onChange={(e) => updateAttributes({ alt: e.target.value })}
              placeholder="Alt text (for SEO)"
              className="text-xs h-8"
            />
            <Input
              value={caption}
              onChange={(e) => updateAttributes({ caption: e.target.value })}
              placeholder="Caption (optional)"
              className="text-xs h-8 italic"
            />
          </div>
        </div>
      ) : (
        <button
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          className="w-full p-10 flex flex-col items-center gap-3 text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors rounded-xl"
        >
          {busy ? (
            <Loader2 className="h-10 w-10 animate-spin" />
          ) : (
            <ImageIcon className="h-10 w-10" />
          )}
          <span className="text-sm font-medium">{busy ? "Compressing & uploading…" : "Click to upload image (auto WebP)"}</span>
        </button>
      )}

      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
    </NodeViewWrapper>
  );
};

export default MediaBlockView;
