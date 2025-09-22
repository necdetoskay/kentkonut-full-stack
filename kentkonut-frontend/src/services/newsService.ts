// News/Haber API servisi - Backend ile iletişim için
import { apiClient } from './apiClient';

export interface NewsArticle {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featuredImage?: string;
  categoryId?: number;
  authorId?: number;
  status: 'draft' | 'published' | 'archived';
  publishedAt?: string;
  tags?: string[];
  metaTitle?: string;
  metaDescription?: string;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  category?: NewsCategory;
  author?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface NewsCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  parentId?: number;
  active: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
  children?: NewsCategory[];
  articles?: NewsArticle[];
}

class NewsService {
  // Haber makalelerini getir
  async getNewsArticles(params?: {
    categoryId?: number;
    status?: string;
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<NewsArticle[]> {
    const queryParams = new URLSearchParams();
    if (params?.categoryId) queryParams.append('categoryId', params.categoryId.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);

    const endpoint = `/api/news?${queryParams.toString()}`;
    const response = await apiClient.get<NewsArticle[]>(endpoint);
    return response.data || [];
  }

  // Belirli bir haber makalesini getir
  async getNewsArticle(id: number): Promise<NewsArticle | null> {
    const response = await apiClient.get<NewsArticle>(`/api/news/${id}`);
    return response.data || null;
  }

  // Slug ile haber makalesini getir
  async getNewsArticleBySlug(slug: string): Promise<NewsArticle | null> {
    const response = await apiClient.get<NewsArticle>(`/api/news/slug/${slug}`);
    return response.data || null;
  }

  // Haber makalesi oluştur
  async createNewsArticle(data: Partial<NewsArticle>): Promise<NewsArticle | null> {
    const response = await apiClient.post<NewsArticle>('/api/news', data);
    return response.data || null;
  }

  // Haber makalesi güncelle
  async updateNewsArticle(id: number, data: Partial<NewsArticle>): Promise<NewsArticle | null> {
    const response = await apiClient.put<NewsArticle>(`/api/news/${id}`, data);
    return response.data || null;
  }

  // Haber makalesi sil
  async deleteNewsArticle(id: number): Promise<boolean> {
    const response = await apiClient.delete(`/api/news/${id}`);
    return response.success;
  }

  // Haber kategorilerini getir
  async getNewsCategories(): Promise<NewsCategory[]> {
    const response = await apiClient.get<NewsCategory[]>('/api/news-categories');
    return response.data || [];
  }

  // Haber kategorisi oluştur
  async createNewsCategory(data: Partial<NewsCategory>): Promise<NewsCategory | null> {
    const response = await apiClient.post<NewsCategory>('/api/news-categories', data);
    return response.data || null;
  }

  // Haber kategorisi güncelle
  async updateNewsCategory(id: number, data: Partial<NewsCategory>): Promise<NewsCategory | null> {
    const response = await apiClient.put<NewsCategory>(`/api/news-categories/${id}`, data);
    return response.data || null;
  }

  // Haber kategorisi sil
  async deleteNewsCategory(id: number): Promise<boolean> {
    const response = await apiClient.delete(`/api/news-categories/${id}`);
    return response.success;
  }

  // Popüler haberleri getir
  async getPopularNews(limit: number = 5): Promise<NewsArticle[]> {
    const response = await apiClient.get<NewsArticle[]>(`/api/news/popular?limit=${limit}`);
    return response.data || [];
  }

  // Son haberleri getir
  async getLatestNews(limit: number = 10): Promise<NewsArticle[]> {
    const response = await apiClient.get<NewsArticle[]>(`/api/news/latest?limit=${limit}`);
    return response.data || [];
  }
}

// Singleton instance
export const newsService = new NewsService();
export default newsService;
