'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { corporateApiFetch } from '@/utils/corporateApi';
import { CorporateCard, CreateCorporateCardData, UpdateCorporateCardData } from '@/types/corporate-cards';

interface UseKurumsalKartlarReturn {
  cards: CorporateCard[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateOrder: (cardIds: string[]) => Promise<void>;
  createCard: (cardData: CreateCorporateCardData) => Promise<CorporateCard>;
  updateCard: (id: string, cardData: UpdateCorporateCardData) => Promise<CorporateCard>;
  deleteCard: (id: string) => Promise<void>;
  toggleCardStatus: (id: string, isActive: boolean) => Promise<void>;
  isReordering: boolean;
}

export function useKurumsalKartlar(): UseKurumsalKartlarReturn {
  const [cards, setCards] = useState<CorporateCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isReordering, setIsReordering] = useState(false);

  // Kartları yükle - Gerçek API kullan
  const fetchCards = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Fetching cards from API...');

      // Gerçek API endpoint kullan
      const result = await corporateApiFetch<any>('/api/admin/kurumsal/kartlar');
      console.log('📡 Fetch response data:', result);

      if (!result.success) {
        throw new Error(result.error || 'Kartlar yüklenemedi');
      }

      const fetchedCards = result.data || [];
      console.log('✅ Cards fetched successfully:', fetchedCards.length, 'cards');

      setCards(fetchedCards);

