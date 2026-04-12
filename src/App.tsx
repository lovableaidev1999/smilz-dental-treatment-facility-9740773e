import { useEffect, lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import Layout from "@/components/Layout";
import ScrollToTop from "@/components/ScrollToTop";
import SmartPage from "@/components/SmartPage";

// Lazy-loaded public pages
const Home = lazy(() => import("@/pages/Home"));
const ServicesPage = lazy(() => import("@/pages/Services"));
const ServiceDetail = lazy(() => import("@/pages/ServiceDetail"));
const About = lazy(() => import("@/pages/About"));
const Contact = lazy(() => import("@/pages/Contact"));
const Gallery = lazy(() => import("@/pages/Gallery"));
const Blog = lazy(() => import("@/pages/Blog"));
const BlogPost = lazy(() => import("@/pages/BlogPost"));
const BlogPreview = lazy(() => import("@/pages/BlogPreview"));
const Referral = lazy(() => import("@/pages/Referral"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const VisualRenderer = lazy(() => import("@/components/builder/VisualRenderer"));
const Sitemap = lazy(() => import("@/pages/Sitemap"));
const BuiltPage = lazy(() => import("@/pages/BuiltPage"));

// Lazy-loaded admin pages
const AdminLogin = lazy(() => import("@/pages/admin/AdminLogin"));
const AdminLayout = lazy(() => import("@/pages/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
const AdminSettings = lazy(() => import("@/pages/admin/AdminSettings"));
const AdminPages = lazy(() => import("@/pages/admin/AdminPages"));
const AdminServices = lazy(() => import("@/pages/admin/AdminServices"));
const AdminServiceEdit = lazy(() => import("@/pages/admin/AdminServiceEdit"));
const AdminBlog = lazy(() => import("@/pages/admin/AdminBlog"));
const AdminBlogEdit = lazy(() => import("@/pages/admin/AdminBlogEdit"));
const AdminMedia = lazy(() => import("@/pages/admin/AdminMedia"));
const AdminGallery = lazy(() => import("@/pages/admin/AdminGallery"));
const AdminReviews = lazy(() => import("@/pages/admin/AdminReviews"));
const AdminMigrateImages = lazy(() => import("@/pages/admin/AdminMigrateImages"));
const AdminHeaderFooter = lazy(() => import("@/pages/admin/AdminHeaderFooter"));
const AdminResetPassword = lazy(() => import("@/pages/admin/AdminResetPassword"));
const AdminPageBuilder = lazy(() => import("@/pages/admin/AdminPageBuilder"));
const AdminPageLayouts = lazy(() => import("@/pages/admin/AdminPageLayouts"));
const PagePreview = lazy(() => import("@/pages/admin/PagePreview"));

// WordPress date-URL redirect helper
const WpDateRedirect = () => {
  const { slug } = useParams<{ slug: string }>();
  return <Navigate to={`/blog/${slug}`} replace />;
};

const FONT_IMPORT_MAP: Record<string, string> = {
  "Playfair Display": "Playfair+Display",
  "Cormorant Garamond": "Cormorant+Garamond",
  "Open Sans": "Open+Sans",
};

const FontApplier = () => {
  const { data: settings } = useSiteSettings();
  const font = settings?.appearance?.font_family || "Poppins";

  useEffect(() => {
    const fontParam = FONT_IMPORT_MAP[font] || font.replace(/ /g, "+");
    const linkId = "dynamic-font-link";
    let link = document.getElementById(linkId) as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.id = linkId;
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
    link.href = `https://fonts.googleapis.com/css2?family=${fontParam}:wght@400;500;600;700&display=swap`;
    document.documentElement.style.setProperty("--app-font", `'${font}', sans-serif`);
  }, [font]);

  return null;
};

const RecoveryRouteHandler = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.pathname === "/admin/reset-password") return;

    const search = new URLSearchParams(location.search);
    const hash = new URLSearchParams(location.hash.startsWith("#") ? location.hash.slice(1) : location.hash);
    const hasRecoveryPayload =
      !!search.get("code") ||
      (!!search.get("token_hash") && search.get("type") === "recovery") ||
      (!!hash.get("access_token") && !!hash.get("refresh_token")) ||
      hash.get("type") === "recovery";

    if (hasRecoveryPayload) {
      navigate(
        {
          pathname: "/admin/reset-password",
          search: location.search,
          hash: location.hash,
        },
        { replace: true },
      );
    }
  }, [location.hash, location.pathname, location.search, navigate]);

  return null;
};

const PageFallback = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="animate-pulse text-muted-foreground text-sm">Loading...</div>
  </div>
);

