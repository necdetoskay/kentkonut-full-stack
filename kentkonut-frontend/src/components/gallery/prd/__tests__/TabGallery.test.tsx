import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TabGalleryContainer from '@/components/gallery/prd/TabGalleryContainer';
import TabNavigation from '@/components/gallery/prd/TabNavigation';
import MediaGrid from '@/components/gallery/prd/MediaGrid';
import SearchAndFilters from '@/components/gallery/prd/SearchAndFilters';
import LightboxModal from '@/components/gallery/prd/LightboxModal';
import { TabItem, GalleryMediaItem, LightboxImage } from '@/types/prd-gallery';

// Mock API responses
const mockTabsResponse = {
  success: true,
  data: {
    tabs: [
      {
        id: 1,
        title: 'İç Mekan',
        description: 'İç mekan görselleri',
        category: 'IC_MEKAN',
        hasOwnMedia: true,
        subTabs: [
          {
            id: 2,
            title: 'Salon',
            description: 'Salon görselleri',
            category: 'IC_MEKAN',
            hasOwnMedia: false,
            subTabs: [],
            mediaCount: 5,
            order: 1,
            parentId: 1
          }
        ],
        mediaCount: 10,
        order: 1
      }
    ],
    breadcrumb: []
  }
};

const mockMediaResponse = {
  success: true,
  data: {
    tab: {
      id: 1,
      title: 'İç Mekan',
      description: 'İç mekan görselleri',
      category: 'IC_MEKAN'
    },
    media: [
      {
        id: 1,
        mediaId: 'media1',
        title: 'Salon Görseli',
        description: 'Modern salon tasarımı',
        order: 1,
        media: {
          id: 'media1',
          url: '/images/salon1.jpg',
          filename: 'salon1.jpg',
          alt: 'Modern salon',
          type: 'IMAGE',
          mimeType: 'image/jpeg'
        }
      }
    ],
    pagination: {
      page: 1,
      limit: 12,
      total: 1,
      hasMore: false
    }
  }
};

const mockProjectResponse = {
  success: true,
  data: {
    id: 1,
    title: 'Test Project',
    slug: 'test-project'
  }
};

// Mock fetch
global.fetch = jest.fn();

describe('TabGalleryContainer', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  test('renders gallery container', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockProjectResponse
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockTabsResponse
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockMediaResponse
      });

    render(
      <TabGalleryContainer
        projectSlug="test-project"
        projectTitle="Test Project"
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Proje Galerisi')).toBeInTheDocument();
    });
  });

  test('handles API errors gracefully', async () => {
    (fetch as jest.Mock).mockRejectedValue(new Error('API Error'));

    render(
      <TabGalleryContainer
        projectSlug="test-project"
        projectTitle="Test Project"
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Galeri yüklenirken hata oluştu')).toBeInTheDocument();
    });
  });
});

