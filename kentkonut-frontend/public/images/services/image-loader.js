// Servis ve carousel görselleri için yükleme betiği
document.addEventListener('DOMContentLoaded', function() {
  console.log('Görseller yükleniyor...');
  
  // 1. Servis Görselleri
  const serviceImages = {
    'Konut Hizmetleri': {
      realImage: '/images/services/1_24022021034916.jpg'
    },
    'Hafriyat Hizmetleri': {
      realImage: '/images/services/2_24022021040848.jpg'
    },
    'Mimari Projelendirme': {
      realImage: '/images/services/3_24022021034931.jpg'
    },
    'Kentsel Dönüşüm': {
      realImage: '/images/services/4_24022021034938.jpg'
    }
  };

  // Tüm servis kartlarını bulalım
  const serviceCards = document.querySelectorAll('.services-card');
  
  // Her kart için gerçek resmi yükleme
  serviceCards.forEach(card => {
    const titleElement = card.querySelector('h3');
    if (!titleElement) return;
    
    const title = titleElement.textContent.trim();
    const imgData = serviceImages[title];
    
    if (imgData) {
      const imgElement = card.querySelector('img');
      if (imgElement) {
        // Gerçek resim yolunu ayarlayalım
        imgElement.src = imgData.realImage;
        
        // Hata durumunda placeholder görüntüsüne geri dönelim
        imgElement.onerror = function() {
          console.error(`Resim yüklenemedi: ${imgData.realImage}`);
          imgElement.src = `https://placehold.co/600x400/e4e4e4/555555?text=${encodeURIComponent(title)}`;
        };
      }
    }
  });

  // 2. Carousel Görselleri
  const carouselSlides = [
    {
      title: "TUANA Evleri 3. ETAP",
      placeholder: "/images/carousel/@carousel-0.png",
      // Kullanıcının paylaştığı resim 
      image: "https://i.hizliresim.com/5mxjz8d.png"
    },
    {
      title: "HAFRIYAT Hizmetleri",
      placeholder: "/images/carousel/@carousel-1.png",
      // Kullanıcının paylaştığı resim
      image: "https://i.hizliresim.com/rh1wy87.png"
    },
    {
      title: "SAĞLIKENT Konutları",
      placeholder: "/images/carousel/@carousel-2.png",
      // Kullanıcının paylaştığı resim
      image: "https://i.hizliresim.com/avkkzmn.png"
    },
    {
      title: "YILDIZ Konutları",
      placeholder: "/images/carousel/@carousel-3.png",
      // Kullanıcının paylaştığı resim
      image: "https://i.hizliresim.com/1tgkwzd.png"
    },
    {
      title: "KENT KONUT Projelerimiz",
      placeholder: "/images/carousel/@carousel-4.png",
      // Farklı bir Kent Konut görseli 
      image: "https://i.hizliresim.com/5mxjz8d.png"
    }
  ];

  // Carousel slide'larında doğru görselleri yükleyelim
  const slideElements = document.querySelectorAll('.carousel-slide');
  slideElements.forEach((slide, index) => {
    if (index < carouselSlides.length) {
      const bgDiv = slide.querySelector('div[style*="backgroundImage"]');
      if (bgDiv) {
        // Orijinal görsel yolunu alalım ama placeholder URL'i ile replace edelim
        const originalStyle = bgDiv.getAttribute('style');
        const slideData = carouselSlides[index];
        
        if (originalStyle && originalStyle.includes(slideData.placeholder)) {
          const newStyle = originalStyle.replace(
            `url(${slideData.placeholder})`, 
            `url(${slideData.image})`
          );
          bgDiv.setAttribute('style', newStyle);
        }
      }
    }
  });
}); 