// Smart wrapper for service detail pages – checks for a visual builder layout
const ServiceDetailSmart = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const slug = `service-${serviceId}`;

  const { data: layout, isLoading: layoutLoading } = useQuery({
    queryKey: ['page_layouts', slug, 'published'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('page_layouts')
        .select('*')
        .eq('page_slug', slug)
        .eq('is_published', true)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!serviceId,
  });

  if (layoutLoading) return <PageFallback />;

  if (layout?.layout_json?.length > 0) {
    return (
      <Suspense fallback={<PageFallback />}>
        <VisualRenderer layout={layout.layout_json} />
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<PageFallback />}>
      <ServiceDetail />
    </Suspense>
  );
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <FontApplier />
        <TooltipProvider>
          <Toaster />
          <Sonner />
            <BrowserRouter>
            <ScrollToTop />
            <RecoveryRouteHandler />
            <Suspense fallback={<PageFallback />}>
              <Routes>
                {/* Public routes */}
                <Route element={<Layout />}>
                  <Route path="/" element={<SmartPage slug="home" fallback={Home} />} />
                  <Route path="/services" element={<SmartPage slug="services" fallback={ServicesPage} />} />
                  <Route path="/services/:serviceId" element={<ServiceDetailSmart />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<SmartPage slug="contact" fallback={Contact} />} />
                  <Route path="/gallery" element={<SmartPage slug="gallery" fallback={Gallery} />} />
                  <Route path="/blog" element={<SmartPage slug="blog" fallback={Blog} />} />
                  <Route path="/blog/:slug" element={<BlogPost />} />
                  <Route path="/preview/blog/:id" element={<BlogPreview />} />
                  <Route path="/referral" element={<Referral />} />
                  <Route path="/p/:slug" element={<BuiltPage />} />
                </Route>

                {/* WordPress date-based URL redirects */}
                <Route path="/:year/:month/:slug" element={<WpDateRedirect />} />
                <Route path="/:year/:month/:day/:slug" element={<WpDateRedirect />} />

                {/* Sitemap */}
                <Route path="/sitemap.xml" element={<Sitemap />} />

                {/* Admin routes */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin/reset-password" element={<AdminResetPassword />} />
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="settings" element={<AdminSettings />} />
                  <Route path="pages" element={<AdminPages />} />
                  <Route path="services" element={<AdminServices />} />
                  <Route path="services/:id" element={<AdminServiceEdit />} />
                  <Route path="blog" element={<AdminBlog />} />
                  <Route path="blog/:id" element={<AdminBlogEdit />} />
                  <Route path="media" element={<AdminMedia />} />
                  <Route path="gallery" element={<AdminGallery />} />
                  <Route path="reviews" element={<AdminReviews />} />
                  <Route path="migrate" element={<AdminMigrateImages />} />
                  <Route path="header-footer" element={<AdminHeaderFooter />} />
                  <Route path="page-layouts" element={<AdminPageLayouts />} />
                </Route>
                {/* Full-screen page builder & preview (outside admin sidebar layout) */}
                <Route path="/admin/page-builder/new" element={<AdminPageBuilder />} />
                <Route path="/admin/page-builder/:id" element={<AdminPageBuilder />} />
                <Route path="/admin/preview/:id" element={<PagePreview />} />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
