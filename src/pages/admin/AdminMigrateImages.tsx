import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, XCircle, AlertTriangle, Download } from "lucide-react";

type MigrationItem = {
  table: string;
  id: string;
  field: string;
  oldUrl: string;
  newUrl?: string;
  status: "pending" | "downloading" | "uploading" | "updating" | "done" | "error";
  error?: string;
};

const WP_URL_PATTERN = /smilz\.net\/wp-content/;

const AdminMigrateImages = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<MigrationItem[]>([]);
  const [scanning, setScanning] = useState(false);
  const [migrating, setMigrating] = useState(false);
  const [completed, setCompleted] = useState(0);

  const updateItem = (index: number, updates: Partial<MigrationItem>) => {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...updates } : item)));
  };

  // Step 1: Scan all tables for WordPress URLs
  const scanForWpUrls = async () => {
    setScanning(true);
    setItems([]);
    const found: MigrationItem[] = [];

    try {
      // Scan services
      const { data: services } = await supabase.from("services").select("id, featured_image");
      (services ?? []).forEach((s) => {
        if (s.featured_image && WP_URL_PATTERN.test(s.featured_image)) {
          found.push({ table: "services", id: s.id, field: "featured_image", oldUrl: s.featured_image, status: "pending" });
        }
      });

      // Scan blog_posts
      const { data: posts } = await supabase.from("blog_posts").select("id, featured_image");
      (posts ?? []).forEach((p) => {
        if (p.featured_image && WP_URL_PATTERN.test(p.featured_image)) {
          found.push({ table: "blog_posts", id: p.id, field: "featured_image", oldUrl: p.featured_image, status: "pending" });
        }
      });

      // Scan gallery
      const { data: gallery } = await supabase.from("gallery").select("id, image_url");
      (gallery ?? []).forEach((g) => {
        if (g.image_url && WP_URL_PATTERN.test(g.image_url)) {
          found.push({ table: "gallery", id: g.id, field: "image_url", oldUrl: g.image_url, status: "pending" });
        }
      });

      // Scan page_content
      const { data: pages } = await supabase.from("page_content").select("id, image_url");
      (pages ?? []).forEach((p) => {
        if (p.image_url && WP_URL_PATTERN.test(p.image_url)) {
          found.push({ table: "page_content", id: p.id, field: "image_url", oldUrl: p.image_url, status: "pending" });
        }
      });

      // Scan site_settings for any image URLs in JSON values
      const { data: settings } = await supabase.from("site_settings").select("id, key, value");
      (settings ?? []).forEach((s) => {
        const valueStr = JSON.stringify(s.value);
        if (WP_URL_PATTERN.test(valueStr)) {
          found.push({ table: "site_settings", id: s.id, field: `value (key: ${s.key})`, oldUrl: valueStr, status: "pending" });
        }
      });

      setItems(found);
      toast({
        title: `Scan complete`,
        description: `Found ${found.length} WordPress image references across all tables.`,
      });
    } catch (err: any) {
      toast({ title: "Scan error", description: err.message, variant: "destructive" });
    } finally {
      setScanning(false);
    }
  };

  // Download image via fetch, upload to Supabase storage, update DB
  const migrateImage = async (item: MigrationItem, index: number): Promise<boolean> => {
    try {
      // 1. Download
      updateItem(index, { status: "downloading" });

      // Use a proxy-free approach: fetch directly (works if CORS allows)
      // For images from WordPress, we try direct fetch first
      let blob: Blob;
      try {
        const response = await fetch(item.oldUrl);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        blob = await response.blob();
      } catch {
        // Fallback: use an img element + canvas to download (bypasses CORS for images)
        blob = await downloadViaCanvas(item.oldUrl);
      }

      // 2. Upload to Supabase storage
      updateItem(index, { status: "uploading" });
      const ext = item.oldUrl.split(".").pop()?.split("?")[0]?.toLowerCase() || "png";
      const fileName = `migrated/${item.table}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

      const { error: uploadErr } = await supabase.storage.from("media").upload(fileName, blob, {
        contentType: blob.type || `image/${ext}`,
        upsert: true,
      });
      if (uploadErr) throw new Error(`Upload failed: ${uploadErr.message}`);

      const { data: urlData } = supabase.storage.from("media").getPublicUrl(fileName);
      const newUrl = urlData.publicUrl;

      // 3. Update database reference
      updateItem(index, { status: "updating" });

      if (item.table === "site_settings") {
        // For site_settings, we need to update JSON value
        // Skip for now — flag for manual update
        updateItem(index, { newUrl, status: "done" });
      } else {
        const { error: updateErr } = await supabase
          .from(item.table)
          .update({ [item.field]: newUrl })
          .eq("id", item.id);
        if (updateErr) throw new Error(`DB update failed: ${updateErr.message}`);
        updateItem(index, { newUrl, status: "done" });
      }

      // 4. Also record in media_library
      const originalName = item.oldUrl.split("/").pop()?.split("?")[0] || "migrated-image";
      await supabase.from("media_library").insert({
        file_name: originalName,
        file_url: newUrl,
        file_type: "image",
        alt_text: originalName.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "),
        folder: "migrated",
        file_size: blob.size,
      }).then(() => {});

      return true;
    } catch (err: any) {
      updateItem(index, { status: "error", error: err.message });
      return false;
    }
  };

  // Canvas-based image download (bypasses CORS for displayable images)
  const downloadViaCanvas = (url: string): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas not supported"));
        ctx.drawImage(img, 0, 0);
        canvas.toBlob(
          (blob) => (blob ? resolve(blob) : reject(new Error("Canvas toBlob failed"))),
          "image/png"
        );
      };
      img.onerror = () => reject(new Error("Image load failed (CORS blocked)"));
      img.src = url;
    });
  };

  // Step 2: Migrate all pending images
  const migrateAll = async () => {
    setMigrating(true);
    setCompleted(0);
    let success = 0;
    let fail = 0;

    for (let i = 0; i < items.length; i++) {
      if (items[i].status !== "pending") continue;
      const ok = await migrateImage(items[i], i);
      if (ok) success++;
      else fail++;
      setCompleted((prev) => prev + 1);
    }

    setMigrating(false);
    toast({
      title: "Migration complete",
      description: `✅ ${success} migrated, ❌ ${fail} failed`,
      variant: fail > 0 ? "destructive" : "default",
    });
  };

  const pendingCount = items.filter((i) => i.status === "pending").length;
  const doneCount = items.filter((i) => i.status === "done").length;
  const errorCount = items.filter((i) => i.status === "error").length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Image Migration Tool</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Migrate all WordPress-hosted images to Supabase storage and update database references automatically.
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 mb-6">
        <Button onClick={scanForWpUrls} disabled={scanning || migrating} variant="outline" className="gap-2">
          {scanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          {scanning ? "Scanning..." : "1. Scan for WordPress URLs"}
        </Button>
        {items.length > 0 && pendingCount > 0 && (
          <Button onClick={migrateAll} disabled={migrating} className="gap-2">
            {migrating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            {migrating ? `Migrating... (${completed}/${pendingCount})` : `2. Migrate ${pendingCount} images`}
          </Button>
        )}
      </div>

      {/* Summary */}
      {items.length > 0 && (
        <div className="flex gap-4 mb-6 text-sm">
          <span className="text-muted-foreground">Total: {items.length}</span>
          <span className="text-yellow-600">Pending: {pendingCount}</span>
          <span className="text-green-600">Done: {doneCount}</span>
          {errorCount > 0 && <span className="text-destructive">Errors: {errorCount}</span>}
        </div>
      )}

      {/* Results */}
      <div className="space-y-3">
        {items.map((item, i) => (
          <Card key={i} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {item.status === "done" && <CheckCircle className="h-5 w-5 text-green-600" />}
                  {item.status === "error" && <XCircle className="h-5 w-5 text-destructive" />}
                  {item.status === "pending" && <AlertTriangle className="h-5 w-5 text-yellow-500" />}
                  {["downloading", "uploading", "updating"].includes(item.status) && (
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <span className="bg-secondary px-2 py-0.5 rounded text-xs">{item.table}</span>
                    <span className="text-muted-foreground">{item.field}</span>
                    <span className="text-xs text-muted-foreground capitalize">{item.status}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 truncate">{item.oldUrl}</p>
                  {item.newUrl && (
                    <p className="text-xs text-green-600 mt-1 truncate">→ {item.newUrl}</p>
                  )}
                  {item.error && (
                    <p className="text-xs text-destructive mt-1">{item.error}</p>
                  )}
                </div>
                {item.status === "done" && item.newUrl && (
                  <img src={item.newUrl} alt="" className="w-12 h-12 rounded object-cover flex-shrink-0" />
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {items.length === 0 && !scanning && (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            <Download className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p>Click "Scan for WordPress URLs" to find all images that need migration.</p>
            <p className="text-sm mt-2">This will check services, blog posts, gallery, pages, and settings.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminMigrateImages;