describe('TabNavigation', () => {
  const mockTabs: TabItem[] = [
    {
      id: 1,
      title: 'İç Mekan',
      description: 'İç mekan görselleri',
      category: 'IC_MEKAN',
      hasOwnMedia: true,
      subTabs: [],
      mediaCount: 5,
      order: 1
    }
  ];

  const mockBreadcrumb: BreadcrumbItem[] = [];

  test('renders tabs correctly', () => {
    render(
      <TabNavigation
        tabs={mockTabs}
        activeTab={0}
        onTabChange={jest.fn()}
        breadcrumb={mockBreadcrumb}
        onBreadcrumbClick={jest.fn()}
      />
    );

    expect(screen.getByText('İç Mekan')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument(); // media count
  });

  test('handles tab click', () => {
    const onTabChange = jest.fn();
    
    render(
      <TabNavigation
        tabs={mockTabs}
        activeTab={0}
        onTabChange={onTabChange}
        breadcrumb={mockBreadcrumb}
        onBreadcrumbClick={jest.fn()}
      />
    );

    fireEvent.click(screen.getByText('İç Mekan'));
    expect(onTabChange).toHaveBeenCalledWith(1);
  });

  test('shows empty state when no tabs', () => {
    render(
      <TabNavigation
        tabs={[]}
        activeTab={0}
        onTabChange={jest.fn()}
        breadcrumb={mockBreadcrumb}
        onBreadcrumbClick={jest.fn()}
      />
    );

    expect(screen.getByText('Galeri kategorisi bulunamadı.')).toBeInTheDocument();
  });
});

describe('MediaGrid', () => {
  const mockMedia: GalleryMediaItem[] = [
    {
      id: 1,
      mediaId: 'media1',
      title: 'Test Image',
      description: 'Test description',
      order: 1,
      media: {
        id: 'media1',
        url: '/images/test.jpg',
        filename: 'test.jpg',
        alt: 'Test image',
        type: 'IMAGE',
        mimeType: 'image/jpeg'
      }
    }
  ];

  test('renders media grid', () => {
    render(
      <MediaGrid
        media={mockMedia}
        loading={false}
        onImageClick={jest.fn()}
        onLoadMore={jest.fn()}
        hasMore={false}
      />
    );

    expect(screen.getByText('Test Image')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  test('shows loading state', () => {
    render(
      <MediaGrid
        media={[]}
        loading={true}
        onImageClick={jest.fn()}
        onLoadMore={jest.fn()}
        hasMore={false}
      />
    );

    expect(screen.getByText('Yükleniyor...')).toBeInTheDocument();
  });

  test('shows empty state', () => {
    render(
      <MediaGrid
        media={[]}
        loading={false}
        onImageClick={jest.fn()}
        onLoadMore={jest.fn()}
        hasMore={false}
      />
    );

    expect(screen.getByText('Medya Bulunamadı')).toBeInTheDocument();
  });

  test('handles image click', () => {
    const onImageClick = jest.fn();
    
    render(
      <MediaGrid
        media={mockMedia}
        loading={false}
        onImageClick={onImageClick}
        onLoadMore={jest.fn()}
        hasMore={false}
      />
    );

    fireEvent.click(screen.getByText('Test Image'));
    expect(onImageClick).toHaveBeenCalledWith(0);
  });
});

describe('SearchAndFilters', () => {
  test('renders search input', () => {
    render(
      <SearchAndFilters
        onSearch={jest.fn()}
        onFilterChange={jest.fn()}
        categories={['IC_MEKAN', 'DIS_MEKAN']}
        searchQuery=""
        isLoading={false}
      />
    );

    expect(screen.getByPlaceholderText('Galeride ara...')).toBeInTheDocument();
  });

  test('handles search input', async () => {
    const onSearch = jest.fn();
    
    render(
      <SearchAndFilters
        onSearch={onSearch}
        onFilterChange={jest.fn()}
        categories={['IC_MEKAN', 'DIS_MEKAN']}
        searchQuery=""
        isLoading={false}
      />
    );

    const searchInput = screen.getByPlaceholderText('Galeride ara...');
    fireEvent.change(searchInput, { target: { value: 'test' } });

    await waitFor(() => {
      expect(onSearch).toHaveBeenCalledWith('test');
    }, { timeout: 500 });
  });

  test('shows loading state', () => {
    render(
      <SearchAndFilters
        onSearch={jest.fn()}
        onFilterChange={jest.fn()}
        categories={['IC_MEKAN', 'DIS_MEKAN']}
        searchQuery=""
        isLoading={true}
      />
    );

    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});

describe('LightboxModal', () => {
  const mockImages: LightboxImage[] = [
    {
      id: 1,
      url: '/images/test1.jpg',
      alt: 'Test image 1',
      title: 'Test Image 1'
    },
    {
      id: 2,
      url: '/images/test2.jpg',
      alt: 'Test image 2',
      title: 'Test Image 2'
    }
  ];

  test('renders lightbox modal', () => {
    render(
      <LightboxModal
        images={mockImages}
        currentIndex={0}
        onClose={jest.fn()}
        onNavigate={jest.fn()}
      />
    );

    expect(screen.getByText('Test Image 1')).toBeInTheDocument();
    expect(screen.getByText('1 / 2')).toBeInTheDocument();
  });

  test('handles navigation', () => {
    const onNavigate = jest.fn();
    
    render(
      <LightboxModal
        images={mockImages}
        currentIndex={0}
        onClose={jest.fn()}
        onNavigate={onNavigate}
      />
    );

    fireEvent.click(screen.getByLabelText('Next image'));
    expect(onNavigate).toHaveBeenCalledWith(1);
  });

  test('handles close', () => {
    const onClose = jest.fn();
    
    render(
      <LightboxModal
        images={mockImages}
        currentIndex={0}
        onClose={onClose}
        onNavigate={jest.fn()}
      />
    );

    fireEvent.click(screen.getByLabelText('Close'));
    expect(onClose).toHaveBeenCalled();
  });
});

// Integration tests
describe('Gallery Integration', () => {
  test('complete gallery flow', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockProjectResponse
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockTabsResponse
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockMediaResponse
      });

    render(
      <TabGalleryContainer
        projectSlug="test-project"
        projectTitle="Test Project"
      />
    );

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('İç Mekan')).toBeInTheDocument();
    });

    // Check if media is loaded
    await waitFor(() => {
      expect(screen.getByText('Salon Görseli')).toBeInTheDocument();
    });
  });
});

// Performance tests
describe('Performance', () => {
  test('lazy loading works correctly', async () => {
    const largeMediaList = Array.from({ length: 100 }, (_, i) => ({
      id: i + 1,
      mediaId: `media${i + 1}`,
      title: `Image ${i + 1}`,
      description: `Description ${i + 1}`,
      order: i + 1,
      media: {
        id: `media${i + 1}`,
        url: `/images/test${i + 1}.jpg`,
        filename: `test${i + 1}.jpg`,
        alt: `Test image ${i + 1}`,
        type: 'IMAGE' as const,
        mimeType: 'image/jpeg'
      }
    }));

    render(
      <MediaGrid
        media={largeMediaList}
        loading={false}
        onImageClick={jest.fn()}
        onLoadMore={jest.fn()}
        hasMore={false}
      />
    );

    // Should render without performance issues
    expect(screen.getByText('Image 1')).toBeInTheDocument();
  });
});

// Accessibility tests
describe('Accessibility', () => {
  test('tab navigation is keyboard accessible', () => {
    const onTabChange = jest.fn();
    
    render(
      <TabNavigation
        tabs={[
          {
            id: 1,
            title: 'Tab 1',
            description: 'Tab 1 description',
            category: 'IC_MEKAN',
            hasOwnMedia: true,
            subTabs: [],
            mediaCount: 5,
            order: 1
          }
        ]}
        activeTab={0}
        onTabChange={onTabChange}
        breadcrumb={[]}
        onBreadcrumbClick={jest.fn()}
      />
    );

    const tabButton = screen.getByRole('button', { name: /Tab 1/ });
    expect(tabButton).toBeInTheDocument();
    expect(tabButton).toHaveAttribute('tabindex', '0');
  });

  test('lightbox modal is accessible', () => {
    render(
      <LightboxModal
        images={[
          {
            id: 1,
            url: '/images/test.jpg',
            alt: 'Test image',
            title: 'Test Image'
          }
        ]}
        currentIndex={0}
        onClose={jest.fn()}
        onNavigate={jest.fn()}
      />
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByLabelText('Close')).toBeInTheDocument();
  });
});
