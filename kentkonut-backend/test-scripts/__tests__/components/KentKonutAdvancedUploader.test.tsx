/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SessionProvider } from 'next-auth/react';
import { toast } from 'sonner';
import { KentKonutAdvancedUploader } from '@/components/media/KentKonutAdvancedUploader';
import { GalleryFileInfo } from '@/types/advanced-uploader';

// Mock dependencies
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('next-auth/react', () => ({
  useSession: () => ({
    data: {
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
        role: 'admin'
      }
    },
    status: 'authenticated'
  }),
  SessionProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

// Mock fetch
global.fetch = jest.fn();

// Mock react-image-crop
jest.mock('react-image-crop', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="react-crop">{children}</div>,
  centerCrop: jest.fn(() => ({ x: 0, y: 0, width: 100, height: 100, unit: '%' })),
  makeAspectCrop: jest.fn(() => ({ x: 0, y: 0, width: 100, height: 100, unit: '%' })),
}));

const mockGalleryFiles: GalleryFileInfo[] = [
  {
    id: 1,
    filename: 'test-image-1.jpg',
    originalName: 'test-image-1.jpg',
    url: '/uploads/images/test-image-1.jpg',
    alt: 'Test Image 1',
    caption: 'Test Caption 1',
    mimeType: 'image/jpeg',
    size: 1024000,
    type: 'image',
    thumbnailSmall: '/uploads/images/thumb_small_test-image-1.jpg',
    thumbnailMedium: '/uploads/images/thumb_medium_test-image-1.jpg',
    thumbnailLarge: '/uploads/images/thumb_large_test-image-1.jpg',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    categoryId: 1,
    category: { id: 1, name: 'Test Category', icon: 'folder' }
  }
];

describe('KentKonutAdvancedUploader', () => {
  const defaultProps = {
    categoryId: 1,
    customFolder: 'test-gallery',
    cropWidth: 800,
    cropHeight: 600,
    multiSelect: true,
    onSelectionComplete: jest.fn(),
    onUploadComplete: jest.fn(),
    onFileDelete: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockClear();
  });

  const renderComponent = (props = {}) => {
    return render(
      <SessionProvider session={null}>
        <KentKonutAdvancedUploader {...defaultProps} {...props} />
      </SessionProvider>
    );
  };

  describe('Component Rendering', () => {
    test('renders trigger button with default text', () => {
      renderComponent();
      expect(screen.getByText('Medya Galerisi')).toBeInTheDocument();
    });

    test('renders trigger button with custom text', () => {
      renderComponent({ buttonText: 'Custom Gallery' });
      expect(screen.getByText('Custom Gallery')).toBeInTheDocument();
    });

    test('opens dialog when trigger button is clicked', async () => {
      renderComponent();
      
      const triggerButton = screen.getByText('Medya Galerisi');
      await userEvent.click(triggerButton);
      
      expect(screen.getByText('Gelişmiş Medya Galerisi')).toBeInTheDocument();
    });
  });

  describe('Gallery Functionality', () => {
    test('fetches and displays gallery files', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockGalleryFiles,
          pagination: { page: 1, limit: 20, total: 1, totalPages: 1 }
        })
      });

      renderComponent();
      
      const triggerButton = screen.getByText('Medya Galerisi');
      await userEvent.click(triggerButton);
      
      await waitFor(() => {
        expect(screen.getByText('test-image-1.jpg')).toBeInTheDocument();
      });
    });

    test('handles API error gracefully', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          success: false,
          error: 'API Error'
        })
      });

      renderComponent();
      
      const triggerButton = screen.getByText('Medya Galerisi');
      await userEvent.click(triggerButton);
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Dosyalar yüklenirken hata oluştu');
      });
    });

    test('displays empty state when no files', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: [],
          pagination: { page: 1, limit: 20, total: 0, totalPages: 0 }
        })
      });

      renderComponent();
      
      const triggerButton = screen.getByText('Medya Galerisi');
      await userEvent.click(triggerButton);
      
      await waitFor(() => {
        expect(screen.getByText('Bu klasörde hiç dosya yok.')).toBeInTheDocument();
      });
    });
  });

  describe('File Selection', () => {
    beforeEach(async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: mockGalleryFiles,
          pagination: { page: 1, limit: 20, total: 1, totalPages: 1 }
        })
      });
    });

    test('allows file selection', async () => {
      renderComponent();
      
      const triggerButton = screen.getByText('Medya Galerisi');
      await userEvent.click(triggerButton);
      
      await waitFor(() => {
        const checkboxes = screen.getAllByRole('button');
        const firstCheckbox = checkboxes.find(btn => btn.querySelector('svg'));
        if (firstCheckbox) {
          fireEvent.click(firstCheckbox);
        }
      });
      
      expect(screen.getByText('1 dosya seçildi')).toBeInTheDocument();
    });

    test('calls onSelectionComplete when selection is completed', async () => {
      const onSelectionComplete = jest.fn();
      renderComponent({ onSelectionComplete });
      
      const triggerButton = screen.getByText('Medya Galerisi');
      await userEvent.click(triggerButton);
      
      await waitFor(() => {
        const checkboxes = screen.getAllByRole('button');
        const firstCheckbox = checkboxes.find(btn => btn.querySelector('svg'));
        if (firstCheckbox) {
          fireEvent.click(firstCheckbox);
        }
      });
      
      const completeButton = screen.getByText('Seçimi Tamamla');
      await userEvent.click(completeButton);
      
      expect(onSelectionComplete).toHaveBeenCalledWith([mockGalleryFiles[0]]);
    });
  });

  describe('File Upload', () => {
    test('switches to upload tab', async () => {
      renderComponent();
      
      const triggerButton = screen.getByText('Medya Galerisi');
      await userEvent.click(triggerButton);
      
      const uploadTab = screen.getByText('Yükle');
      await userEvent.click(uploadTab);
      
      expect(screen.getByText('Dosya Sürükle veya Seç')).toBeInTheDocument();
    });

    test('displays accepted file types', async () => {
      renderComponent({ acceptedTypes: ['image/*', 'application/pdf'] });
      
      const triggerButton = screen.getByText('Medya Galerisi');
      await userEvent.click(triggerButton);
      
      const uploadTab = screen.getByText('Yükle');
      await userEvent.click(uploadTab);
      
      expect(screen.getByText('image/*')).toBeInTheDocument();
      expect(screen.getByText('application/pdf')).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    test('updates search query', async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: [],
          pagination: { page: 1, limit: 20, total: 0, totalPages: 0 }
        })
      });

      renderComponent();
      
      const triggerButton = screen.getByText('Medya Galerisi');
      await userEvent.click(triggerButton);
      
      const searchInput = screen.getByPlaceholderText('Dosya ara...');
      await userEvent.type(searchInput, 'test search');
      
      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining('search=test%20search')
        );
      });
    });
  });
});
