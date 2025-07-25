import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { menuService } from '../services/menuService';
import { MenuItem } from '../types/menu';
import './Navbar.css';

interface NavbarProps {
  className?: string;
}

const Navbar = ({ className }: NavbarProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [menuLoading, setMenuLoading] = useState(true);
  const [menuError, setMenuError] = useState<string | null>(null);
  const [expandedMobileMenus, setExpandedMobileMenus] = useState<Set<string>>(new Set());

  // Load menu items from backend
  const loadMenuItems = async (bustCache: boolean = false) => {
    try {
      setMenuLoading(true);
      setMenuError(null);
      console.log('🔍 Loading dynamic menu items...');

      const items = await menuService.getMainMenuItems(bustCache);
      const activeItems = menuService.filterActiveMenuItems(items);

      setMenuItems(activeItems);
      console.log('✅ Dynamic menu items loaded:', activeItems.length);

      // Debug hierarchical menu structure
      activeItems.forEach(item => {
        if (item.children && item.children.length > 0) {
          console.log(`📁 Parent menu "${item.title}" has ${item.children.length} children:`,
            item.children.map(child => child.title));
        }
      });
    } catch (error) {
      console.error('❌ Error loading menu items:', error);
      setMenuError('Menü yüklenirken hata oluştu');

      // Fallback to static menu items
      const fallbackItems: MenuItem[] = [
        { id: '1', title: 'ANASAYFA', url: '/', isActive: true, isExternal: false, target: '_self', orderIndex: 1, menuLocation: 'main', createdAt: '', updatedAt: '' },
        { id: '2', title: 'HAKKIMIZDA', url: '/hakkimizda', isActive: true, isExternal: false, target: '_self', orderIndex: 2, menuLocation: 'main', createdAt: '', updatedAt: '' },
        { id: '3', title: 'KURUMSAL', url: '/kurumsal', isActive: true, isExternal: false, target: '_self', orderIndex: 3, menuLocation: 'main', createdAt: '', updatedAt: '' },
        { id: '4', title: 'PROJELERİMİZ', url: '/projeler', isActive: true, isExternal: false, target: '_self', orderIndex: 4, menuLocation: 'main', createdAt: '', updatedAt: '' },
        { id: '5', title: 'HAFRİYAT', url: '/hafriyat', isActive: true, isExternal: false, target: '_self', orderIndex: 5, menuLocation: 'main', createdAt: '', updatedAt: '' },
        { id: '6', title: 'BİZE ULAŞIN', url: '/bize-ulasin', isActive: true, isExternal: false, target: '_self', orderIndex: 6, menuLocation: 'main', createdAt: '', updatedAt: '' },
      ];
      setMenuItems(fallbackItems);
      console.log('⚠️ Using fallback menu items');
    } finally {
      setMenuLoading(false);
    }
  };

  useEffect(() => {
    loadMenuItems();
  }, []);

  // Manual refresh function for development
  const refreshMenu = () => {
    console.log('🔄 Manual menu refresh triggered');
    loadMenuItems(true);
  };

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Mobile menü açıkken body scroll'u engelle
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  // Escape key ile menüyü kapat
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isMobileMenuOpen]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setExpandedMobileMenus(new Set()); // Reset expanded menus when closing
  };

  const toggleMobileSubmenu = (menuId: string, hasChildren: boolean, event: React.MouseEvent) => {
    if (hasChildren) {
      event.preventDefault(); // Prevent navigation for parent items with children
      setExpandedMobileMenus(prev => {
        const newSet = new Set(prev);
        if (newSet.has(menuId)) {
          newSet.delete(menuId);
        } else {
          newSet.add(menuId);
        }
        return newSet;
      });
    }
  };

  const handleDesktopMenuClick = (item: MenuItem, event: React.MouseEvent) => {
    if (item.children && item.children.length > 0) {
      event.preventDefault(); // Prevent navigation for parent items with children
    }
  };

  const handleKeyDown = (item: MenuItem, event: React.KeyboardEvent) => {
    if (item.children && item.children.length > 0) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        // Focus on first child item
        const dropdown = event.currentTarget.parentElement?.querySelector('.navbar-dropdown a') as HTMLElement;
        dropdown?.focus();
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        const dropdown = event.currentTarget.parentElement?.querySelector('.navbar-dropdown a') as HTMLElement;
        dropdown?.focus();
      }
    }
  };

  // Dynamic menu items are loaded via useEffect above

  const socialLinks = [
    { href: 'https://youtube.com', icon: 'fab fa-youtube' },
    { href: 'https://facebook.com', icon: 'fab fa-facebook-f' },
    { href: 'https://instagram.com', icon: 'fab fa-instagram' },
  ];

  return (
    <header
      className="w-full"
      style={{
        position: 'absolute',
        zIndex: 50,
        top: 0,
        left: 0,
        right: 0,
      }}
    >
      {/* Enhanced gradient overlay for better readability over banner images */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-transparent h-[140px]"></div>
      
      <div className="flex relative">
        {/* Logo Kolonu - Responsive boyutlar */}
        <div className="bg-transparent h-[140px] flex items-center justify-center">
          <a href="/" className="block">
            <img 
              src="/images/logo.png" 
              alt="Kent Konut Logo" 
              className="logo-img"
            />
          </a>
        </div>
        
        {/* Desktop Menü ve Sosyal Medya Kısımları */}
        <div className="flex-1 flex flex-col h-[140px] hidden md:flex">
          <div className="h-[100px] bg-transparent flex items-center pt-3">
            <div className="flex-1 pl-12">
              <div className="flex justify-between items-center">
                {/* Menü öğeleri */}
                <nav className="flex">
                  <ul className="flex gap-x-7">
                    {menuLoading ? (
                      <li className="text-white text-xl font-medium uppercase">
                        Yükleniyor...
                      </li>
                    ) : menuError ? (
                      <li className="text-white text-xl font-medium uppercase">
                        Menü Hatası
                      </li>
                    ) : (
                      menuItems.map((item) => (
                        <li key={item.id} className="list-none relative group navbar-menu-item">
                          <a
                            href={menuService.getMenuItemUrl(item)}
                            target={menuService.getMenuItemTarget(item)}
                            onClick={(e) => handleDesktopMenuClick(item, e)}
                            onKeyDown={(e) => handleKeyDown(item, e)}
                            className={`navbar-menu-link text-white text-xl font-medium uppercase hover:opacity-80 drop-shadow-md transition-all flex items-center ${item.cssClass || ''}`}
                            title={item.description || item.title}
                            aria-haspopup={item.children && item.children.length > 0 ? "true" : "false"}
                            aria-expanded="false"
                            tabIndex={0}
                          >
                            {item.icon && <i className={`${item.icon} mr-2`}></i>}
                            {item.title}
                            {/* Visual indicator for parent items */}
                            {item.children && item.children.length > 0 && (
                              <i className="fas fa-chevron-down ml-2 text-sm chevron-rotate"></i>
                            )}
                          </a>
                          {/* Render children if any */}
                          {item.children && item.children.length > 0 && (
                            <ul className="navbar-dropdown absolute top-full left-0 bg-white shadow-xl rounded-lg py-3 min-w-56 opacity-0 invisible transition-all duration-300 border border-gray-200">
                              {item.children.map((child) => (
                                <li key={child.id} className="submenu-item">
                                  <a
                                    href={menuService.getMenuItemUrl(child)}
                                    target={menuService.getMenuItemTarget(child)}
                                    className="block px-5 py-3 text-gray-800 hover:bg-blue-50 hover:text-blue-600 transition-colors border-b border-gray-100 last:border-b-0"
                                    title={child.description || child.title}
                                  >
                                    {child.icon && <i className={`${child.icon} mr-3 text-blue-500`}></i>}
                                    <span className="font-medium">{child.title}</span>
                                  </a>
                                </li>
                              ))}
                            </ul>
                          )}
                        </li>
                      ))
                    )}
                  </ul>
                </nav>
                
                {/* Development menu refresh button */}
                {process.env.NODE_ENV === 'development' && (
                  <button
                    onClick={refreshMenu}
                    className="text-white hover:opacity-80 w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-all mr-3"
                    title="Refresh Menu (Dev)"
                    aria-label="Refresh Menu"
                  >
                    <i className="fas fa-sync-alt text-sm"></i>
                  </button>
                )}

                {/* Sosyal medya ve telefon numarası */}
                <div className="flex items-center pr-6">
                  <div className="border-l border-white pl-4 flex items-center mr-4">
                    {socialLinks.map((social) => (
                      <a 
                        key={social.href}
                        href={social.href} 
                        className="text-white rounded-full border border-white w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-white hover:text-[#0b244c] transition-colors drop-shadow-md mx-1 opacity-85 hover:opacity-100"
                        aria-label={
                          social.icon.includes('youtube') ? 'YouTube hesabımız' :
                          social.icon.includes('facebook') ? 'Facebook hesabımız' :
                          social.icon.includes('instagram') ? 'Instagram hesabımız' :
                          'Sosyal medya'
                        }
                      >
                        <i className={social.icon} style={{ position: 'relative', top: '0' }}></i>
                      </a>
                    ))}
                  </div>
                  <a href="tel:0262 331 07 03" className="text-white text-2xl font-medium drop-shadow-md">
                    0262 331 07 03
                  </a>
                </div>
              </div>
            </div>
          </div>
          
          <div className="h-[40px] bg-transparent">
            <div className="w-full border-b border-white/30 opacity-85"></div>
          </div>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="md:hidden flex items-center justify-end pr-4 flex-1">
          <button
            onClick={toggleMobileMenu}
            className="text-white p-2 rounded-md hover:bg-white/10 transition-colors"
            aria-label="Toggle mobile menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={closeMobileMenu}
          />
          
          {/* Slide-out Menu */}
          <div className={`
            fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out md:hidden
            ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}
          `}>
            {/* Mobile Menu Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center">
                <img 
                  src="/images/logo.png" 
                  alt="Kent Konut Logo" 
                  className="h-8 w-auto"
                />
              </div>
              <button
                onClick={closeMobileMenu}
                className="text-gray-500 hover:text-gray-700 p-2 rounded-md hover:bg-gray-100 transition-colors"
                aria-label="Close mobile menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Mobile Menu Items */}
            <nav className="p-4">
              <ul className="space-y-2">
                {menuLoading ? (
                  <li className="py-3 px-4 text-gray-600">
                    Menü yükleniyor...
                  </li>
                ) : menuError ? (
                  <li className="py-3 px-4 text-red-600">
                    Menü yüklenirken hata oluştu
                  </li>
                ) : (
                  menuItems.map((item) => (
                    <li key={item.id}>
                      <div className="relative">
                        <a
                          href={menuService.getMenuItemUrl(item)}
                          target={menuService.getMenuItemTarget(item)}
                          onClick={(e) => {
                            const hasChildren = item.children && item.children.length > 0;
                            if (hasChildren) {
                              toggleMobileSubmenu(item.id, hasChildren, e);
                            } else {
                              closeMobileMenu();
                            }
                          }}
                          className={`flex items-center justify-between py-3 px-4 text-gray-800 hover:bg-gray-100 hover:text-[#0b244c] rounded-md transition-colors font-medium ${item.cssClass || ''}`}
                          title={item.description || item.title}
                          aria-haspopup={item.children && item.children.length > 0 ? "true" : "false"}
                          aria-expanded={expandedMobileMenus.has(item.id) ? "true" : "false"}
                        >
                          <span className="flex items-center">
                            {item.icon && <i className={`${item.icon} mr-3`}></i>}
                            {item.title}
                          </span>
                          {/* Visual indicator for parent items */}
                          {item.children && item.children.length > 0 && (
                            <i className={`fas fa-chevron-down text-sm transition-transform duration-200 ${
                              expandedMobileMenus.has(item.id) ? 'rotate-180' : ''
                            }`}></i>
                          )}
                        </a>

                        {/* Render mobile children if any */}
                        {item.children && item.children.length > 0 && (
                          <div className={`overflow-hidden transition-all duration-300 ${
                            expandedMobileMenus.has(item.id) ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                          }`}>
                            <ul className="ml-6 mt-2 space-y-1 border-l-2 border-gray-200 pl-4">
                              {item.children.map((child) => (
                                <li key={child.id}>
                                  <a
                                    href={menuService.getMenuItemUrl(child)}
                                    target={menuService.getMenuItemTarget(child)}
                                    onClick={closeMobileMenu}
                                    className="block py-2 px-3 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-md transition-colors text-sm font-medium"
                                    title={child.description || child.title}
                                  >
                                    {child.icon && <i className={`${child.icon} mr-2 text-blue-500`}></i>}
                                    {child.title}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </nav>

            {/* Mobile Social Links */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex justify-center space-x-4 mb-4">
                {socialLinks.map((social) => (
                  <a 
                    key={social.href}
                    href={social.href} 
                    className="text-gray-600 hover:text-[#0b244c] w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                    aria-label={
                      social.icon.includes('youtube') ? 'YouTube hesabımız' :
                      social.icon.includes('facebook') ? 'Facebook hesabımız' :
                      social.icon.includes('instagram') ? 'Instagram hesabımız' :
                      'Sosyal medya'
                    }
                  >
                    <i className={`${social.icon} text-xl`}></i>
                  </a>
                ))}
              </div>
              
              {/* Mobile Phone Number */}
              <div className="text-center">
                <a 
                  href="tel:0262 331 07 03" 
                  className="text-[#0b244c] font-semibold text-lg hover:underline"
                >
                  0262 331 07 03
                </a>
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
};

export default Navbar;
