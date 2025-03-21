import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { RootLayout } from "@/layouts/RootLayout";
import { AdminLayout } from "@/layouts/AdminLayout";
import Home from "@/pages/Home";
import Blog from "@/pages/Blog";
import BlogDetail from "@/pages/BlogDetail";
import Portfolio from "@/pages/Portfolio";
import PortfolioDetail from "@/pages/PortfolioDetail";
import About from "@/pages/About";
import Contact from "@/pages/Contact";

// Admin sayfaları
import AdminLogin from "@/pages/admin/AdminLogin";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminBlogList from "@/pages/admin/AdminBlogList";
import AdminBlogEdit from "@/pages/admin/AdminBlogEdit";
import AdminPortfolioList from "@/pages/admin/AdminPortfolioList";
import AdminPortfolioEdit from "@/pages/admin/AdminPortfolioEdit";
import AdminAbout from "@/pages/admin/AdminAbout";
import AdminContact from "@/pages/admin/AdminContact";
import AdminHome from "@/pages/admin/AdminHome";
import { Toaster } from "@/components/ui/sonner";
import Modal from "./components/Modal";
import AuthGuard from '@/components/AuthGuard';
import AdminUsers from "./pages/admin/AdminUsers";
import { NavbarSettings } from "./pages/admin/NavbarSettings";
import FooterSettings from "./pages/admin/FooterSettings";
import { HelmetProvider } from "react-helmet-async";

function App() {
  return (
    <HelmetProvider>
      <Router>
        <Modal />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<RootLayout />}>
            <Route index element={<Home />} />
            <Route path="blog" element={<Blog />} />
            <Route path="blog/:id" element={<BlogDetail />} />
            <Route path="portfolio" element={<Portfolio />} />
            <Route path="portfolio/:id" element={<PortfolioDetail />} />
            <Route path="about" element={<About />} />
            <Route path="contact" element={<Contact />} />
          </Route>

          {/* Auth Routes */}
          <Route path="/login" element={<AdminLogin />} />

          {/* Admin Routes */}
          <Route
            path="/admin/*"
            element={
              <AuthGuard requireAdmin>
                <AdminLayout />
              </AuthGuard>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="blog" element={<AdminBlogList />} />
            <Route path="blog/edit/:id?" element={<AdminBlogEdit />} />
            <Route path="portfolio" element={<AdminPortfolioList />} />
            <Route path="portfolio/edit/:id?" element={<AdminPortfolioEdit />} />
            <Route path="about" element={<AdminAbout />} />
            <Route path="contact" element={<AdminContact />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="home" element={<AdminHome />} />
            <Route path="navbar" element={<NavbarSettings />} />
            <Route path="footer" element={<FooterSettings />} />
          </Route>
        </Routes>
        <Toaster />
      </Router>
    </HelmetProvider>
  );
}

export default App;
