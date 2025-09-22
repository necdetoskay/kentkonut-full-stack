import { apiClient } from './apiClient';
import { HafriyatVerileri, HafriyatPageContent } from '../types/hafriyat';

// Hafriyat sahalar API'sinden veri çek
export const getHafriyatSahalar = async (): Promise<any> => {
  try {
    const response = await apiClient.get('/api/hafriyat-sahalar?aktif=true&limit=50');
    return response.data;
  } catch (error) {
    console.error('Hafriyat sahalar alınamadı:', error);
    throw error;
  }
};

// İhtiyaca göre parametrelerle sahaları çek (ör: tüm kayıtlar)
export const getHafriyatSahalarWithParams = async (queryString: string = ''): Promise<any> => {
  try {
    const qs = queryString.startsWith('?') ? queryString : queryString ? `?${queryString}` : '';
    const response = await apiClient.get(`/api/hafriyat-sahalar${qs}`);
    return response.data;
  } catch (error) {
    console.error('Hafriyat sahalar (parametreli) alınamadı:', error);
    throw error;
  }
};

export const getHafriyatVerileri = async (): Promise<HafriyatVerileri> => {
  try {
    const response = await apiClient.get<HafriyatVerileri>('/api/hafriyat');
    return response.data;
  } catch (error) {
    console.error('Hafriyat verileri alınamadı:', error);
    throw error;
  }
};

// Tek bir hafriyat sahasının detaylarını çek (ID veya slug ile)
export const getSahaDetay = async (idOrSlug: string): Promise<any> => {
  console.log('🔥 getSahaDetay BAŞLADI');
  console.log('📍 İstek parametresi (idOrSlug):', idOrSlug);
  console.log('🌐 API endpoint:', `/api/hafriyat-sahalar/${idOrSlug}`);
  
  try {
    console.log('📡 apiClient.get çağrılıyor...');
    const response = await apiClient.get(`/api/hafriyat-sahalar/${idOrSlug}`);
    
    console.log('📥 HAM API YANITI:');
    console.log('Response tam objesi:', response);
    console.log('Response.success:', response?.success);
    console.log('Response.data:', response?.data);
    console.log('Response.error:', response?.error);
    
    // ApiClient response yapısını kontrol et
    if (!response.success) {
      console.log('❌ API başarısız yanıt verdi:', response.error);
      throw new Error(response.error || 'API çağrısı başarısız oldu');
    }
    
    console.log('✅ getSahaDetay başarılı, response döndürülüyor');
    return response;
  } catch (error) {
    console.error('❌ HATA: Saha detayları alınamadı:', error);
    console.error('Hata detayları:', {
      message: error instanceof Error ? error.message : 'Bilinmeyen hata',
      stack: error instanceof Error ? error.stack : 'Stack yok'
    });
    throw error;
  }
};



// HTML içeriğini decode etmek için utility fonksiyonu
const decodeHtmlContent = (htmlString: string): string => {
  // Unicode escape karakterlerini decode et
  let decoded = htmlString.replace(/\\u([0-9a-fA-F]{4})/g, (match, code) => {
    return String.fromCharCode(parseInt(code, 16));
  });
  
  // HTML entity'lerini decode et
  const textarea = document.createElement('textarea');
  textarea.innerHTML = decoded;
  decoded = textarea.value;
  
  return decoded;
};

