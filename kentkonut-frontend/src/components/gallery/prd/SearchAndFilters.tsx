import React, { useState, useEffect, useRef } from 'react';
import { ProjectGalleryCategory, FilterOptions } from '@/types/prd-gallery';
import { Search, Filter, X, ChevronDown } from 'lucide-react';

interface SearchAndFiltersProps {
  onSearch: (query: string) => void;
  onFilterChange: (filters: FilterOptions) => void;
  categories: ProjectGalleryCategory[];
  searchQuery: string;
  isLoading: boolean;
}

const SearchAndFilters: React.FC<SearchAndFiltersProps> = ({
  onSearch,
  onFilterChange,
  categories,
  searchQuery,
  isLoading
}) => {
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [availableFilters, setAvailableFilters] = useState({
    categories: [] as Array<{ value: string; label: string; count: number }>,
    mediaTypes: [] as Array<{ value: string; label: string; count: number }>,
    dateRanges: [] as Array<{ value: string; label: string; count: number }>
  });
  
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const filtersRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      onSearch(localSearchQuery);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [localSearchQuery, onSearch]);

  // Sync local search query with prop
  useEffect(() => {
    setLocalSearchQuery(searchQuery);
  }, [searchQuery]);

  // Load available filters
  useEffect(() => {
    // TODO: Load filters from API
    // For now, use static data
    setAvailableFilters({
      categories: [
        { value: 'DIS_MEKAN', label: 'Dış Mekan', count: 0 },
        { value: 'IC_MEKAN', label: 'İç Mekan', count: 0 },
        { value: 'VIDEO', label: 'Video', count: 0 }
      ],
      mediaTypes: [
        { value: 'IMAGE', label: 'Görsel', count: 0 },
        { value: 'VIDEO', label: 'Video', count: 0 },
        { value: 'PDF', label: 'PDF', count: 0 }
      ],
      dateRanges: [
        { value: '7', label: 'Son 1 Hafta', count: 0 },
        { value: '30', label: 'Son 1 Ay', count: 0 },
        { value: '90', label: 'Son 3 Ay', count: 0 }
      ]
    });
  }, []);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearchQuery(e.target.value);
  };

  // Handle search clear
  const handleSearchClear = () => {
    setLocalSearchQuery('');
    onSearch('');
  };

  // Handle filter change
  const handleFilterChange = (filterType: keyof FilterOptions, value: string) => {
    const newFilters = { ...filters };
    
    if (value === '') {
      delete newFilters[filterType];
    } else {
      newFilters[filterType] = value as any;
    }
    
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setFilters({});
    onFilterChange({});
  };

  // Close filters when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filtersRef.current && !filtersRef.current.contains(event.target as Node)) {
        setShowFilters(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Count active filters
  const activeFiltersCount = Object.keys(filters).length;

  return (
    <div className="search-and-filters mb-6">
      {/* Search Bar */}
      <div className="search-container mb-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={localSearchQuery}
            onChange={handleSearchChange}
            placeholder="Galeride ara..."
            className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kentblue focus:border-transparent"
          />
          {localSearchQuery && (
            <button
              onClick={handleSearchClear}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            </button>
          )}
          {isLoading && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-kentblue"></div>
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="filters-container">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="h-4 w-4" />
              <span>Filtreler</span>
              {activeFiltersCount > 0 && (
                <span className="bg-kentblue text-white text-xs rounded-full px-2 py-1">
                  {activeFiltersCount}
                </span>
              )}
              <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
            
            {activeFiltersCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Tümünü Temizle
              </button>
            )}
          </div>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div ref={filtersRef} className="filters-dropdown bg-white border border-gray-200 rounded-lg p-4 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Category Filter */}
              <div className="filter-group">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Kategori</h4>
                <div className="space-y-2">
                  {availableFilters.categories.map((category) => (
                    <label key={category.value} className="flex items-center">
                      <input
                        type="radio"
                        name="category"
                        value={category.value}
                        checked={filters.category === category.value}
                        onChange={(e) => handleFilterChange('category', e.target.value)}
                        className="mr-2 text-kentblue focus:ring-kentblue"
                      />
                      <span className="text-sm text-gray-700">
                        {category.label}
                        {category.count > 0 && (
                          <span className="ml-1 text-gray-500">({category.count})</span>
                        )}
                      </span>
                    </label>
                  ))}
                  <button
                    onClick={() => handleFilterChange('category', '')}
                    className="text-xs text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Tümü
                  </button>
                </div>
              </div>

              {/* Media Type Filter */}
              <div className="filter-group">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Medya Tipi</h4>
                <div className="space-y-2">
                  {availableFilters.mediaTypes.map((type) => (
                    <label key={type.value} className="flex items-center">
                      <input
                        type="radio"
                        name="mediaType"
                        value={type.value}
                        checked={filters.mediaType === type.value}
                        onChange={(e) => handleFilterChange('mediaType', e.target.value)}
                        className="mr-2 text-kentblue focus:ring-kentblue"
                      />
                      <span className="text-sm text-gray-700">
                        {type.label}
                        {type.count > 0 && (
                          <span className="ml-1 text-gray-500">({type.count})</span>
                        )}
                      </span>
                    </label>
                  ))}
                  <button
                    onClick={() => handleFilterChange('mediaType', '')}
                    className="text-xs text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Tümü
                  </button>
                </div>
              </div>

              {/* Date Range Filter */}
              <div className="filter-group">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Tarih Aralığı</h4>
                <div className="space-y-2">
                  {availableFilters.dateRanges.map((range) => (
                    <label key={range.value} className="flex items-center">
                      <input
                        type="radio"
                        name="dateRange"
                        value={range.value}
                        checked={filters.dateRange === range.value}
                        onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                        className="mr-2 text-kentblue focus:ring-kentblue"
                      />
                      <span className="text-sm text-gray-700">
                        {range.label}
                        {range.count > 0 && (
                          <span className="ml-1 text-gray-500">({range.count})</span>
                        )}
                      </span>
                    </label>
                  ))}
                  <button
                    onClick={() => handleFilterChange('dateRange', '')}
                    className="text-xs text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Tümü
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Active Filters Display */}
        {activeFiltersCount > 0 && (
          <div className="active-filters mt-3">
            <div className="flex flex-wrap gap-2">
              {filters.category && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-kentblue text-white">
                  Kategori: {availableFilters.categories.find(c => c.value === filters.category)?.label}
                  <button
                    onClick={() => handleFilterChange('category', '')}
                    className="ml-2 hover:text-gray-200"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {filters.mediaType && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-kentblue text-white">
                  Tip: {availableFilters.mediaTypes.find(t => t.value === filters.mediaType)?.label}
                  <button
                    onClick={() => handleFilterChange('mediaType', '')}
                    className="ml-2 hover:text-gray-200"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {filters.dateRange && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-kentblue text-white">
                  Tarih: {availableFilters.dateRanges.find(r => r.value === filters.dateRange)?.label}
                  <button
                    onClick={() => handleFilterChange('dateRange', '')}
                    className="ml-2 hover:text-gray-200"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchAndFilters;
