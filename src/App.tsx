import { useEffect } from "react";
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
import Home from "@/pages/Home";
import ServicesPage from "@/pages/Services";
import ServiceDetail from "@/pages/ServiceDetail";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import Gallery from "@/pages/Gallery";
import Blog from "@/pages/Blog";
import BlogPost from "@/pages/BlogPost";
import BlogPreview from "@/pages/BlogPreview";
import Referral from "@/pages/Referral";
import NotFound from "@/pages/NotFound";
import Sitemap from "@/pages/Sitemap";

// WordPress date-URL redirect helper
const WpDateRedirect = () => {
  const { slug } = useParams<{ slug: string }>();
  return <Navigate to={`/blog/${slug}`} replace />;
};

// Admin pages
import AdminLogin from "@/pages/admin/AdminLogin";
import AdminLayout from "@/pages/admin/AdminLayout";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminSettings from "@/pages/admin/AdminSettings";
import AdminPages from "@/pages/admin/AdminPages";
import AdminServices from "@/pages/admin/AdminServices";
import AdminServiceEdit from "@/pages/admin/AdminServiceEdit";
import AdminBlog from "@/pages/admin/AdminBlog";
import AdminBlogEdit from "@/pages/admin/AdminBlogEdit";
import AdminMedia from "@/pages/admin/AdminMedia";
import AdminGallery from "@/pages/admin/AdminGallery";
import AdminReviews from "@/pages/admin/AdminReviews";
import AdminMigrateImages from "@/pages/admin/AdminMigrateImages";
import AdminHeaderFooter from "@/pages/admin/AdminHeaderFooter";
import AdminResetPassword from "@/pages/admin/AdminResetPassword";
import AdminPageBuilder from "@/pages/admin/AdminPageBuilder";
import AdminPageLayouts from "@/pages/admin/AdminPageLayouts";
import BuiltPage from "@/pages/BuiltPage";

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
    link.href = `https://fonts.googleapis.com/css2?family=${fontParam}:wght@300;400;500;600;700;800&display=swap`;
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

const queryClient = new QueryClient();

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
            <Routes>
              {/* Public routes */}
              <Route element={<Layout />}>
                <Route path="/" element={<Home />} />
                <Route path="/services" element={<ServicesPage />} />
                <Route path="/services/:serviceId" element={<ServiceDetail />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/blog" element={<Blog />} />
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
              {/* Full-screen page builder (outside admin sidebar layout) */}
              <Route path="/admin/page-builder/new" element={<AdminPageBuilder />} />
              <Route path="/admin/page-builder/:id" element={<AdminPageBuilder />} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
