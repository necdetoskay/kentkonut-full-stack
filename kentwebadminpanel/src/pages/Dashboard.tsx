import React from 'react';
import { FiUsers, FiFileText, FiActivity, FiBell, FiSettings } from 'react-icons/fi';

const Dashboard: React.FC = () => {
  return (
    <div className="w-screen min-h-screen bg-slate-50">
      <div className="flex w-full relative">
        {/* Sidebar */}
        <div className="fixed h-full w-64 bg-white border-r border-slate-200 z-20">
          <div className="flex items-center h-16 px-6 border-b border-slate-200">
            <h1 className="text-xl font-bold text-blue-600">Kent Konut</h1>
          </div>
          <nav className="p-4 space-y-2">
            <a href="#" className="flex items-center px-4 py-2 text-blue-600 bg-blue-50 rounded-lg">
              <FiActivity className="w-5 h-5" />
              <span className="ml-3">Ana Sayfa</span>
            </a>
            <a href="#" className="flex items-center px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg">
              <FiUsers className="w-5 h-5" />
              <span className="ml-3">Hakkımızda</span>
            </a>
            <a href="#" className="flex items-center px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg">
              <FiFileText className="w-5 h-5" />
              <span className="ml-3">Projeler</span>
            </a>
            <a href="#" className="flex items-center px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg">
              <FiSettings className="w-5 h-5" />
              <span className="ml-3">İletişim</span>
            </a>
          </nav>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 ml-64 w-[calc(100vw-16rem)]">
          {/* Header */}
          <header className="fixed top-0 right-0 left-64 h-16 bg-white border-b border-slate-200 z-10">
            <div className="flex items-center justify-end h-full px-6">
              <div className="flex items-center space-x-4">
                <button className="text-slate-600 hover:text-slate-900">
                  <FiBell className="w-6 h-6" />
                </button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="pt-16 p-6 min-h-screen w-full">
            <div className="w-full">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Kent Konut</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Kaliteli ve güvenilir konut projeleri
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6 mb-6 sm:grid-cols-2 lg:grid-cols-3">
                {/* İstatistik Kartları */}
                <div className="bg-blue-600 rounded-lg p-6 text-white">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-blue-100">Tamamlanan Projeler</p>
                      <p className="text-3xl font-bold mt-1">12</p>
                    </div>
                    <FiUsers className="w-8 h-8 opacity-75" />
                  </div>
                  <a href="#" className="inline-block mt-4 text-sm text-blue-100 hover:text-white">
                    Tüm projeleri görüntüle →
                  </a>
                </div>

                <div className="bg-indigo-600 rounded-lg p-6 text-white">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-indigo-100">Devam Eden Projeler</p>
                      <p className="text-3xl font-bold mt-1">5</p>
                    </div>
                    <FiFileText className="w-8 h-8 opacity-75" />
                  </div>
                  <a href="#" className="inline-block mt-4 text-sm text-indigo-100 hover:text-white">
                    Detayları görüntüle →
                  </a>
                </div>

                <div className="bg-purple-600 rounded-lg p-6 text-white">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-purple-100">Mutlu Müşteriler</p>
                      <p className="text-3xl font-bold mt-1">1000+</p>
                    </div>
                    <FiActivity className="w-8 h-8 opacity-75" />
                  </div>
                  <a href="#" className="inline-block mt-4 text-sm text-purple-100 hover:text-white">
                    Referansları görüntüle →
                  </a>
                </div>
              </div>

              {/* Son Haberler */}
              <div className="bg-white rounded-lg border border-slate-200 w-full">
                <div className="px-6 py-4 border-b border-slate-200">
                  <h3 className="font-semibold text-slate-900">Son Haberler</h3>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <FiUsers className="w-5 h-5 text-blue-600" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">Yeni Proje Lansmanı</p>
                      <p className="text-sm text-slate-500">2 gün önce</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="p-2 bg-indigo-100 rounded-lg">
                        <FiFileText className="w-5 h-5 text-indigo-600" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">Yeni Konut Projeleri</p>
                      <p className="text-sm text-slate-500">1 hafta önce</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 