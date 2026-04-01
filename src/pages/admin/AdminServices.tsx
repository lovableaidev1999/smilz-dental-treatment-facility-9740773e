import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Eye, EyeOff, GripVertical, Database } from "lucide-react";
import { seedServices } from "@/lib/seedServices";

const AdminServices = () => {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [seeding, setSeeding] = useState(false);

  const { data: services, isLoading } = useQuery({
    queryKey: ["admin_services"],
    queryFn: async () => {
      const { data, error } = await supabase.from("services").select("*").order("sort_order");
      if (error) throw error;
      return data;
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

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const result = await seedServices();
      qc.invalidateQueries({ queryKey: ["admin_services"] });
      qc.invalidateQueries({ queryKey: ["services"] });
      toast({ title: "Services seeded!", description: `${result.count} services added/updated from smilz.net data.` });
    } catch (err: any) {
      toast({ title: "Seed error", description: err.message, variant: "destructive" });
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading font-bold text-foreground">Services</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2" onClick={handleSeed} disabled={seeding}>
            <Database className="h-4 w-4" /> {seeding ? "Seeding..." : "Seed from Website"}
          </Button>
          <Button asChild className="gap-2">
            <Link to="/admin/services/new"><Plus className="h-4 w-4" /> Add Service</Link>
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-secondary rounded-lg animate-pulse" />)}</div>
      ) : (
        <div className="space-y-2">
          {(services ?? []).map((s) => (
            <Card key={s.id} className={!s.is_active ? "opacity-60" : ""}>
              <CardContent className="p-4 flex items-center gap-4">
                <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
                {s.featured_image && (
                  <img src={s.featured_image} alt={s.title} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{s.title}</p>
                  <p className="text-sm text-muted-foreground truncate">{s.short_desc}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost" size="icon"
                    onClick={() => toggleMutation.mutate({ id: s.id, is_active: !s.is_active })}
                    title={s.is_active ? "Deactivate" : "Activate"}
                  >
                    {s.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </Button>
                  <Button variant="ghost" size="icon" asChild>
                    <Link to={`/admin/services/${s.id}`}><Edit className="h-4 w-4" /></Link>
                  </Button>
                  <Button
                    variant="ghost" size="icon"
                    onClick={() => { if (confirm("Delete this service?")) deleteMutation.mutate(s.id); }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {(services ?? []).length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p className="mb-4">No services yet. Click "Seed from Website" to import all services from smilz.net.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminServices;
