import React, { useRef, useEffect } from 'react';
import { TabItem, BreadcrumbItem } from '@/types/prd-gallery';
import { ChevronRight, Home } from 'lucide-react';
import { useTouchButton, useMobileViewport } from '@/hooks/useTouchGestures';

interface TabNavigationProps {
  tabs: TabItem[];
  activeTab: number;
  onTabChange: (tabId: number) => void;
  breadcrumb: BreadcrumbItem[];
  onBreadcrumbClick: (tabId: number) => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({
  tabs,
  activeTab,
  onTabChange,
  breadcrumb,
  onBreadcrumbClick
}) => {
  const tabContainerRef = useRef<HTMLDivElement>(null);
  const activeTabRef = useRef<HTMLButtonElement>(null);
  const { isMobile } = useMobileViewport();

  // Scroll to active tab
  useEffect(() => {
    if (activeTabRef.current && tabContainerRef.current) {
      const container = tabContainerRef.current;
      const activeTab = activeTabRef.current;
      
      const containerRect = container.getBoundingClientRect();
      const activeTabRect = activeTab.getBoundingClientRect();
      
      // Check if active tab is visible
      const isVisible = activeTabRect.left >= containerRect.left && 
                       activeTabRect.right <= containerRect.right;
      
      if (!isVisible) {
        // Scroll to center the active tab
        const scrollLeft = activeTab.offsetLeft - (container.offsetWidth / 2) + (activeTab.offsetWidth / 2);
        container.scrollTo({
          left: scrollLeft,
          behavior: 'smooth'
        });
      }
    }
  }, [activeTab]);

  // Handle tab click
  const handleTabClick = (tabId: number) => {
    onTabChange(tabId);
  };

  // Handle breadcrumb click
  const handleBreadcrumbClick = (tabId: number) => {
    onBreadcrumbClick(tabId);
  };

  if (tabs.length === 0) {
    return (
      <div className="tab-navigation">
        <div className="text-center py-8 text-gray-500">
          <p>Galeri kategorisi bulunamadı.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tab-navigation">
      {/* Breadcrumb Navigation */}
      {breadcrumb.length > 0 && (
        <div className="breadcrumb-container mb-4">
          <nav className="flex items-center space-x-2 text-sm text-gray-600">
            <button
              onClick={() => handleBreadcrumbClick(0)}
              className="flex items-center hover:text-kentblue transition-colors"
            >
              <Home className="w-4 h-4 mr-1" />
              Ana Sayfa
            </button>
            {breadcrumb.map((item, index) => (
              <React.Fragment key={item.id}>
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <button
                  onClick={() => handleBreadcrumbClick(item.id)}
                  className={`hover:text-kentblue transition-colors ${
                    index === breadcrumb.length - 1 ? 'text-kentblue font-medium' : ''
                  }`}
                >
                  {item.title}
                </button>
              </React.Fragment>
            ))}
          </nav>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="tab-container">
        <div 
          ref={tabContainerRef}
          className="flex overflow-x-auto scrollbar-hide space-x-1 pb-2"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
          {tabs.map((tab, index) => {
            const { handleTouchStart, handleTouchEnd, handleClick, isPressed } = useTouchButton(
              () => handleTabClick(tab.id),
              { hapticFeedback: isMobile, rippleEffect: isMobile }
            );

            return (
              <button
                key={tab.id}
                ref={index === activeTab ? activeTabRef : null}
                onClick={handleClick}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                className={`tab-button flex-shrink-0 px-4 py-2 rounded-lg font-medium transition-all duration-200 whitespace-nowrap ${
                  index === activeTab
                    ? 'bg-kentblue text-white shadow-md transform scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm'
                } ${isPressed ? 'scale-95' : ''} ${
                  isMobile ? 'min-h-[44px] min-w-[44px]' : ''
                }`}
              >
              <span className="tab-title">{tab.title}</span>
              {tab.mediaCount > 0 && (
                <span className={`tab-count ml-2 px-2 py-1 rounded-full text-xs ${
                  index === activeTab
                    ? 'bg-white bg-opacity-20 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {tab.mediaCount}
                </span>
              )}
              </button>
            );
          })}
        </div>

        {/* Sub-tabs for active tab */}
        {tabs[activeTab]?.subTabs && tabs[activeTab].subTabs.length > 0 && (
          <div className="sub-tabs-container mt-3">
            <div className="flex overflow-x-auto scrollbar-hide space-x-1">
              {tabs[activeTab].subTabs.map((subTab) => (
                <button
                  key={subTab.id}
                  onClick={() => handleTabClick(subTab.id)}
                  className="sub-tab-button flex-shrink-0 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 whitespace-nowrap bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                >
                  <span className="sub-tab-title">{subTab.title}</span>
                  {subTab.mediaCount > 0 && (
                    <span className="sub-tab-count ml-1 px-1.5 py-0.5 rounded-full text-xs bg-gray-200 text-gray-500">
                      {subTab.mediaCount}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tab Info */}
      {tabs[activeTab] && (
        <div className="tab-info mt-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {tabs[activeTab].title}
          </h3>
          {tabs[activeTab].description && (
            <p className="text-gray-600 mb-2">
              {tabs[activeTab].description}
            </p>
          )}
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span>
              {tabs[activeTab].mediaCount} medya
            </span>
            <span>
              Kategori: {tabs[activeTab].category}
            </span>
            {tabs[activeTab].hasOwnMedia && (
              <span className="text-kentblue font-medium">
                Kendi medyası var
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TabNavigation;
