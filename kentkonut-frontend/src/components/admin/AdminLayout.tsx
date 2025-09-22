import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface NavItem {
  name: string;
  href: string;
  icon: string;
  children?: NavItem[];
}

const navigation: NavItem[] = [
  { 
    name: 'Genel Bakış', 
    href: '/dashboard', 
    icon: '📊' 
  },
  { 
    name: 'Banner Yönetimi', 
    href: '/dashboard/banner-groups', 
    icon: '🖼️',
    children: [
      { name: 'Banner Grupları', href: '/dashboard/banner-groups', icon: '📁' },
      { name: 'Yeni Banner Ekle', href: '/dashboard/banner-groups/new', icon: '➕' },
    ]
  },
  { 
    name: 'Hafriyat Yönetimi', 
    href: '/dashboard/hafriyat', 
    icon: '🏔️',
    children: [
      { name: 'Hafriyat Sahaları', href: '/dashboard/hafriyat/sahalar', icon: '🏗️' },
      { name: 'Bölge Yönetimi', href: '/dashboard/hafriyat/bolgeler', icon: '🗺️' },
      { name: 'İstatistikler', href: '/dashboard/hafriyat/istatistikler', icon: '📈' },
      { name: 'Belge Kategorileri', href: '/dashboard/hafriyat/belge-kategorileri', icon: '📋' },
      { name: 'Resim Kategorileri', href: '/dashboard/hafriyat/resim-kategorileri', icon: '🖼️' },
    ]
  },
  { 
    name: 'Sayfalar', 
    href: '/dashboard/pages', 
    icon: '📄' 
  },
  { 
    name: 'Medya Kütüphanesi', 
    href: '/dashboard/media', 
    icon: '📚' 
  },
  { 
    name: 'İletişim', 
    href: '/dashboard/contact-info', 
    icon: '☎️',
    children: [
      { name: 'İletişim Bilgileri', href: '/dashboard/contact-info', icon: '📇' },
      { name: 'Geri Bildirimler', href: '/dashboard/feedback', icon: '💬' },
    ]
  },
  { 
    name: 'Kullanıcılar', 
    href: '/dashboard/users', 
    icon: '👥' 
  },
  { 
    name: 'Ayarlar', 
    href: '/dashboard/settings', 
    icon: '⚙️' 
  },
];

export function AdminLayout() {
  const location = useLocation();
  
  React.useEffect(() => {
    console.log('AdminLayout mounted');
    
    return () => {
      console.log('AdminLayout unmounted');
    };
  }, []);
  
  React.useEffect(() => {
    console.log('Current location:', location.pathname);
    console.log('Navigation items:', navigation);
  }, [location]);

  const filteredNavigation = React.useMemo(() => {
    console.log('Filtering navigation items');
    return navigation;
  }, [navigation]);
  
  if (process.env.NODE_ENV === 'development') {
    console.log('AdminLayout is rendering with navigation:', navigation);
  }

  return (
    <div className="flex min-h-screen bg-gray-50 relative">
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-0 left-0 right-0 bg-red-600 text-white text-center py-2 text-sm font-bold z-50">
          ADMIN LAYOUT ACTIVE - {navigation.length} NAVIGATION ITEMS
        </div>
      )}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-bold z-50">
          AdminLayout Active
        </div>
      )}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64 border-r border-gray-200 bg-white">
          <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <h1 className="text-xl font-bold text-gray-900">Yönetim Paneli</h1>
            </div>
            <div className="mt-5 flex-1 flex flex-col">
              <nav className="flex-1 px-2 space-y-1 bg-white overflow-y-auto">
                {navigation.map((item) => (
                  <div key={item.name} className="space-y-1">
                    <Link
                      to={item.href}
                      className={cn(
                        location.pathname === item.href || 
                        (item.children && item.children.some(child => 
                          location.pathname.startsWith(child.href)
                        ))
                          ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent',
                        'group flex items-center px-3 py-2 text-sm font-medium rounded-r-md'
                      )}
                    >
                      <span className="mr-3 text-lg">{item.icon}</span>
                      {item.name}
                    </Link>
                    {item.children && (
                      <div className="ml-8 space-y-1">
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            to={child.href}
                            className={cn(
                              location.pathname === child.href
                                ? 'bg-blue-50 text-blue-700 border-l-2 border-blue-600'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-l-2 border-transparent',
                              'group flex items-center px-3 py-1.5 text-xs font-medium rounded-r-md ml-1'
                            )}
                          >
                            <span className="mr-2 text-sm">{child.icon}</span>
                            {child.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </nav>
            </div>
            <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
              <div className="flex items-center">
                <div>
                  <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                    Admin Kullanıcı
                  </p>
                  <button className="text-xs font-medium text-gray-500 group-hover:text-gray-700">
                    Çıkış Yap
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto focus:outline-none">
        <main className="flex-1 relative pb-8 z-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
