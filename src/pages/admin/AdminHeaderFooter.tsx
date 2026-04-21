import { useState, useEffect, useRef } from "react";
import { useSiteSettings, useUpdateSetting, SiteSettings } from "@/hooks/useSiteSettings";
import { supabase } from "@/integrations/supabase/client";
import { compressImage } from "@/hooks/useImageUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  Save, Upload, Plus, Trash2, GripVertical, Eye, AlertTriangle,
  Image as ImageIcon, Navigation, Footprints, Link as LinkIcon
} from "lucide-react";

const LOGO_GUIDELINES = {
  maxWidth: 400,
  maxHeight: 120,
  idealRatio: "3:1 to 5:1 (width:height)",
  formats: "PNG (transparent background recommended), SVG, or WebP",
  maxFileSize: "500KB",
};

const AdminHeaderFooter = () => {
  const { data: settings, isLoading } = useSiteSettings();
  const updateSetting = useUpdateSetting();
  const { toast } = useToast();
  const [form, setForm] = useState<any>({});
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [logoAnalysis, setLogoAnalysis] = useState<{ width: number; height: number; ratio: string; sizeKB: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (settings) {
      setForm(JSON.parse(JSON.stringify(settings)));
      setLogoPreview(settings.appearance?.logo_url || "");
    }
  }, [settings]);

  if (isLoading || !form.header) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-secondary rounded w-1/3" />
        <div className="h-40 bg-secondary rounded" />
      </div>
    );
  }

  const saveSection = async (key: string) => {
    try {
      await updateSetting.mutateAsync({ key, value: form[key] });
      toast({ title: "Saved!", description: `${key} settings updated.` });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Analyze before upload
    const img = new window.Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const ratio = (img.width / img.height).toFixed(1);
      setLogoAnalysis({
        width: img.width,
        height: img.height,
        ratio: `${ratio}:1`,
        sizeKB: Math.round(file.size / 1024),
      });
      URL.revokeObjectURL(url);
    };
    img.src = url;

    setUploading(true);
    try {
      const { file: compressed } = await compressImage(file, {
        maxSizeMB: 0.5,
        maxWidthOrHeight: LOGO_GUIDELINES.maxWidth,
        fileType: file.type.includes("png") ? "image/png" : "image/webp",
      });

      const ext = compressed.name.split(".").pop();
      const path = `branding/logo-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("media").upload(path, compressed);
      if (uploadError) throw uploadError;

      const { data: publicUrl } = supabase.storage.from("media").getPublicUrl(path);
      const newUrl = publicUrl.publicUrl;

      setLogoPreview(newUrl);
      setForm((p: any) => ({
        ...p,
        appearance: { ...p.appearance, logo_url: newUrl },
      }));

      // Auto-save
      await updateSetting.mutateAsync({
        key: "appearance",
        value: { ...form.appearance, logo_url: newUrl },
      });

      toast({ title: "Logo uploaded!", description: "Your new logo is live." });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  // ── Nav Link Helpers ──
  const updateNavLinks = (links: { label: string; path: string }[]) => {
    setForm((p: any) => ({ ...p, header: { ...p.header, nav_links: links } }));
  };

  const addNavLink = () => {
    updateNavLinks([...(form.header.nav_links || []), { label: "New Link", path: "/" }]);
  };

  const removeNavLink = (idx: number) => {
    updateNavLinks(form.header.nav_links.filter((_: any, i: number) => i !== idx));
  };

  // ── Footer Quick Link Helpers ──
  const updateFooterLinks = (links: { label: string; path: string }[]) => {
    setForm((p: any) => ({ ...p, footer: { ...p.footer, quick_links: links } }));
  };

  const addFooterLink = () => {
    updateFooterLinks([...(form.footer.quick_links || []), { label: "New Link", path: "/" }]);
  };

  const removeFooterLink = (idx: number) => {
    updateFooterLinks(form.footer.quick_links.filter((_: any, i: number) => i !== idx));
  };

  // ── Areas We Serve Helpers ──
  const updateAreas = (areas: { label: string; path: string }[]) => {
    setForm((p: any) => ({ ...p, footer: { ...p.footer, areas_we_serve: areas } }));
  };

  const addArea = () => {
    updateAreas([...(form.footer.areas_we_serve || []), { label: "New Area", path: "/" }]);
  };

  const removeArea = (idx: number) => {
    updateAreas((form.footer.areas_we_serve || []).filter((_: any, i: number) => i !== idx));
  };

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-heading font-bold text-foreground mb-2">Header & Footer</h1>
      <p className="text-muted-foreground mb-6">Customize your site's navigation, branding, and footer content.</p>

      <div className="space-y-8">
        {/* ═══════════ LOGO SECTION ═══════════ */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-primary" />
              Logo Management
            </CardTitle>
            <CardDescription>
              Upload your clinic logo. For best results use a transparent PNG.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Current Logo Preview */}
            <div className="bg-muted/50 rounded-xl p-6 flex flex-col items-center gap-4 border-2 border-dashed border-border">
              {logoPreview ? (
                <img
                  src={logoPreview}
                  alt="Current logo"
                  className="max-h-20 w-auto object-contain"
                  style={{ maxHeight: `${form.header?.logo_max_height || 48}px` }}
                />
              ) : (
                <div className="text-muted-foreground text-sm">No logo uploaded</div>
              )}
              <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="gap-2">
                <Upload className="h-4 w-4" />
                {uploading ? "Uploading..." : "Upload New Logo"}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/svg+xml,image/webp,image/jpeg"
                className="hidden"
                onChange={handleLogoUpload}
              />
            </div>

            {/* Logo Analysis */}
            {logoAnalysis && (
              <div className="bg-secondary/50 rounded-lg p-4 text-sm space-y-1">
                <p className="font-medium text-foreground">📐 Logo Analysis</p>
                <p>Dimensions: {logoAnalysis.width} × {logoAnalysis.height}px</p>
                <p>Aspect Ratio: {logoAnalysis.ratio}</p>
                <p>File Size: {logoAnalysis.sizeKB}KB</p>
                {logoAnalysis.width > LOGO_GUIDELINES.maxWidth && (
                  <p className="text-amber-600 flex items-center gap-1">
                    <AlertTriangle className="h-3.5 w-3.5" /> Width exceeds {LOGO_GUIDELINES.maxWidth}px — will be auto-resized
                  </p>
                )}
                {(logoAnalysis.width / logoAnalysis.height) < 2 && (
                  <p className="text-amber-600 flex items-center gap-1">
                    <AlertTriangle className="h-3.5 w-3.5" /> Ratio is narrow. Ideal is {LOGO_GUIDELINES.idealRatio} for header fit
                  </p>
                )}
              </div>
            )}

            {/* Guidelines */}
            <div className="bg-primary/5 rounded-lg p-4 text-sm space-y-1 border border-primary/10">
              <p className="font-medium text-foreground">💡 Logo Guidelines</p>
              <p>• Max dimensions: {LOGO_GUIDELINES.maxWidth} × {LOGO_GUIDELINES.maxHeight}px</p>
              <p>• Ideal aspect ratio: {LOGO_GUIDELINES.idealRatio}</p>
              <p>• Formats: {LOGO_GUIDELINES.formats}</p>
              <p>• Max file size: {LOGO_GUIDELINES.maxFileSize} (auto-compressed)</p>
            </div>

            {/* Logo Display Height */}
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Logo Display Height (px)
              </label>
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  min={24}
                  max={120}
                  value={form.header?.logo_max_height || 48}
                  onChange={(e) =>
                    setForm((p: any) => ({
                      ...p,
                      header: { ...p.header, logo_max_height: Number(e.target.value) },
                    }))
                  }
                  className="w-24"
                />
                <span className="text-sm text-muted-foreground">Recommended: 40–60px</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ═══════════ HEADER SECTION ═══════════ */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Navigation className="h-5 w-5 text-primary" />
              Header Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Top Bar Toggle */}
            <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
              <div>
                <p className="font-medium text-sm">Show Top Info Bar</p>
                <p className="text-xs text-muted-foreground">Displays address, hours, and phone above the main header</p>
              </div>
              <Switch
                checked={form.header?.show_top_bar ?? true}
                onCheckedChange={(v) =>
                  setForm((p: any) => ({ ...p, header: { ...p.header, show_top_bar: v } }))
                }
              />
            </div>

            {/* CTA Button */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-foreground">Call-to-Action Button</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Button Text</label>
                  <Input
                    value={form.header?.cta_text || ""}
                    onChange={(e) =>
                      setForm((p: any) => ({ ...p, header: { ...p.header, cta_text: e.target.value } }))
                    }
                    placeholder="Book Appointment"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">WhatsApp Message</label>
                  <Input
                    value={form.header?.cta_message || ""}
                    onChange={(e) =>
                      setForm((p: any) => ({ ...p, header: { ...p.header, cta_message: e.target.value } }))
                    }
                    placeholder="Hi, I would like to book an appointment."
                  />
                </div>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">Navigation Links</p>
                <Button variant="outline" size="sm" onClick={addNavLink} className="gap-1">
                  <Plus className="h-3.5 w-3.5" /> Add Link
                </Button>
              </div>
              <div className="space-y-2">
                {(form.header?.nav_links || []).map((link: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-2 bg-secondary/20 rounded-lg p-2">
                    <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <Input
                      value={link.label}
                      onChange={(e) => {
                        const updated = [...form.header.nav_links];
                        updated[idx] = { ...updated[idx], label: e.target.value };
                        updateNavLinks(updated);
                      }}
                      placeholder="Label"
                      className="flex-1"
                    />
                    <Input
                      value={link.path}
                      onChange={(e) => {
                        const updated = [...form.header.nav_links];
                        updated[idx] = { ...updated[idx], path: e.target.value };
                        updateNavLinks(updated);
                      }}
                      placeholder="/path"
                      className="flex-1"
                    />
                    <Button variant="ghost" size="icon" onClick={() => removeNavLink(idx)} className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <Button onClick={() => saveSection("header")} className="gap-2" disabled={updateSetting.isPending}>
              <Save className="h-4 w-4" /> Save Header Settings
            </Button>
          </CardContent>
        </Card>

        {/* ═══════════ FOOTER SECTION ═══════════ */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Footprints className="h-5 w-5 text-primary" />
              Footer Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Layout Style */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Footer Layout</label>
              <div className="grid grid-cols-3 gap-3">
                {(["standard", "minimal", "centered"] as const).map((layout) => (
                  <button
                    key={layout}
                    onClick={() => setForm((p: any) => ({ ...p, footer: { ...p.footer, layout } }))}
                    className={`p-4 rounded-xl border-2 text-center text-sm font-medium transition-all ${
                      form.footer?.layout === layout
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border hover:border-primary/40"
                    }`}
                  >
                    <div className="text-xs text-muted-foreground mb-1">
                      {layout === "standard" && "4-column grid"}
                      {layout === "minimal" && "2-column simple"}
                      {layout === "centered" && "Centered stack"}
                    </div>
                    <span className="capitalize">{layout}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Section Toggles */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-foreground">Footer Sections</p>
              {[
                { key: "show_quick_links", label: "Quick Links", desc: "Navigation links column" },
                { key: "show_services", label: "Services List", desc: "Auto-populated from services" },
                { key: "show_contact", label: "Contact Info", desc: "Phone, email, address, hours" },
                { key: "show_areas_we_serve", label: "Areas We Serve", desc: "Collapsible list of local-SEO area pages" },
                { key: "show_social_icons", label: "Social Icons", desc: "Facebook, Instagram, YouTube links" },
              ].map((toggle) => (
                <div key={toggle.key} className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">{toggle.label}</p>
                    <p className="text-xs text-muted-foreground">{toggle.desc}</p>
                  </div>
                  <Switch
                    checked={form.footer?.[toggle.key] ?? true}
                    onCheckedChange={(v) =>
                      setForm((p: any) => ({ ...p, footer: { ...p.footer, [toggle.key]: v } }))
                    }
                  />
                </div>
              ))}
            </div>

            {/* Quick Links Editor */}
            {form.footer?.show_quick_links && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground flex items-center gap-2">
                    <LinkIcon className="h-4 w-4" /> Quick Links
                  </p>
                  <Button variant="outline" size="sm" onClick={addFooterLink} className="gap-1">
                    <Plus className="h-3.5 w-3.5" /> Add Link
                  </Button>
                </div>
                <div className="space-y-2">
                  {(form.footer?.quick_links || []).map((link: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-2 bg-secondary/20 rounded-lg p-2">
                      <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <Input
                        value={link.label}
                        onChange={(e) => {
                          const updated = [...form.footer.quick_links];
                          updated[idx] = { ...updated[idx], label: e.target.value };
                          updateFooterLinks(updated);
                        }}
                        placeholder="Label"
                        className="flex-1"
                      />
                      <Input
                        value={link.path}
                        onChange={(e) => {
                          const updated = [...form.footer.quick_links];
                          updated[idx] = { ...updated[idx], path: e.target.value };
                          updateFooterLinks(updated);
                        }}
                        placeholder="/path"
                        className="flex-1"
                      />
                      <Button variant="ghost" size="icon" onClick={() => removeFooterLink(idx)} className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Custom Copyright */}
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Custom Copyright Text</label>
              <Input
                value={form.footer?.custom_copyright || ""}
                onChange={(e) =>
                  setForm((p: any) => ({ ...p, footer: { ...p.footer, custom_copyright: e.target.value } }))
                }
                placeholder="Leave empty for default: © 2026 Clinic Name. All rights reserved."
              />
              <p className="text-xs text-muted-foreground mt-1">Year is auto-prepended. Leave blank for automatic text.</p>
            </div>

            <Button onClick={() => saveSection("footer")} className="gap-2" disabled={updateSetting.isPending}>
              <Save className="h-4 w-4" /> Save Footer Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminHeaderFooter;
