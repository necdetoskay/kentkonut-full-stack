import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Layout from './components/Layout'; // Layout'u içe aktar

// Page Components
import Index from './pages/Index';
import Hakkimizda from './pages/Hakkimizda';
import KurumsalPage from './pages/KurumsalPage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import HafriyatPage from './pages/Hafriyat';
import HafriyatDetay from './pages/HafriyatDetay';
import BizeUlasin from './pages/BizeUlasin';
import YoneticiDetailPage from './pages/YoneticiDetailPage';
import NotFound from './pages/NotFound';
import LogsPage from './pages/dashboard/logs';
import BirimlerPage from './pages/kurumsal/BirimlerPage';
import BirimDetayPage from './pages/kurumsal/BirimDetayPage'; // Yeni bileşeni içe aktar

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <HelmetProvider>
        <Routes>
          <Route path="/projeler/:slug" element={<ProjectDetailPage />} />
          <Route path="*" element={
            <Layout>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/hakkimizda" element={<Hakkimizda />} />
                <Route path="/kurumsal" element={<KurumsalPage />} />
                <Route path="/kurumsal/birimler" element={<BirimlerPage />} />
                <Route path="/kurumsal/birimler/:slug" element={<BirimDetayPage />} />
                <Route path="/projeler" element={<ProjectsPage />} />
                <Route path="/hafriyat" element={<HafriyatPage />} />
                <Route path="/hafriyat/:slug" element={<HafriyatDetay />} />
                <Route path="/bize-ulasin" element={<BizeUlasin />} />
                <Route path="/yonetici/:slug" element={<YoneticiDetailPage />} />
                <Route path="/:slug" element={<KurumsalPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          } />
        </Routes>
      </HelmetProvider>
    </BrowserRouter>
  );
};

export default App;