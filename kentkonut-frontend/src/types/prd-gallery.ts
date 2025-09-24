// PRD-compliant Gallery Types
export enum ProjectGalleryCategory {
  DIS_MEKAN = 'DIS_MEKAN',
  IC_MEKAN = 'IC_MEKAN',
  VIDEO = 'VIDEO'
}

// Kategori etiketleri
export const getCategoryLabel = (category: ProjectGalleryCategory): string => {
  const labels = {
    [ProjectGalleryCategory.DIS_MEKAN]: 'Dış Mekan',
    [ProjectGalleryCategory.IC_MEKAN]: 'İç Mekan',
    [ProjectGalleryCategory.VIDEO]: 'Video'
  };
  return labels[category] || category;
};

// Medya dosyası interface'i
export interface MediaItem {
  id: string;
  url: string;
  filename: string;
  alt?: string;
  type: 'IMAGE' | 'VIDEO' | 'PDF' | 'WORD' | 'EMBED';
  embedUrl?: string;
  mimeType?: string;
}

// PRD Tab Item interface'i
export interface TabItem {
  id: number;
  title: string;
  description?: string;
  category: ProjectGalleryCategory;
  hasOwnMedia: boolean;  // Parent'ın kendi medyası var mı?
  subTabs: TabItem[];
  mediaCount: number;
  order: number;
  parentId?: number;
}

// Breadcrumb item interface'i
export interface BreadcrumbItem {
  id: number;
  title: string;
  level: number;
}

// Gallery media item interface'i
export interface GalleryMediaItem {
  id: number;
  mediaId: string;
  title: string;
  description?: string;
  order: number;
  media: MediaItem;
}

// Pagination interface'i
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

// Search result interface'i
export interface SearchResult {
  id: number;
  title: string;
  description?: string;
  tabPath: string[];
  media: MediaItem;
  relevanceScore: number;
}

// Filter option interface'i
export interface FilterOption {
  value: string;
  label: string;
  count: number;
}

// Filter category interface'i
export interface FilterCategory {
  name: string;
  label: string;
  options: FilterOption[];
}

// API Response interfaces
export interface TabGalleryResponse {
  success: boolean;
  data: {
    tabs: TabItem[];
    breadcrumb: BreadcrumbItem[];
  };
}

export interface TabMediaResponse {
  success: boolean;
  data: {
    tab: {
      id: number;
      title: string;
      description?: string;
      category: ProjectGalleryCategory;
    };
    media: GalleryMediaItem[];
    pagination: PaginationInfo;
  };
}

export interface SearchResponse {
  success: boolean;
  data: {
    results: SearchResult[];
    total: number;
    query: string;
  };
}

export interface FiltersResponse {
  success: boolean;
  data: {
    categories: FilterCategory[];
    mediaTypes: FilterOption[];
    dateRanges: FilterOption[];
  };
}

// Component Props interfaces
export interface TabGalleryContainerProps {
  projectSlug: string;
  projectTitle: string;
}

export interface TabNavigationProps {
  tabs: TabItem[];
  activeTab: number;
  onTabChange: (tabId: number) => void;
  breadcrumb: BreadcrumbItem[];
  onBreadcrumbClick: (tabId: number) => void;
}

export interface MediaGridProps {
  media: GalleryMediaItem[];
  loading: boolean;
  onImageClick: (index: number) => void;
  onLoadMore: () => void;
  hasMore: boolean;
  error?: string;
}

export interface SearchAndFiltersProps {
  onSearch: (query: string) => void;
  onFilterChange: (filters: FilterOptions) => void;
  categories: ProjectGalleryCategory[];
  searchQuery: string;
  isLoading: boolean;
}

export interface FilterOptions {
  category?: ProjectGalleryCategory;
  mediaType?: string;
  dateRange?: string;
  searchQuery?: string;
}

// Lightbox interfaces
export interface LightboxImage {
  id: number;
  url: string;
  alt?: string;
  title?: string;
}

export interface LightboxModalProps {
  images: LightboxImage[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

// Gallery state interfaces
export interface GalleryState {
  tabs: TabItem[];
  activeTab: number;
  breadcrumb: BreadcrumbItem[];
  media: GalleryMediaItem[];
  pagination: PaginationInfo;
  loading: boolean;
  error?: string;
  searchQuery: string;
  filters: FilterOptions;
  searchResults: SearchResult[];
  isSearching: boolean;
}

// Gallery actions
export type GalleryAction = 
  | { type: 'SET_TABS'; payload: TabItem[] }
  | { type: 'SET_ACTIVE_TAB'; payload: number }
  | { type: 'SET_BREADCRUMB'; payload: BreadcrumbItem[] }
  | { type: 'SET_MEDIA'; payload: GalleryMediaItem[] }
  | { type: 'SET_PAGINATION'; payload: PaginationInfo }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_FILTERS'; payload: FilterOptions }
  | { type: 'SET_SEARCH_RESULTS'; payload: SearchResult[] }
  | { type: 'SET_IS_SEARCHING'; payload: boolean }
  | { type: 'APPEND_MEDIA'; payload: GalleryMediaItem[] }
  | { type: 'CLEAR_ERROR' }
  | { type: 'RESET_GALLERY' };
