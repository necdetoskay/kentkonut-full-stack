/**
 * Video URL handling utilities for different video platforms
 */

export interface VideoThumbnail {
  url: string | null;
  type: 'youtube' | 'vimeo' | 'local' | 'unknown';
}

/**
 * Converts YouTube video URL to embed format
 */
export function getYoutubeEmbedUrl(url: string): string {
  if (!url) return '';
  
  try {
    // URL kontrol et ve temizle
    const cleanUrl = url.trim();
    
    // Zaten embed URL'si ise direkt döndür
    if (cleanUrl.includes('youtube.com/embed/')) {
      // URL'yi validate et
      const embedPattern = /^https?:\/\/(?:www\.)?youtube\.com\/embed\/[a-zA-Z0-9_-]{11}(?:\?.*)?$/;
      if (embedPattern.test(cleanUrl)) {
        return cleanUrl;
      }
    }
    
    // URL'den video ID'sini çıkarma
    let videoId = '';
    
    // youtube.com/watch?v=VIDEO_ID formatı
    if (cleanUrl.includes('youtube.com/watch')) {
      try {
        const urlObj = new URL(cleanUrl);
        videoId = urlObj.searchParams.get('v') || '';
      } catch (e) {
        // URL parsing hatası durumunda regex ile deneme
        const match = cleanUrl.match(/[?&]v=([^&#]*)/);
        videoId = match && match[1] ? match[1] : '';
      }
    }
    
    // youtu.be/VIDEO_ID formatı
    else if (cleanUrl.includes('youtu.be/')) {
      const parts = cleanUrl.split('youtu.be/');
      if (parts.length > 1) {
        videoId = parts[1].split(/[?&#]/)[0];
      }
    }
    
    // youtube.com/v/VIDEO_ID formatı (eski format)
    else if (cleanUrl.includes('youtube.com/v/')) {
      const parts = cleanUrl.split('youtube.com/v/');
      if (parts.length > 1) {
        videoId = parts[1].split(/[?&#]/)[0];
      }
    }
    
    // VIDEO_ID doğrudan girilmişse
    else if (/^[a-zA-Z0-9_-]{11}$/.test(cleanUrl)) {
      videoId = cleanUrl;
    }
    
    // Video ID bulunduysa ve geçerliyse embed URL'yi oluştur
    if (videoId && /^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
      return `https://www.youtube.com/embed/${videoId}`;
    }
    
    console.warn('Tanımlanamayan YouTube URL formatı:', cleanUrl);
    return '';
  } catch (error) {
    console.error('YouTube URL dönüştürme hatası:', error);
    return '';
  }
}

/**
 * Converts Vimeo video URL to embed format
 */
export function getVimeoEmbedUrl(url: string): string {
  if (!url) return '';
  
  try {
    const cleanUrl = url.trim();
    
    // Player URL'si zaten verilmişse
    if (cleanUrl.includes('player.vimeo.com/video/')) {
      return cleanUrl;
    }
    
    // Standart vimeo URL'sinden ID'yi çıkarma
    if (cleanUrl.includes('vimeo.com')) {
      const regex = /vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^/]*)\/videos\/|showcase\/(?:.+?)\/video\/|)(\d+)(?:\/|\?|$)/;
      const match = cleanUrl.match(regex);
      if (match && match[1]) {
        return `https://player.vimeo.com/video/${match[1]}`;
      }
    }
    
    // Sadece ID verildi ise (sayısal değer)
    if (/^\d+$/.test(cleanUrl)) {
      return `https://player.vimeo.com/video/${cleanUrl}`;
    }
    
    // Hiçbir format tanınmadıysa, boş dön
    console.warn('Tanımlanamayan Vimeo URL formatı:', cleanUrl);
    return '';
  } catch (error) {
    console.error('Vimeo URL dönüştürme hatası:', error);
    return '';
  }
}

/**
 * Gets YouTube video thumbnail URL
 */
export function getYoutubeThumbnailUrl(url: string): string {
  if (!url) return '';
  
  try {
    // URL'den video ID'sini çıkarma
    let videoId = '';
    const cleanUrl = url.trim();
    
    // youtube.com/watch?v=VIDEO_ID formatı
    if (cleanUrl.includes('youtube.com/watch')) {
      try {
        const urlObj = new URL(cleanUrl);
        videoId = urlObj.searchParams.get('v') || '';
      } catch (e) {
        // URL parsing hatası durumunda regex ile deneme
        const match = cleanUrl.match(/[?&]v=([^&#]*)/);
        videoId = match && match[1] ? match[1] : '';
      }
    }
    
    // youtu.be/VIDEO_ID formatı
    else if (cleanUrl.includes('youtu.be/')) {
      const parts = cleanUrl.split('youtu.be/');
      if (parts.length > 1) {
        videoId = parts[1].split(/[?&#]/)[0];
      }
    }
    
    // youtube.com/embed/VIDEO_ID formatı
    else if (cleanUrl.includes('youtube.com/embed/')) {
      const parts = cleanUrl.split('youtube.com/embed/');
      if (parts.length > 1) {
        videoId = parts[1].split(/[?&#]/)[0];
      }
    }
    
    // VIDEO_ID doğrudan girilmişse
    else if (/^[a-zA-Z0-9_-]{11}$/.test(cleanUrl)) {
      videoId = cleanUrl;
    }
    
    // Video ID bulunduysa thumbnail URL'sini oluştur
    if (videoId && /^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
      // Yüksek kaliteli thumbnail (hqdefault)
      return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    }
    
    return '';
  } catch (error) {
    console.error('YouTube thumbnail URL oluşturma hatası:', error);
    return '';
  }
}

/**
 * Gets Vimeo video thumbnail URL (placeholder for now)
 */
export function getVimeoThumbnailUrl(url: string): string {
  // Vimeo thumbnail'leri API çağrısı gerektirir, basit bir çözüm için boş dönüş
  // Gerçek uygulamada, oEmbed API kullanılabilir
  return '';
}

/**
 * Gets appropriate video thumbnail based on video URL
 */
export function getVideoThumbnail(url: string): VideoThumbnail {
  // Boş URL kontrolü
  if (!url) return { url: null, type: 'unknown' };
  
  // YouTube videosu
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return { 
      url: getYoutubeThumbnailUrl(url), 
      type: 'youtube' 
    };
  }
  
  // Vimeo videosu
  if (url.includes('vimeo.com') || url.includes('player.vimeo.com')) {
    return { 
      url: getVimeoThumbnailUrl(url), 
      type: 'vimeo' 
    };
  }
  
  // Yerel video dosyası için özel thumbnail görüntüsü
  if (url.match(/\.(mp4|webm|ogg)$/i) || url.startsWith('/uploads/')) {
    return { 
      url: null, // Yerel video dosyaları için şimdilik thumbnail yok
      type: 'local' 
    };
  }
  
  // Diğer/bilinmeyen video kaynakları
  return { url: null, type: 'unknown' };
}

/**
 * Checks if URL is a video URL
 */
export function isVideoUrl(url: string): boolean {
  if (!url) return false;
  
  return url.includes('youtube.com') || 
         url.includes('youtu.be') || 
         url.includes('vimeo.com') ||
         url.match(/\.(mp4|webm|ogg)$/i) !== null;
}

/**
 * Gets video platform name
 */
export function getVideoPlatform(url: string): string {
  if (!url) return 'Unknown';
  
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return 'YouTube';
  }
  
  if (url.includes('vimeo.com')) {
    return 'Vimeo';
  }
  
  if (url.match(/\.(mp4|webm|ogg)$/i) || url.startsWith('/uploads/')) {
    return 'Local Video';
  }
  
  return 'External Video';
}
