import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

interface NavbarProps {
  className?: string;
}

const Navbar = ({ className }: NavbarProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

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
  };

  const menuItems = [
    { href: '/', label: 'ANASAYFA' },
    { href: '/hakkimizda', label: 'HAKKIMIZDA' },
    { href: '/kurumsal', label: 'KURUMSAL' },
    { href: '/projeler', label: 'PROJELERİMİZ' },
    { href: '/hafriyat', label: 'HAFRİYAT' },
    { href: '/bize-ulasin', label: 'BİZE ULAŞIN' },
  ];

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
        backgroundImage: "url('/images/proje_header_02032021191233.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Hafif koyu gradient overlay - menü öğelerinin daha okunabilir olmasını sağlar */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-transparent h-[120px]"></div>
      
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
                    {menuItems.map((item) => (
                      <li key={item.href} className="list-none relative">
                        <a 
                          href={item.href} 
                          className="text-white text-xl font-medium uppercase hover:opacity-80 drop-shadow-md transition-all"
                        >
                          {item.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
                
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
                {menuItems.map((item) => (
                  <li key={item.href}>
                    <a 
                      href={item.href} 
                      onClick={closeMobileMenu}
                      className="block py-3 px-4 text-gray-800 hover:bg-gray-100 hover:text-[#0b244c] rounded-md transition-colors font-medium"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
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
