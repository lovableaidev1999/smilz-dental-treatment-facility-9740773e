import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Eye, EyeOff, Calendar } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const AdminBlog = () => {
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: posts, isLoading } = useQuery({
    queryKey: ["admin_blog"],
    queryFn: async () => {
      const { data, error } = await supabase.from("blog_posts").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("blog_posts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin_blog"] });
      toast({ title: "Post deleted" });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_published }: { id: string; is_published: boolean }) => {
      const { error } = await supabase.from("blog_posts").update({ is_published }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin_blog"] });
      toast({ title: "Status updated" });
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading font-bold text-foreground">Blog Posts</h1>
        <Button asChild className="gap-2">
          <Link to="/admin/blog/new"><Plus className="h-4 w-4" /> New Post</Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-secondary rounded-lg animate-pulse" />)}</div>
      ) : (
        <div className="space-y-2">
          {(posts ?? []).map((p) => (
            <Card key={p.id} className={!p.is_published ? "opacity-70" : ""}>
              <CardContent className="p-4 flex items-center gap-4">
                {p.featured_image && (
                  <img src={p.featured_image} alt="" className="h-12 w-16 rounded object-cover flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground truncate">{p.title}</p>
                    <Badge variant={p.is_published ? "default" : "secondary"} className="text-[10px] shrink-0">
                      {p.is_published ? "Published" : "Draft"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                    <span className="capitalize bg-secondary px-2 py-0.5 rounded">{p.category}</span>
                    {p.published_at && (
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(p.published_at).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" onClick={() => toggleMutation.mutate({ id: p.id, is_published: !p.is_published })}
                    title={p.is_published ? "Unpublish (save as draft)" : "Publish"}>
                    {p.is_published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </Button>
                  <Button variant="ghost" size="icon" asChild>
                    <Link to={`/admin/blog/${p.id}`}><Edit className="h-4 w-4" /></Link>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete this blog post?</AlertDialogTitle>
                        <AlertDialogDescription>
                          "{p.title}" will be permanently deleted. This cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteMutation.mutate(p.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
          {posts?.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No blog posts yet. Create your first one!
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminBlog;
