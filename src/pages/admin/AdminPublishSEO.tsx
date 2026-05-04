import { useEffect, useState } from "react";
import { Rocket, ExternalLink, Clock, AlertTriangle, CheckCircle2, Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const COOLDOWN_MS = 5 * 60 * 1000; // 5 min
const STORAGE_KEY = "smilz_last_publish_at";

const AdminPublishSEO = () => {
  const { toast } = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isTriggering, setIsTriggering] = useState(false);
  const [isTriggeringSitemap, setIsTriggeringSitemap] = useState(false);
  const [lastTriggeredAt, setLastTriggeredAt] = useState<number | null>(null);
  const [actionsUrl, setActionsUrl] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v) setLastTriggeredAt(Number(v));
    const i = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(i);
  }, []);

  const cooldownRemaining = lastTriggeredAt
    ? Math.max(0, COOLDOWN_MS - (now - lastTriggeredAt))
    : 0;
  const isOnCooldown = cooldownRemaining > 0;

  const formatCooldown = (ms: number) => {
    const s = Math.ceil(ms / 1000);
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${m}:${r.toString().padStart(2, "0")}`;
  };

  const handleTrigger = async () => {
    setConfirmOpen(false);
    setIsTriggering(true);
    try {
      // supabase.functions.invoke automatically sends the logged-in admin's
      // session token in the Authorization header. The edge function uses
      // that to verify the caller is a real authenticated user.
      const { data, error } = await supabase.functions.invoke("trigger-rebuild", {
        body: {},
      });

      if (error) {
        throw new Error(error.message || "Request failed");
      }
      if (data?.error) {
        throw new Error(data.error);
      }

      const ts = Date.now();
      localStorage.setItem(STORAGE_KEY, String(ts));
      setLastTriggeredAt(ts);
      setActionsUrl(data?.actionsUrl ?? null);

      toast({
        title: "Rebuild triggered ✓",
        description:
          "GitHub Actions is rebuilding the static site. Allow ~20–30 min for changes to appear on smilz.net.",
      });
    } catch (err: any) {
      toast({
        title: "Trigger failed",
        description: err?.message || "Could not start the rebuild.",
        variant: "destructive",
      });
    } finally {
      setIsTriggering(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-bold text-foreground">
          Publish to SEO
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Push your latest CMS changes to the live SEO/static version of the
          website.
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5 text-primary" />
            One-click publish
          </CardTitle>
          <CardDescription>
            Triggers a full rebuild on GitHub Actions: React build → sitemap →
            prerender every page → incremental FTP upload to Hostinger.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="rounded-lg bg-secondary p-4 text-sm space-y-2">
            <div className="flex gap-2 items-start">
              <Clock className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
              <span>
                <strong>~20–30 minutes</strong> from click to live. Only changed
                HTML files are uploaded.
              </span>
            </div>
            <div className="flex gap-2 items-start">
              <AlertTriangle className="h-4 w-4 mt-0.5 text-dental-gold shrink-0" />
              <span>
                A 5-minute cooldown prevents accidental double-triggers.
              </span>
            </div>
          </div>

          <Button
            size="lg"
            className="w-full bg-dental-green hover:bg-dental-green/90 text-white"
            disabled={isTriggering || isOnCooldown}
            onClick={() => setConfirmOpen(true)}
          >
            <Rocket className="h-5 w-5 mr-2" />
            {isTriggering
              ? "Triggering..."
              : isOnCooldown
                ? `Wait ${formatCooldown(cooldownRemaining)}`
                : "Publish to SEO"}
          </Button>

          {lastTriggeredAt && (
            <div className="text-xs text-muted-foreground flex items-center justify-between border-t pt-3">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-dental-green" />
                Last triggered:{" "}
                {new Date(lastTriggeredAt).toLocaleString("en-IN", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </span>
              {actionsUrl && (
                <a
                  href={actionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                  View build progress <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Map className="h-5 w-5 text-primary" />
            Update sitemap.xml only
          </CardTitle>
          <CardDescription>
            Faster than a full rebuild — regenerates <code>sitemap.xml</code> from
            current published services / pages / blog posts and uploads only that
            file. Use this after slug or SEO changes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            size="lg"
            variant="outline"
            className="w-full"
            disabled={isTriggeringSitemap}
            onClick={async () => {
              setIsTriggeringSitemap(true);
              try {
                const { data, error } = await supabase.functions.invoke(
                  "trigger-sitemap-rebuild",
                  { body: {} },
                );
                if (error) throw new Error(error.message || "Request failed");
                if (data?.error) throw new Error(data.error);
                toast({
                  title: "Sitemap rebuild triggered ✓",
                  description:
                    "GitHub Actions is regenerating sitemap.xml and uploading it (~2–3 min).",
                });
                if (data?.actionsUrl) setActionsUrl(data.actionsUrl);
              } catch (err: any) {
                toast({
                  title: "Trigger failed",
                  description: err?.message || "Could not start the sitemap rebuild.",
                  variant: "destructive",
                });
              } finally {
                setIsTriggeringSitemap(false);
              }
            }}
          >
            <Map className="h-5 w-5 mr-2" />
            {isTriggeringSitemap ? "Triggering..." : "Update sitemap.xml & deploy"}
          </Button>
        </CardContent>
      </Card>


        <CardHeader>
          <CardTitle className="text-base">What gets rebuilt?</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>Every click rebuilds the entire static site, including:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Home, Services, About, Contact, Blog, Gallery</li>
            <li>All service detail pages</li>
            <li>All published blog posts</li>
            <li>SEO landing pages and builder-created pages</li>
            <li>Updated <code>sitemap.xml</code></li>
          </ul>
          <p className="pt-2">
            The CMS-driven version on <code>lovable.app</code> updates instantly
            without this step — this button only refreshes the prerendered
            <code> smilz.net</code> static mirror used for SEO.
          </p>
        </CardContent>
      </Card>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Trigger SEO rebuild?</DialogTitle>
            <DialogDescription>
              This will rebuild ~80 pages and take roughly 20–30 minutes to
              appear on smilz.net. Continue?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-dental-green hover:bg-dental-green/90 text-white"
              onClick={handleTrigger}
            >
              Yes, publish now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPublishSEO;
