import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Suspense, lazy } from 'react';
import Navbar from "./components/Navbar";
import "./styles/tiptap-render.css";

const Index = lazy(() => import("./pages/Index"));
const ProjectsPage = lazy(() => import("./pages/ProjectsPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Hakkimizda = lazy(() => import("./pages/Hakkimizda"));
const BannerTest = lazy(() => import("./pages/BannerTest"));
const BannerAPITest = lazy(() => import("./debug/BannerAPITest").then(mod => ({ default: mod.BannerAPITest })));
const ServiceCardAPITest = lazy(() => import("./debug/ServiceCardAPITest"));
const ServiceCardCenteringDemo = lazy(() => import("./debug/ServiceCardCenteringDemo"));
const Haberler = lazy(() => import("./pages/haberler"));
const HaberDetay = lazy(() => import("./pages/haberler/[slug]"));
const AdminLayout = lazy(() => import("./components/admin/AdminLayout").then(mod => ({ default: mod.AdminLayout })));
const BannerGroupsPage = lazy(() => import("./modules/banner-groups/pages/BannerGroupListPage"));
const NewBannerGroupPage = lazy(() => import("./modules/banner-groups/pages/NewBannerGroupPage"));
const EditBannerGroupPage = lazy(() => import("./modules/banner-groups/pages/EditBannerGroupPage"));
const BannerGroupDetailPage = lazy(() => import("./modules/banner-groups/pages/BannerGroupDetailPage"));
const BannerListPage = lazy(() => import("./modules/banner-groups/pages/banners/BannerListPage"));
const NewBannerPage = lazy(() => import("./modules/banner-groups/pages/banners/NewBannerPage"));
const EditBannerPage = lazy(() => import("./modules/banner-groups/pages/banners/EditBannerPage"));

// Development modunda bağlantı testi
if ((import.meta as any).env?.DEV) {
  import('./utils/connectionTest');
  import('./utils/debugApiTest');
  import('./utils/verifyIntegration');
  import('./utils/testServiceCardCentering');
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

const AppRoutesWithNavbar = () => {
  return (
    <>
      {/* Skip to content link for accessibility */}
      <a
        href="#main-content"
        className="skip-to-content-link"
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          background: '#fff',
          color: '#0b244c',
          padding: '8px 16px',
          zIndex: 1000,
          transform: 'translateY(-200%)',
          transition: 'transform 0.2s',
        }}
        onFocus={e => (e.currentTarget.style.transform = 'translateY(0)')}
        onBlur={e => (e.currentTarget.style.transform = 'translateY(-200%)')}
      >
        Ana içeriğe atla
      </a>
      <Navbar />
      <main id="main-content" tabIndex={-1}>
        <Suspense fallback={<div className="text-center py-20 text-gray-400">Yükleniyor...</div>}>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/projeler" element={<ProjectsPage />} />
            <Route path="/hakkimizda" element={<Hakkimizda />} />
            <Route path="/banner-test" element={<BannerTest />} />
            <Route path="/banner-api-test" element={<BannerAPITest />} />
            <Route path="/service-card-api-test" element={<ServiceCardAPITest />} />
            <Route path="/service-card-centering-demo" element={<ServiceCardCenteringDemo />} />
            <Route path="/haberler" element={<Haberler />} />
            <Route path="/haberler/:slug" element={<HaberDetay />} />
            {/* Admin routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="/dashboard/banner-groups" replace />} />
              <Route path="*" element={<Navigate to="/dashboard/banner-groups" replace />} />
            </Route>
            {/* Dashboard routes */}
            <Route path="/dashboard">
              <Route path="banner-groups">
                <Route index element={<BannerGroupsPage />} />
                <Route path="new" element={<NewBannerGroupPage />} />
                <Route path=":id" element={<BannerGroupDetailPage />} />
                <Route path=":id/edit" element={<EditBannerGroupPage />} />
                <Route path=":id/banners">
                  <Route index element={<BannerListPage />} />
                  <Route path="new" element={<NewBannerPage />} />
                  <Route path=":bannerId/edit" element={<EditBannerPage />} />
                </Route>
              </Route>
            </Route>
            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <AppRoutesWithNavbar />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
