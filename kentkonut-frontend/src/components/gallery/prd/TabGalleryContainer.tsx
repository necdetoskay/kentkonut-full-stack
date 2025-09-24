import React, { useState, useEffect, useReducer, useCallback } from 'react';
import { TabItem, BreadcrumbItem, GalleryMediaItem, PaginationInfo, SearchResult, FilterOptions, GalleryState, GalleryAction } from '@/types/prd-gallery';
import TabNavigation from './TabNavigation';
import MediaGrid from './MediaGrid';
import SearchAndFilters from './SearchAndFilters';
import LightboxModal from './LightboxModal';
import { getApiBaseUrl } from '@/config/ports';

// Gallery state reducer
function galleryReducer(state: GalleryState, action: GalleryAction): GalleryState {
  switch (action.type) {
    case 'SET_TABS':
      return { ...state, tabs: action.payload };
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload };
    case 'SET_BREADCRUMB':
      return { ...state, breadcrumb: action.payload };
    case 'SET_MEDIA':
      return { ...state, media: action.payload };
    case 'SET_PAGINATION':
      return { ...state, pagination: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    case 'SET_FILTERS':
      return { ...state, filters: action.payload };
    case 'SET_SEARCH_RESULTS':
      return { ...state, searchResults: action.payload };
    case 'SET_IS_SEARCHING':
      return { ...state, isSearching: action.payload };
    case 'APPEND_MEDIA':
      return { ...state, media: [...state.media, ...action.payload] };
    case 'CLEAR_ERROR':
      return { ...state, error: undefined };
    case 'RESET_GALLERY':
      return {
        ...state,
        media: [],
        pagination: { page: 1, limit: 12, total: 0, hasMore: false },
        searchResults: [],
        isSearching: false
      };
    default:
      return state;
  }
}

// Initial state
const initialState: GalleryState = {
  tabs: [],
  activeTab: 0,
  breadcrumb: [],
  media: [],
  pagination: { page: 1, limit: 12, total: 0, hasMore: false },
  loading: false,
  error: undefined,
  searchQuery: '',
  filters: {},
  searchResults: [],
  isSearching: false
};

interface TabGalleryContainerProps {
  projectSlug: string;
  projectTitle: string;
}

