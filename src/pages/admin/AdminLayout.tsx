import { Navigate, Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard, Settings, FileText, Stethoscope, Image,
  Layers, LogOut, Menu, X, Star, ChevronLeft, PanelTop
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const navItems = [
  { label: "Dashboard", path: "/admin", icon: LayoutDashboard },
  { label: "Settings", path: "/admin/settings", icon: Settings },
  { label: "Header & Footer", path: "/admin/header-footer", icon: PanelTop },
  { label: "Pages", path: "/admin/pages", icon: Layers },
  { label: "Services", path: "/admin/services", icon: Stethoscope },
  { label: "Blog Posts", path: "/admin/blog", icon: FileText },
  { label: "Gallery", path: "/admin/gallery", icon: Image },
  { label: "Reviews", path: "/admin/reviews", icon: Star },
  { label: "Media Library", path: "/admin/media", icon: Image },
];

const AdminLayout = () => {
  const { user, loading, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) return <Navigate to="/admin/login" replace />;

  return (
    <div className="min-h-screen flex bg-muted/30">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-primary text-primary-foreground transition-all duration-300 ${
          sidebarOpen ? "w-64" : "w-0 lg:w-16"
        } overflow-hidden`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b border-primary-foreground/20">
          {sidebarOpen && (
            <Link to="/admin" className="font-heading font-bold text-lg">
              Smilz CMS
            </Link>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 hover:bg-primary-foreground/10 rounded">
            {sidebarOpen ? <ChevronLeft className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
          {navItems.map((item) => {
            const active = location.pathname === item.path || (item.path !== "/admin" && location.pathname.startsWith(item.path + "/"));
            const isExactDash = item.path === "/admin" && location.pathname === "/admin";
            const isActive = item.path === "/admin" ? isExactDash : active;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground"
                }`}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-primary-foreground/20 space-y-2">
          <Link
            to="/"
            target="_blank"
            className="flex items-center gap-2 text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors px-3 py-2"
          >
            {sidebarOpen && "View Website →"}
          </Link>
          <button
            onClick={signOut}
            className="flex items-center gap-2 text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors px-3 py-2 w-full"
          >
            <LogOut className="h-4 w-4" />
            {sidebarOpen && "Sign Out"}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-0 lg:ml-16"}`}>
        {/* Top bar */}
        <header className="sticky top-0 z-40 bg-card border-b border-border px-6 py-3 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 rounded hover:bg-secondary">
            <Menu className="h-5 w-5" />
          </button>
          <div className="text-sm text-muted-foreground">
            Logged in as <span className="font-medium text-foreground">{user.email}</span>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to="/" target="_blank">View Site</Link>
          </Button>
        </header>

        {/* Page content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
