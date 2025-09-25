import axios from 'axios';
import { API_BASE_URL } from '../config/environment';

const API_URL = API_BASE_URL;

interface SayfaArkaPlan {
    id: number;
    sayfaUrl: string;
    resimUrl: string;
}

const getBackgroundForPage = async (pageUrl: string): Promise<string | null> => {
    if (!pageUrl || pageUrl === '/') {
        return null;
    }

    try {
        const response = await axios.get<SayfaArkaPlan>(`${API_URL}/api/public/sayfa-arka-plan`, {
            params: {
                url: pageUrl
            }
        });
        
        if (response.status === 200 && response.data.resimUrl) {
            // API'den gelen URL'nin tam bir URL olduğundan emin olalım
            // Eğer /uploads gibi bir path geliyorsa, başına API_URL ekleyelim
            if (response.data.resimUrl.startsWith('/')) {
                return `${API_BASE_URL}${response.data.resimUrl}`;
            }
            return response.data.resimUrl;
        }
        return null;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
            // Bu durum, sayfa için özel bir arka plan tanımlanmadığında beklenir.
            // 404 hatalarını console'da gösterme
            return null;
        } else {
            console.error(`Arka plan resmi getirilirken hata oluştu (${pageUrl}):`, error);
        }
        return null;
    }
};

export const pageBackgroundService = {
    getBackgroundForPage,
};