const TabGalleryContainer: React.FC<TabGalleryContainerProps> = ({
  projectSlug,
  projectTitle
}) => {
  const [state, dispatch] = useReducer(galleryReducer, initialState);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [allImages, setAllImages] = useState<GalleryMediaItem[]>([]);

  const API_BASE_URL = getApiBaseUrl();

  // Load gallery tabs
  const loadGalleryTabs = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      // First get project by slug to get the ID
      const projectResponse = await fetch(`${API_BASE_URL}/api/projects/slug/${projectSlug}`);
      
      if (!projectResponse.ok) {
        throw new Error(`HTTP error! status: ${projectResponse.status}`);
      }

      const projectData = await projectResponse.json();
      const project = projectData.data || projectData;
      
      if (!project) {
        throw new Error('Project not found');
      }

      // Now get gallery tabs using project ID
      const response = await fetch(`${API_BASE_URL}/api/projects/${project.id}/gallery`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        dispatch({ type: 'SET_TABS', payload: data.data.tabs });
        dispatch({ type: 'SET_BREADCRUMB', payload: data.data.breadcrumb });
        
        // Load first tab's media if available
        if (data.data.tabs.length > 0) {
          await loadTabMedia(data.data.tabs[0].id, project.id);
        }
      } else {
        throw new Error('Failed to load gallery tabs');
      }
    } catch (error) {
      console.error('Error loading gallery tabs:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Galeri yüklenirken hata oluştu' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [projectSlug, API_BASE_URL]);

  // Load media for specific tab
  const loadTabMedia = useCallback(async (tabId: number, projectId: number, page: number = 1, append: boolean = false) => {
    try {
      if (!append) {
        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'CLEAR_ERROR' });
      }

      const response = await fetch(
        `${API_BASE_URL}/api/projects/${projectId}/gallery/${tabId}?page=${page}&limit=12`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        if (append) {
          dispatch({ type: 'APPEND_MEDIA', payload: data.data.media });
        } else {
          dispatch({ type: 'SET_MEDIA', payload: data.data.media });
        }
        dispatch({ type: 'SET_PAGINATION', payload: data.data.pagination });
      } else {
        throw new Error('Failed to load tab media');
      }
    } catch (error) {
      console.error('Error loading tab media:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Medya yüklenirken hata oluştu' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [API_BASE_URL]);

  // Search functionality
  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      dispatch({ type: 'SET_SEARCH_RESULTS', payload: [] });
      dispatch({ type: 'SET_IS_SEARCHING', payload: false });
      return;
    }

    try {
      dispatch({ type: 'SET_IS_SEARCHING', payload: true });
      dispatch({ type: 'SET_SEARCH_QUERY', payload: query });

      // First get project by slug to get the ID
      const projectResponse = await fetch(`${API_BASE_URL}/api/projects/slug/${projectSlug}`);
      
      if (!projectResponse.ok) {
        throw new Error(`HTTP error! status: ${projectResponse.status}`);
      }

      const projectData = await projectResponse.json();
      const project = projectData.data || projectData;
      
      if (!project) {
        throw new Error('Project not found');
      }

      const response = await fetch(
        `${API_BASE_URL}/api/projects/${project.id}/gallery/search?q=${encodeURIComponent(query)}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        dispatch({ type: 'SET_SEARCH_RESULTS', payload: data.data.results });
      } else {
        throw new Error('Search failed');
      }
    } catch (error) {
      console.error('Error searching:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Arama sırasında hata oluştu' });
    } finally {
      dispatch({ type: 'SET_IS_SEARCHING', payload: false });
    }
  }, [projectSlug, API_BASE_URL]);

  // Filter functionality
  const handleFilterChange = useCallback((filters: FilterOptions) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
    // TODO: Implement filter-based media loading
  }, []);

  // Tab change handler
  const handleTabChange = useCallback(async (tabId: number) => {
    const tabIndex = state.tabs.findIndex(tab => tab.id === tabId);
    if (tabIndex !== -1) {
      dispatch({ type: 'SET_ACTIVE_TAB', payload: tabIndex });
      dispatch({ type: 'RESET_GALLERY' });
      
      // Get project ID first
      try {
        const projectResponse = await fetch(`${API_BASE_URL}/api/projects/slug/${projectSlug}`);
        const projectData = await projectResponse.json();
        const project = projectData.data || projectData;
        
        if (project) {
          await loadTabMedia(tabId, project.id);
        }
      } catch (error) {
        console.error('Error getting project ID for tab change:', error);
      }
    }
  }, [state.tabs, projectSlug, API_BASE_URL, loadTabMedia]);

  // Breadcrumb click handler
  const handleBreadcrumbClick = useCallback((tabId: number) => {
    handleTabChange(tabId);
  }, [handleTabChange]);

  // Image click handler
  const handleImageClick = useCallback((index: number) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
    setAllImages(state.media);
  }, [state.media]);

  // Load more handler
  const handleLoadMore = useCallback(async () => {
    if (state.pagination.hasMore && !state.loading) {
      const activeTab = state.tabs[state.activeTab];
      if (activeTab) {
        try {
          const projectResponse = await fetch(`${API_BASE_URL}/api/projects/slug/${projectSlug}`);
          const projectData = await projectResponse.json();
          const project = projectData.data || projectData;
          
          if (project) {
            await loadTabMedia(activeTab.id, project.id, state.pagination.page + 1, true);
          }
        } catch (error) {
          console.error('Error getting project ID for load more:', error);
        }
      }
    }
  }, [state.pagination, state.loading, state.tabs, state.activeTab, projectSlug, API_BASE_URL, loadTabMedia]);

  // Lightbox navigation
  const handleLightboxNavigate = useCallback((index: number) => {
    setCurrentImageIndex(index);
  }, []);

  // Close lightbox
  const handleCloseLightbox = useCallback(() => {
    setLightboxOpen(false);
  }, []);

  // Load initial data
  useEffect(() => {
    loadGalleryTabs();
  }, [loadGalleryTabs]);

  // Prepare lightbox images
  const lightboxImages = allImages.map(item => ({
    id: item.id,
    url: item.media.url,
    alt: item.media.alt || item.title,
    title: item.title
  }));

  return (
    <div className="tab-gallery-container">
      {/* Search and Filters */}
      <SearchAndFilters
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
        categories={Object.values(require('@/types/prd-gallery').ProjectGalleryCategory)}
        searchQuery={state.searchQuery}
        isLoading={state.isSearching}
      />

      {/* Tab Navigation */}
      <TabNavigation
        tabs={state.tabs}
        activeTab={state.activeTab}
        onTabChange={handleTabChange}
        breadcrumb={state.breadcrumb}
        onBreadcrumbClick={handleBreadcrumbClick}
      />

      {/* Media Grid */}
      <MediaGrid
        media={state.media}
        loading={state.loading}
        onImageClick={handleImageClick}
        onLoadMore={handleLoadMore}
        hasMore={state.pagination.hasMore}
        error={state.error}
      />

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <LightboxModal
          images={lightboxImages}
          currentIndex={currentImageIndex}
          onClose={handleCloseLightbox}
          onNavigate={handleLightboxNavigate}
        />
      )}
    </div>
  );
};

export default TabGalleryContainer;
