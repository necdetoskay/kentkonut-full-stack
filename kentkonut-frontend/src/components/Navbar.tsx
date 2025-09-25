import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { menuService } from '../services/menuService';
import { pageBackgroundService } from '../services/pageBackgroundService';
import { MenuItem } from '../types/menu';
import './Navbar.css';

interface NavbarProps {
  className?: string;
  backgroundImage?: string;
}

const Navbar = ({ className, backgroundImage: propBackgroundImage }: NavbarProps) => {
  const location = useLocation();
  
  const [dynamicBackground, setDynamicBackground] = useState<string | null>(null);
  const defaultBackground = '/images/nav-background.jpg';

  useEffect(() => {
    const fetchBackground = async () => {
      if (location.pathname === '/') {
        setDynamicBackground(null);
        return;
      }
      const bg = await pageBackgroundService.getBackgroundForPage(location.pathname);
      setDynamicBackground(bg);
    };

    fetchBackground();
  }, [location.pathname]);

  const backgroundImage = location.pathname !== '/' 
    ? (dynamicBackground || defaultBackground) 
    : propBackgroundImage;

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [menuLoading, setMenuLoading] = useState(true);
  const [menuError, setMenuError] = useState<string | null>(null);
  const [expandedMobileMenus, setExpandedMobileMenus] = useState<Set<string>>(new Set());

  const loadMenuItems = async (bustCache: boolean = false) => {
    try {
      setMenuLoading(true);
      setMenuError(null);
      const items = await menuService.getMainMenuItems(bustCache);
      const activeItems = menuService.filterActiveMenuItems(items);
      setMenuItems(activeItems);
    } catch (error) {
      console.error('❌ Error loading menu items:', error);
      setMenuError('Menü yüklenirken hata oluştu');
      const fallbackItems: MenuItem[] = [
        { id: '1', title: 'ANASAYFA', url: '/', isActive: true, isExternal: false, target: '_self', orderIndex: 1, menuLocation: 'main', createdAt: '', updatedAt: '' },
        { id: '2', title: 'HAKKIMIZDA', url: '/hakkimizda', isActive: true, isExternal: false, target: '_self', orderIndex: 2, menuLocation: 'main', createdAt: '', updatedAt: '' },
        { id: '3', title: 'KURUMSAL', url: '/kurumsal', isActive: true, isExternal: false, target: '_self', orderIndex: 3, menuLocation: 'main', createdAt: '', updatedAt: '' },
        { id: '4', title: 'PROJELERİMİZ', url: '/projeler', isActive: true, isExternal: false, target: '_self', orderIndex: 4, menuLocation: 'main', createdAt: '', updatedAt: '' },
        { id: '6', title: 'BİZE ULAŞIN', url: '/bize-ulasin', isActive: true, isExternal: false, target: '_self', orderIndex: 6, menuLocation: 'main', createdAt: '', updatedAt: '' },
      ];
      setMenuItems(fallbackItems);
    } finally {
      setMenuLoading(false);
    }
  };

  useEffect(() => {
    loadMenuItems();
  }, []);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isMobileMenuOpen]);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setExpandedMobileMenus(new Set());
  };

  const toggleMobileSubmenu = (event: React.MouseEvent, item: MenuItem) => {
    if (item.children && item.children.length > 0) {
      event.preventDefault();
      setExpandedMobileMenus(prev => {
        const newSet = new Set(prev);
        if (newSet.has(item.id)) {
          newSet.delete(item.id);
        } else {
          newSet.add(item.id);
        }
        return newSet;
      });
    }
  };

  const socialLinks = [
    { href: 'https://youtube.com', icon: 'fab fa-youtube' },
    { href: 'https://facebook.com', icon: 'fab fa-facebook-f' },
    { href: 'https://instagram.com', icon: 'fab fa-instagram' },
  ];

  const renderMenuLink = (item: MenuItem, isMobile: boolean = false) => {
    const url = menuService.getMenuItemUrl(item);
    const target = menuService.getMenuItemTarget(item);
    const isExternal = item.isExternal || url.startsWith('http');

    const linkProps = {
      target: isExternal ? target : undefined,
      rel: isExternal ? 'noopener noreferrer' : undefined,
      className: isMobile ? `flex items-center justify-between py-3 px-4 text-gray-800 hover:bg-gray-100 hover:text-[#0b244c] rounded-md transition-colors font-medium ${item.cssClass || ''}` : `navbar-menu-link text-white text-xl font-medium uppercase hover:opacity-80 drop-shadow-md transition-all flex items-center ${item.cssClass || ''}`,
      title: item.description || item.title,
      onClick: (e: React.MouseEvent) => {
        if (isMobile) {
          if (item.children && item.children.length > 0) {
            toggleMobileSubmenu(e, item);
          } else {
            closeMobileMenu();
          }
        } else if (item.children && item.children.length > 0) {
          e.preventDefault();
        }
      }
    };

    const content = (
      <>
        <span className={isMobile ? "flex items-center" : ""}>
          {item.icon && <i className={`${item.icon} mr-3`}></i>}
          {item.title}
        </span>
        {item.children && item.children.length > 0 && (
          <i className={`fas fa-chevron-down ml-2 text-sm transition-transform duration-200 ${isMobile && expandedMobileMenus.has(item.id) ? 'rotate-180' : ''} ${!isMobile ? 'chevron-rotate' : ''}`}></i>
        )}
      </>
    );

    return isExternal ? (
      <a href={url} {...linkProps}>{content}</a>
    ) : (
      <Link to={url} {...linkProps}>{content}</Link>
    );
  };

  return (
    <header className="w-full z-50 top-0 left-0 right-0 absolute bg-transparent" style={backgroundImage ? { backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' } : {}}>
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-transparent h-[140px]"></div>
      <div className="flex relative">
        <div className="bg-transparent h-[140px] flex items-center justify-center">
          <Link to="/" className="block">
            <img src="/images/logo.png" alt="Kent Konut Logo" className="logo-img" />
          </Link>
        </div>
        <div className="flex-1 flex-col h-[140px] hidden md:flex">
          <div className="h-[100px] bg-transparent flex items-center pt-3">
            <div className="flex-1 pl-12">
              <div className="flex justify-between items-center">
                <nav className="flex">
                  <ul className="flex gap-x-7">
                    {menuLoading ? <li className="text-white text-xl font-medium uppercase">Yükleniyor...</li> : menuError ? <li className="text-white text-xl font-medium uppercase">Menü Hatası</li> : (
                      menuItems.map((item) => (
                        <li key={item.id} className="list-none relative group navbar-menu-item">
                          {renderMenuLink(item, false)}
                          {item.children && item.children.length > 0 && (
                            <ul className="navbar-dropdown absolute top-full left-0 bg-white shadow-xl rounded-lg py-3 min-w-56 opacity-0 invisible transition-all duration-300 border border-gray-200">
                              {item.children.map((child) => (
                                <li key={child.id} className="submenu-item">
                                  {renderMenuLink(child, false)} 
                                </li>
                              ))}
                            </ul>
                          )}
                        </li>
                      ))
                    )}
                  </ul>
                </nav>
                {process.env.NODE_ENV === 'development' && (
                  <button onClick={() => loadMenuItems(true)} className="text-white hover:opacity-80 w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-all mr-3" title="Refresh Menu (Dev)" aria-label="Refresh Menu">
                    <i className="fas fa-sync-alt text-sm"></i>
                  </button>
                )}
                <div className="flex items-center pr-6">
                  <div className="border-l border-white pl-4 flex items-center mr-4">
                    {socialLinks.map((social) => (
                      <a key={social.href} href={social.href} className="text-white rounded-full border border-white w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-white hover:text-[#0b244c] transition-colors drop-shadow-md mx-1 opacity-85 hover:opacity-100" aria-label={social.icon.includes('youtube') ? 'YouTube' : social.icon.includes('facebook') ? 'Facebook' : 'Instagram'}>
                        <i className={social.icon} style={{ position: 'relative', top: '0' }}></i>
                      </a>
                    ))}
                  </div>
                  <a href="tel:0262 331 07 03" className="text-white text-2xl font-medium drop-shadow-md">0262 331 07 03</a>
                </div>
              </div>
            </div>
          </div>
          <div className="h-[40px] bg-transparent">
            <div className="w-full border-b border-white/30 opacity-85"></div>
          </div>
        </div>
        <div className="md:hidden flex items-center justify-end pr-4 flex-1">
          <button onClick={toggleMobileMenu} className="text-white p-2 rounded-md hover:bg-white/10 transition-colors" aria-label="Toggle mobile menu" aria-expanded={isMobileMenuOpen}>
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}</button>
        </div>
      </div>
      {isMobileMenuOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={closeMobileMenu} />
          <div className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out md:hidden ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <Link to="/" onClick={closeMobileMenu}><img src="/images/logo.png" alt="Kent Konut Logo" className="h-8 w-auto" /></Link>
              <button onClick={closeMobileMenu} className="text-gray-500 hover:text-gray-700 p-2 rounded-md hover:bg-gray-100 transition-colors" aria-label="Close mobile menu"><X className="h-5 w-5" /></button>
            </div>
            <nav className="p-4">
              <ul className="space-y-2">
                {menuLoading ? <li className="py-3 px-4 text-gray-600">Menü yükleniyor...</li> : menuError ? <li className="py-3 px-4 text-red-600">Menü yüklenirken hata oluştu</li> : (
                  menuItems.map((item) => (
                    <li key={item.id}>
                      <div className="relative">
                        {renderMenuLink(item, true)}
                        {item.children && item.children.length > 0 && (
                          <div className={`overflow-hidden transition-all duration-300 ${expandedMobileMenus.has(item.id) ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                            <ul className="ml-6 mt-2 space-y-1 border-l-2 border-gray-200 pl-4">
                              {item.children.map((child) => (
                                <li key={child.id}>
                                  {renderMenuLink(child, true)}
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
            <div className="p-4 border-t border-gray-200">
              <div className="flex justify-center space-x-4 mb-4">
                {socialLinks.map((social) => (
                  <a key={social.href} href={social.href} className="text-gray-600 hover:text-[#0b244c] w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors" aria-label={social.icon.includes('youtube') ? 'YouTube' : social.icon.includes('facebook') ? 'Facebook' : 'Instagram'}>
                    <i className={`${social.icon} text-xl`}></i>
                  </a>
                ))}
              </div>
              <a href="tel:0262 331 07 03" className="block text-center text-[#0b244c] font-semibold text-lg hover:underline">0262 331 07 03</a>
            </div>
          </div>
        </>
      )}
    </header>
  );
};

export default Navbar;
