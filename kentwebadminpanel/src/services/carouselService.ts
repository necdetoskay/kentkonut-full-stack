import axios from 'axios';
import { CarouselItem, CropConfig, ImageUploadResponse } from '../types/carousel.types';

// Docker ortamında API URL'ini doğrudan erişilebilir olacak şekilde güncelliyoruz
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const fetchCarouselItems = async (): Promise<CarouselItem[]> => {
  try {
    const response = await axios.get(`${API_URL}/api/carousel`);
    return response.data;
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

export const createCarouselItem = async (item: Omit<CarouselItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<CarouselItem> => {
  try {
    const response = await axios.post(`${API_URL}/api/carousel`, item);
    return response.data;
  } catch (error) {
    console.error('Carousel öğesi oluşturulamadı:', error);
    throw error;
  }
};

export const updateCarouselItem = async (id: number, item: Partial<CarouselItem>): Promise<CarouselItem> => {
  try {
    const response = await axios.put(`${API_URL}/api/carousel/${id}`, item);
    return response.data;
  } catch (error) {
    console.error(`Carousel öğesi (ID: ${id}) güncellenemedi:`, error);
    throw error;
  }
};

export const deleteCarouselItem = async (id: number): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/api/carousel/${id}`);
  } catch (error) {
    console.error(`Carousel öğesi (ID: ${id}) silinemedi:`, error);
    throw error;
  }
};

export const uploadCarouselImage = async (file: File, crop?: CropConfig): Promise<ImageUploadResponse> => {
  try {
    const formData = new FormData();
    formData.append('image', file);
    
    if (crop) {
      formData.append('crop', JSON.stringify(crop));
    }
    
    const response = await axios.post(`${API_URL}/api/carousel/upload`, formData, {
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

export const updateCarouselOrder = async (items: { id: number; order: number }[]): Promise<void> => {
  try {
    await axios.put(`${API_URL}/api/carousel/order`, { items });
  } catch (error) {
    console.error('Carousel sıralaması güncellenemedi:', error);
    throw error;
  }
}; 