      // Fallback to mock data if API fails or returns empty
      if (fetchedCards.length === 0) {
        console.log('⚠️ No cards from API, using fallback mock data');
        const mockCards = [
        {
          id: 'cmdmqiu6g00005s4dkqtddo4s',
          title: 'BAŞKANIMIZ',
          subtitle: 'Doç. Dr. Tahir BÜYÜKAKIN',
          description: 'Belediye başkanımız hakkında bilgiler',
          imageUrl: '/images/corporate/baskan.jpg',
          backgroundColor: '#f8f9fa',
          textColor: '#2c3e50',
          accentColor: '#3498db',
          displayOrder: 1,
          isActive: true,
          targetUrl: '/kurumsal/baskan',
          openInNewTab: false,
          content: null,
          customData: null,
          imagePosition: 'center',
          cardSize: 'medium',
          borderRadius: 'rounded',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date(),
          createdBy: null
        },
        {
          id: 'cmdmqiu6g00015s4dkqtddo4t',
          title: 'GENEL MÜDÜR',
          subtitle: 'Genel Müdürümüz',
          description: 'Genel müdürümüz hakkında bilgiler',
          imageUrl: '/images/corporate/genel-mudur.jpg',
          backgroundColor: '#f8f9fa',
          textColor: '#2c3e50',
          accentColor: '#27ae60',
          displayOrder: 2,
          isActive: true,
          targetUrl: '/kurumsal/genel-mudur',
          openInNewTab: false,
          content: null,
          customData: null,
          imagePosition: 'center',
          cardSize: 'medium',
          borderRadius: 'rounded',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date(),
          createdBy: null
        },
        {
          id: 'cmdmqiu6g00025s4dkqtddo4u',
          title: 'BİRİMLERİMİZ',
          subtitle: 'Organizasyon Şeması',
          description: 'Belediyemizin birimlerini keşfedin',
          imageUrl: '/images/corporate/birimler.jpg',
          backgroundColor: '#fff3cd',
          textColor: '#856404',
          accentColor: '#ffc107',
          displayOrder: 3,
          isActive: true,
          targetUrl: '/kurumsal/birimler',
          openInNewTab: false,
          content: null,
          customData: null,
          imagePosition: 'center',
          cardSize: 'medium',
          borderRadius: 'rounded',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date(),
          createdBy: null
        },
        {
          id: 'cmdmqiu6g00035s4dkqtddo4v',
          title: 'STRATEJİMİZ',
          subtitle: 'Vizyon ve Misyon',
          description: 'Belediyemizin stratejik hedefleri',
          imageUrl: '/images/corporate/strateji.jpg',
          backgroundColor: '#d1ecf1',
          textColor: '#0c5460',
          accentColor: '#17a2b8',
          displayOrder: 4,
          isActive: true,
          targetUrl: '/kurumsal/strateji',
          openInNewTab: false,
          content: null,
          customData: null,
          imagePosition: 'center',
          cardSize: 'medium',
          borderRadius: 'rounded',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date(),
          createdBy: null
        },
        {
          id: 'cmdmqiu6g00045s4dkqtddo4w',
          title: 'HEDEFİMİZ',
          subtitle: '2030 Vizyonu',
          description: 'Gelecek nesillere daha iyi bir şehir',
          imageUrl: '/images/corporate/hedef.jpg',
          backgroundColor: '#f8d7da',
          textColor: '#721c24',
          accentColor: '#dc3545',
          displayOrder: 5,
          isActive: true,
          targetUrl: '/kurumsal/hedef',
          openInNewTab: false,
          content: null,
          customData: null,
          imagePosition: 'center',
          cardSize: 'medium',
          borderRadius: 'rounded',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date(),
          createdBy: null
        }
      ];

        setCards(mockCards);
        console.log('✅ Using fallback mock data:', mockCards.length, 'cards');
      }
    } catch (err) {
      console.error('❌ Fetch cards error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Bilinmeyen hata';
      setError(errorMessage);
      toast.error('Kartlar yüklenirken hata oluştu: ' + errorMessage);

      // Fallback to mock data on error
      console.log('⚠️ API failed, using fallback mock data');
      const mockCards = [
        {
          id: 'cmdmqiu6g00005s4dkqtddo4s',
          title: 'BAŞKANIMIZ',
          subtitle: 'Doç. Dr. Tahir BÜYÜKAKIN',
          description: 'Belediye başkanımız hakkında bilgiler',
          imageUrl: '/images/corporate/baskan.jpg',
          backgroundColor: '#f8f9fa',
          textColor: '#2c3e50',
          accentColor: '#3498db',
          displayOrder: 1,
          isActive: true,
          targetUrl: '/kurumsal/baskan',
          openInNewTab: false,
          content: null,
          customData: null,
          imagePosition: 'center',
          cardSize: 'medium',
          borderRadius: 'rounded',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date(),
          createdBy: null
        }
      ];
      setCards(mockCards);
    } finally {
      setLoading(false);
    }
  }, []);

  // Sıralama güncelle - EN ÖNEMLİ FONKSİYON - Gerçek API kullan
  const updateOrder = useCallback(async (cardIds: string[]) => {
    try {
      setIsReordering(true);

      const response = await fetch('/api/admin/kurumsal/kartlar/siralama', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardIds })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Sıralama güncellenemedi');
      }

      setCards(result.data);
      toast.success(result.message || 'Sıralama güncellendi');

      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sıralama hatası';
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsReordering(false);
    }
  }, []);

  // Kart oluştur - Gerçek API kullan
  const createCard = useCallback(async (cardData: CreateCorporateCardData): Promise<CorporateCard> => {
    try {
      const response = await fetch('/api/admin/kurumsal/kartlar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cardData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Kart oluşturulamadı');
      }

      await fetchCards(); // Listeyi yenile
      toast.success(result.message || 'Kart oluşturuldu');

      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Oluşturma hatası';
      toast.error(errorMessage);
      throw err;
    }
  }, [fetchCards]);

  // Kart güncelle - Gerçek API kullan
  const updateCard = useCallback(async (id: string, cardData: UpdateCorporateCardData): Promise<CorporateCard> => {
    try {
      console.log('🔄 Hook updateCard called:', { id, cardData });

      const response = await fetch(`/api/admin/kurumsal/kartlar/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cardData)
      });

      console.log('📡 API Response status:', response.status);

      const result = await response.json();
      console.log('📡 API Response data:', result);

      if (!response.ok) {
        console.error('❌ API Error:', result);
        throw new Error(result.error || 'Kart güncellenemedi');
      }

      console.log('🔄 Refreshing cards list...');
      await fetchCards(); // Listeyi yenile

      console.log('✅ Update successful');
      toast.success(result.message || 'Kart güncellendi');

      return result.data;
    } catch (err) {
      console.error('❌ Hook updateCard error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Güncelleme hatası';
      toast.error(errorMessage);
      throw err;
    }
  }, [fetchCards]);

  // Kart sil - Gerçek API kullan
  const deleteCard = useCallback(async (id: string): Promise<void> => {
    try {
      const response = await fetch(`/api/admin/kurumsal/kartlar/${id}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Kart silinemedi');
      }

      await fetchCards(); // Listeyi yenile
      toast.success(result.message || 'Kart silindi');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Silme hatası';
      toast.error(errorMessage);
      throw err;
    }
  }, [fetchCards]);

  // Kart durumu değiştir - PUT endpoint kullan (status-only update olarak optimize edildi)
  const toggleCardStatus = useCallback(async (id: string, isActive: boolean): Promise<void> => {
    try {
      console.log('🔄 Toggling card status:', { id, currentStatus: isActive, newStatus: !isActive });

      const response = await fetch(`/api/admin/kurumsal/kartlar/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive })
      });

      console.log('📡 Toggle response status:', response.status);

      const result = await response.json();
      console.log('📡 Toggle response data:', result);

      if (!response.ok) {
        console.error('❌ Toggle failed:', result);
        throw new Error(result.error || 'Durum değiştirilemedi');
      }

      console.log('🔄 Refreshing cards after status toggle...');
      await fetchCards(); // Listeyi yenile

      const statusText = !isActive ? 'aktif' : 'pasif';
      console.log(`✅ Card status toggled to: ${statusText}`);
      toast.success(`Kart ${statusText} edildi`);
    } catch (err) {
      console.error('❌ Toggle card status error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Durum değiştirme hatası';
      toast.error(errorMessage);
      throw err;
    }
  }, [fetchCards]);

  // İlk yükleme
  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  return {
    cards,
    loading,
    error,
    refetch: fetchCards,
    updateOrder,
    createCard,
    updateCard,
    deleteCard,
    toggleCardStatus,
    isReordering
  };
}
