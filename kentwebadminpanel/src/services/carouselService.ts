import axios from 'axios';
import {
  CarouselItem,
  CreateCarouselItemRequest,
  CarouselResponse,
  ImageUploadResponse,
} from '../types/carousel.types';

// Docker ortamında API URL'ini doğrudan erişilebilir olacak şekilde güncelliyoruz
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Carousel öğelerini getir
export const fetchCarouselItems = async (): Promise<CarouselItem[]> => {
  try {
    const response = await axios.get<CarouselResponse>(`${API_URL}/api/carousel`);
    return response.data.data?.items || [];
  } catch (error) {
    console.error('Carousel öğeleri getirilemedi:', error);
    throw error;
  }
};

export const fetchCarouselItem = async (id: number): Promise<CarouselItem> => {
  try {
    const response = await axios.get(`${API_URL}/api/carousel/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Carousel öğesi (ID: ${id}) getirilemedi:`, error);
    throw error;
  }
};

// Yeni carousel öğesi oluştur
export const createCarouselItem = async (data: CreateCarouselItemRequest): Promise<CarouselItem> => {
  try {
    const formData = new FormData();
    formData.append('item', JSON.stringify(data.item));
    formData.append('image', data.imageFile);

    const response = await axios.post<CarouselResponse>(`${API_URL}/api/carousel`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (!response.data.data?.item) {
      throw new Error('Carousel öğesi oluşturulamadı');
    }

    return response.data.data.item;
  } catch (error) {
    console.error('Carousel öğesi oluşturulamadı:', error);
    throw error;
  }
};

// Carousel öğesini güncelle
export const updateCarouselItem = async (id: number, data: Partial<CarouselItem>): Promise<CarouselItem> => {
  try {
    const response = await axios.put<CarouselResponse>(`${API_URL}/api/carousel/${id}`, data);
    
    if (!response.data.data?.item) {
      throw new Error('Carousel öğesi güncellenemedi');
    }

    return response.data.data.item;
  } catch (error) {
    console.error('Carousel öğesi güncellenemedi:', error);
    throw error;
  }
};

// Carousel öğesini sil
export const deleteCarouselItem = async (id: number): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/api/carousel/${id}`);
  } catch (error) {
    console.error('Carousel öğesi silinemedi:', error);
    throw error;
  }
};

// Carousel öğelerinin sırasını güncelle
export const updateCarouselOrder = async (items: { id: number; order: number }[]): Promise<void> => {
  try {
    await axios.put(`${API_URL}/api/carousel/reorder`, { items });
  } catch (error) {
    console.error('Carousel sıralaması güncellenemedi:', error);
    throw error;
  }
};

// Carousel resmi yükle
export const uploadCarouselImage = async (file: File): Promise<ImageUploadResponse> => {
  try {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await axios.post<ImageUploadResponse>(`${API_URL}/api/carousel/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Resim yüklenemedi:', error);
    throw error;
  }
}; 