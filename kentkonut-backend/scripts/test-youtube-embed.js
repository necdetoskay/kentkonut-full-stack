// Test script for YouTube video embedding

// Function to convert YouTube URL to embed URL
function getYoutubeEmbedUrl(url) {
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

// Test cases
const testUrls = [
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'https://youtube.com/watch?v=dQw4w9WgXcQ',
  'http://www.youtube.com/watch?v=dQw4w9WgXcQ&feature=related',
  'https://youtu.be/dQw4w9WgXcQ',
  'https://www.youtube.com/embed/dQw4w9WgXcQ',
  'dQw4w9WgXcQ',
  'https://youtube.com', // Invalid
  'https://www.youtube.com/watch?feature=related', // Missing video ID
  'https://www.youtube.com/watch', // Missing video ID
  'https://vimeo.com/123456789', // Not YouTube
  '' // Empty
];

// Test the function with each URL
console.log('Testing YouTube URL to Embed URL conversion:');
console.log('-------------------------------------------');
testUrls.forEach(url => {
  const embedUrl = getYoutubeEmbedUrl(url);
  console.log(`Original: ${url}`);
  console.log(`Embed URL: ${embedUrl || 'INVALID'}`);
  console.log('-------------------------------------------');
});
