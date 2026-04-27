import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Eye, EyeOff, Save, Star, RefreshCw } from "lucide-react";

const AdminReviews = () => {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [newReview, setNewReview] = useState({ name: "", date: "", text: "", rating: 5, sort_order: 0 });

  const handleSync = async () => {
    setSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke("sync-google-reviews");
      if (error) throw error;
      toast({
        title: "Google reviews synced",
        description: `Fetched ${data?.fetched ?? 0}, upserted ${data?.upserted ?? 0}.`,
      });
      qc.invalidateQueries({ queryKey: ["admin_reviews"] });
    } catch (e: any) {
      toast({ title: "Sync failed", description: e?.message ?? "Unknown error", variant: "destructive" });
    } finally {
      setSyncing(false);
    }
  };

  const { data: reviews, isLoading } = useQuery({
    queryKey: ["admin_reviews"],
    queryFn: async () => {
      const { data, error } = await supabase.from("reviews").select("*").order("sort_order");
      if (error) { console.warn("reviews table not found:", error.message); return []; }
      return data;
    },
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("reviews").insert({ ...newReview, is_active: true });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin_reviews"] });
      setNewReview({ name: "", date: "", text: "", rating: 5, sort_order: 0 });
      setShowAdd(false);
      toast({ title: "Review added!" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("reviews").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin_reviews"] }); toast({ title: "Deleted" }); },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("reviews").update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin_reviews"] }),
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading font-bold text-foreground">Reviews</h1>
        <div className="flex gap-2">
          <Button onClick={handleSync} disabled={syncing} variant="outline" className="gap-2">
            <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Syncing..." : "Sync Google Reviews"}
          </Button>
          <Button onClick={() => setShowAdd(true)} className="gap-2"><Plus className="h-4 w-4" /> Add Review</Button>
        </div>
      </div>

      {showAdd && (
        <Card className="mb-6">
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-medium mb-1.5 block">Name</label><Input value={newReview.name} onChange={(e) => setNewReview({ ...newReview, name: e.target.value })} /></div>
              <div><label className="text-sm font-medium mb-1.5 block">Date</label><Input value={newReview.date} onChange={(e) => setNewReview({ ...newReview, date: e.target.value })} placeholder="Dec 2025" /></div>
            </div>
            <div><label className="text-sm font-medium mb-1.5 block">Review Text</label><Textarea value={newReview.text} onChange={(e) => setNewReview({ ...newReview, text: e.target.value })} rows={3} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-medium mb-1.5 block">Rating (1-5)</label><Input type="number" min={1} max={5} value={newReview.rating} onChange={(e) => setNewReview({ ...newReview, rating: Number(e.target.value) })} /></div>
              <div><label className="text-sm font-medium mb-1.5 block">Sort Order</label><Input type="number" value={newReview.sort_order} onChange={(e) => setNewReview({ ...newReview, sort_order: Number(e.target.value) })} /></div>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => addMutation.mutate()} className="gap-2"><Save className="h-4 w-4" /> Save</Button>
              <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-secondary rounded-lg animate-pulse" />)}</div>
      ) : (
        <div className="space-y-2">
          {(reviews ?? []).map((r) => (
            <Card key={r.id} className={!r.is_active ? "opacity-50" : ""}>
              <CardContent className="p-4 flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-foreground">{r.name}</p>
                    <span className="text-xs text-muted-foreground">{r.date}</span>
                    <div className="flex">{[...Array(r.rating)].map((_, i) => <Star key={i} className="h-3 w-3 fill-dental-gold text-dental-gold" />)}</div>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{r.text}</p>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => toggleMutation.mutate({ id: r.id, is_active: !r.is_active })}>
                    {r.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => { if (confirm("Delete?")) deleteMutation.mutate(r.id); }}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminReviews;
