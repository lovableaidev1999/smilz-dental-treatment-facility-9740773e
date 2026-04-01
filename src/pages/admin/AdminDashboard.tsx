import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Stethoscope, FileText, Image, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AdminDashboard = () => {
  const { data: stats } = useQuery({
    queryKey: ["admin_stats"],
    queryFn: async () => {
      const [services, blogs, gallery, media] = await Promise.all([
        supabase.from("services").select("id", { count: "exact", head: true }),
        supabase.from("blog_posts").select("id", { count: "exact", head: true }),
        supabase.from("gallery").select("id", { count: "exact", head: true }),
        supabase.from("media_library").select("id", { count: "exact", head: true }).then(r => r).catch(() => ({ count: 0 })),
      ]);
      return {
        services: services.count ?? 0,
        blogs: blogs.count ?? 0,
        gallery: gallery.count ?? 0,
        media: (media as any).count ?? 0,
      };
    },
  });

  const cards = [
    { title: "Services", count: stats?.services ?? "–", icon: Stethoscope, color: "text-primary" },
    { title: "Blog Posts", count: stats?.blogs ?? "–", icon: FileText, color: "text-dental-teal" },
    { title: "Gallery Items", count: stats?.gallery ?? "–", icon: Image, color: "text-dental-gold" },
    { title: "Media Files", count: stats?.media ?? "–", icon: Image, color: "text-dental-green" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-heading font-bold text-foreground mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((c) => (
          <Card key={c.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{c.title}</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{c.count}</p>
                </div>
                <c.icon className={`h-10 w-10 ${c.color} opacity-50`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Add Service", href: "/admin/services/new" },
            { label: "New Blog Post", href: "/admin/blog/new" },
            { label: "Upload Media", href: "/admin/media" },
            { label: "Edit Settings", href: "/admin/settings" },
          ].map((a) => (
            <a key={a.label} href={a.href} className="bg-secondary text-secondary-foreground text-center py-3 rounded-lg text-sm font-medium hover:bg-primary hover:text-primary-foreground transition-colors">
              {a.label}
            </a>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