// Hafriyat sayfa içeriği için API çağrısı - Backend'teki pages API'sinden çek
export const getHafriyatPageContent = async (): Promise<HafriyatPageContent> => {
  try {
    const pageId = import.meta.env.VITE_HAFRIYAT_PAGE_ID || 'cmev8379a0000jvlvdj8yuyza';
    const response = await apiClient.get(`/api/pages/${pageId}/content`);
    
    // API başarılı mı kontrol et - ApiClient response yapısına göre
    if (response.success && response.data) {
      // Backend response'u response.data içinde
      const backendResponse = response.data;
      
      // Backend response'unun success field'ını kontrol et
      if (backendResponse.success && backendResponse.data) {
        const pageData = backendResponse.data;
      
      // Content JSON'ını parse et
      let parsedContent = '';
      try {
        const contentObj = JSON.parse(pageData.content);
        if (contentObj.blocks && contentObj.blocks.length > 0) {
          // İlk block'un content'ini al ve decode et
          const rawContent = contentObj.blocks[0].content || '';
          parsedContent = sanitizeHtml(decodeHtmlContent(rawContent));
        }
      } catch (parseError) {
        parsedContent = sanitizeHtml(decodeHtmlContent(pageData.content));
      }
      
      // İçerikten subtitle ve description'ı da çıkarmaya çalış
      let subtitle = "Çevre Dostu Rehabilitasyon Projeleri"; // fallback
      let description = "Kocaeli il sınırları içinde yapılan yatırımlarla büyüyen inşaat sektöründe hafriyat atığı miktarı gün geçtikçe artmaktadır."; // fallback
      
      try {
        const contentObj = JSON.parse(pageData.content);
        if (contentObj.blocks && contentObj.blocks.length > 1) {
          // İkinci block'ta subtitle olabilir
          if (contentObj.blocks[1] && contentObj.blocks[1].content) {
            const secondBlockContent = decodeHtmlContent(contentObj.blocks[1].content);
            // HTML tag'lerini temizle
            subtitle = secondBlockContent.replace(/<[^>]*>/g, '').trim();
          }
          
          // Üçüncü block'ta description olabilir
          if (contentObj.blocks[2] && contentObj.blocks[2].content) {
            const thirdBlockContent = decodeHtmlContent(contentObj.blocks[2].content);
            // HTML tag'lerini temizle
            description = thirdBlockContent.replace(/<[^>]*>/g, '').trim();
          }
        }
        
        // Eğer content'te subtitle ve description yoksa, content'in kendisinden çıkarmaya çalış
        if (parsedContent && (subtitle === "Çevre Dostu Rehabilitasyon Projeleri" || description === "Kocaeli il sınırları içinde yapılan yatırımlarla büyüyen inşaat sektöründe hafriyat atığı miktarı gün geçtikçe artmaktadır.")) {
          const textContent = parsedContent.replace(/<[^>]*>/g, '').trim();
          const sentences = textContent.split('.').filter(s => s.trim().length > 0);
          
          if (sentences.length > 0 && subtitle === "Çevre Dostu Rehabilitasyon Projeleri") {
            // İlk cümleyi subtitle olarak kullan
            subtitle = sentences[0].trim() + '.';
          }
          
          if (sentences.length > 1 && description === "Kocaeli il sınırları içinde yapılan yatırımlarla büyüyen inşaat sektöründe hafriyat atığı miktarı gün geçtikçe artmaktadır.") {
            // Kalan cümleleri description olarak kullan
            description = sentences.slice(1).join('. ').trim();
            if (description && !description.endsWith('.')) {
              description += '.';
            }
          }
        }
      } catch (parseError) {
        // Content parse edilirken subtitle/description çıkarılamadı
      }
      
      return {
        title: pageData.title,
        subtitle: subtitle,
        description: description,
        content: parsedContent,
        metaTitle: `${pageData.title} - Kent Konut`,
        metaDescription: description.length > 160 ? description.substring(0, 157) + '...' : description
      };
      } else {
        return getMockHafriyatPageContent();
      }
    } else {
      return getMockHafriyatPageContent();
    }
  } catch (error) {
    // API başarısız olursa mock veri döndür
    return getMockHafriyatPageContent();
  }
};

// Basit sanitizer: riskli tagleri sil ve temel attribute beyaz liste uygula
function sanitizeHtml(html: string): string {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const blockedTags = ['script', 'style', 'iframe', 'object', 'embed', 'link', 'meta'];
    blockedTags.forEach(tag => doc.querySelectorAll(tag).forEach(el => el.remove()));

    doc.querySelectorAll('*').forEach(el => {
      [...el.attributes].forEach(attr => {
        const name = attr.name.toLowerCase();
        const val = attr.value.trim();
        if (name.startsWith('on')) el.removeAttribute(attr.name);
        if ((name === 'href' || name === 'src') && val.toLowerCase().startsWith('javascript:')) {
          el.removeAttribute(attr.name);
        }
      });
      const tag = el.tagName.toLowerCase();
      const allow: Record<string, string[]> = {
        a: ['href', 'title', 'target', 'rel'],
        img: ['src', 'alt', 'width', 'height', 'title'],
        p: ['style'], span: ['style'], div: ['style'],
        h1: ['style'], h2: ['style'], h3: ['style'], h4: ['style'], h5: ['style'], h6: ['style'],
        table: ['style', 'border', 'cellpadding', 'cellspacing'], thead: ['style'], tbody: ['style'], tfoot: ['style'], tr: ['style'], th: ['style'], td: ['style']
      };
      const allowed = allow[tag] || [];
      [...el.attributes].forEach(attr => {
        if (!allowed.includes(attr.name) && attr.name !== 'class') {
          el.removeAttribute(attr.name);
        }
      });
    });

    doc.querySelectorAll('a[href]').forEach(a => {
      const href = a.getAttribute('href') || '';
      if (/^https?:\/\//i.test(href)) {
        a.setAttribute('rel', 'noopener noreferrer');
        a.setAttribute('target', '_blank');
      }
    });

    return doc.body.innerHTML;
  } catch {
    return html;
  }
}

