import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import Layout from "@/components/Layout";
import Home from "@/pages/Home";
import ServicesPage from "@/pages/Services";
import ServiceDetail from "@/pages/ServiceDetail";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import Gallery from "@/pages/Gallery";
import Blog from "@/pages/Blog";
import BlogPost from "@/pages/BlogPost";
import Referral from "@/pages/Referral";
import NotFound from "@/pages/NotFound";

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
import AdminResetPassword from "@/pages/admin/AdminResetPassword";

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
                <Route path="/referral" element={<Referral />} />
              </Route>

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
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