// Mock sayfa içeriği
export const getMockHafriyatPageContent = (): HafriyatPageContent => {
  return {
    title: "Hafriyat Sahaları",
    subtitle: "Çevre Dostu Rehabilitasyon Projeleri",
    description: "Kocaeli il sınırları içinde yapılan yatırımlarla büyüyen inşaat sektöründe hafriyat atığı miktarı gün geçtikçe artmaktadır. Bu atıkların kontrolsüz dökülmesi ile yaşanacak çevre ve görüntü kirliliğini önlemek amacıyla, kanun ve yönetmelikler çerçevesinde projelendirilmesi yapılarak vasfını yitirmiş ve kullanılmayan alanlar rehabilite edilmektedir.",
    content: "<p>Bu alanlar doğal topoğrafyaya uygun şekilde hafriyat toprağı ile doldurulduktan sonra ağaçlandırma çalışmaları yapılarak doğal yaşama geri kazandırılmaktadır.</p>",
    metaTitle: "Hafriyat Sahaları - Kentkonut",
    metaDescription: "Kocaeli'deki hafriyat sahalarının rehabilitasyon çalışmaları ve çevre dostu projeler hakkında bilgi alın."
  };
}

// Mock veri - API hazır olmadığında kullanılabilir
export const getMockHafriyatVerileri = (): HafriyatVerileri => {
  return {
    baslik: "Hafriyat",
    aciklama: "Kocaeli il sınırları içinde yapılan yatırımlarla büyüyen inşaat sektöründe hafriyat atığı miktarı gün geçtikçe artmaktadır. Bu atıkların kontrolsüz dökülmesi ile yaşanacak çevre ve görüntü kirliliğini önlemek amacıyla, kanun ve yönetmelikler çerçevesinde projelendirilmesi yapılarak vasfını yitirmiş ve kullanılmayan alanlar rehabilite edilmektedir. Bu alanlar doğal topoğrafyaya uygun şekilde hafriyat toprağı ile doldurulduktan sonra ağaçlandırma çalışmaları yapılarak doğal yaşama geri kazandırılmaktadır.",
    sonGuncelleme: "01.07.2025",
    sahalar: [
      {
        id: "1",
        ad: "KÖRFEZ TAŞOCAĞI",
        tamamlanmaYuzdesi: 90,
        aciklama: "Körfez bölgesindeki taş ocağı rehabilitasyon çalışmaları"
      },
      {
        id: "2",
        ad: "SEPETÇİLER 3. ETAP",
        tamamlanmaYuzdesi: 95,
        aciklama: "Sepetçiler bölgesi 3. etap hafriyat çalışmaları"
      },
      {
        id: "3",
        ad: "KETENCİLER REHABİLİTE",
        tamamlanmaYuzdesi: 10,
        aciklama: "Ketenciler bölgesi rehabilitasyon çalışmaları"
      },
      {
        id: "4",
        ad: "BALÇIK REHABİLİTE",
        tamamlanmaYuzdesi: 95,
        aciklama: "Balçık bölgesi rehabilitasyon çalışmaları"
      },
      {
        id: "5",
        ad: "DİLOVASI LOT ALANI",
        tamamlanmaYuzdesi: 70,
        aciklama: "Dilovası lot alanı hafriyat çalışmaları"
      },
      {
        id: "6",
        ad: "MADEN TAŞ OCAĞI",
        tamamlanmaYuzdesi: 50,
        aciklama: "Maden taş ocağı rehabilitasyon çalışmaları"
      }
    ]
  };
};

// Hafriyat service objesi
export const hafriyatService = {
  getHafriyatSahalar,
  getHafriyatSahalarWithParams,
  getHafriyatVerileri,
  getSahaDetay,
  getHafriyatPageContent,
  getMockHafriyatVerileri
};