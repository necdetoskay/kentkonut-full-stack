import React, { useState, useEffect } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { getApiBaseUrl } from '../../config/ports';
import { corporateService, CorporateCard, ParsedLayoutSettings } from '@/services/corporateService';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

// Helper function to generate placeholder content for cards
const getPlaceholderForCard = (card: CorporateCard): string => {
  const colors = {
    'BAŞKANIMIZ': '#3b82f6',
    'GENEL MÜDÜR': '#10b981',
    'BİRİMLERİMİZ': '#8b5cf6',
    'STRATEJİMİZ': '#f59e0b',
    'HEDEFİMİZ': '#ef4444'
  } as const;

  const color = colors[card.subtitle as keyof typeof colors] || '#6b7280';

  // Create initials from title
  const initials = card.title
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return `
    <div class="w-full h-full flex items-center justify-center text-white font-bold text-4xl"
         style="background: linear-gradient(135deg, ${color}, ${color}dd);">
      ${initials}
    </div>
  `;
};

// Kart hedef URL'sini çözen yardımcı (targetUrl boşsa bilinen eşlemelere düşer)
const resolveCardTargetUrl = (card: CorporateCard): string | null => {
  const direct = (card.targetUrl || '').trim();
  if (direct) return direct;

  const key = `${card.subtitle || ''} ${card.title || ''}`.toLowerCase();
  if (key.includes('başkan')) return '/kurumsal/baskan';
  if (key.includes('genel') && key.includes('müdür')) return '/kurumsal/genel-mudur';
  if (key.includes('birimler') || key.includes('müdürlük')) return '/kurumsal/birimler';
  // Strateji/hedef için mevcut rotaları koru
  if (key.includes('strateji')) return '/kurumsal/strateji';
  if (key.includes('hedef')) return '/kurumsal/hedef';
  // Yeni ayrıştırma: misyon ve vizyon kartlarını yeni sayfalara yönlendir
  if (key.includes('misyon')) return '/kurumsal/misyon';
  if (key.includes('vizyon')) return '/kurumsal/vizyon';
  return null;
};

// Corporate Card Component matching the reference design
interface CorporateCardProps {
  card: CorporateCard;
  index: number;
}

const CorporateCardComponent: React.FC<CorporateCardProps> = ({ card, index }) => {
  const href = resolveCardTargetUrl(card);
  const isExternal = href ? href.startsWith('http') : false;
  const target = (card.openInNewTab || isExternal) ? '_blank' : '_self';

  const handleCardClick = () => {
    if (href) {
      if (target === '_blank') {
        window.open(href, '_blank', 'noopener,noreferrer');
      } else {
        window.location.href = href;
      }
    }
  };

  // Convert backend image URL to frontend accessible URL
  const getImageUrl = (imageUrl: string) => {
    if (!imageUrl) return null;

    // If it's already a full URL, return as is
    if (imageUrl.startsWith('http')) return imageUrl;

    // If it starts with /media, /uploads, etc., prepend backend URL
    if (imageUrl.startsWith('/')) {
      return `${getApiBaseUrl()}${imageUrl}`;
    }

    // Otherwise assume it's a relative path from backend
    return `${getApiBaseUrl()}/${imageUrl}`;
  };

  const imageUrl = getImageUrl(card.imageUrl || '');

  const ImageCircle = (
    <div
      className={`relative mb-6 rounded-full overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105 w-40 h-40 sm:w-44 sm:h-44 md:w-48 md:h-48 lg:w-52 lg:h-52 ${
        href ? 'cursor-pointer' : ''
      }`}
      style={{
        backgroundColor: '#f8f9fa',
        border: '4px solid #ffffff',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
      }}
      onClick={!href ? undefined : handleCardClick}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={card.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            // Create a placeholder with initials or icon based on card type
            const placeholder = getPlaceholderForCard(card);
            target.parentElement!.innerHTML = placeholder;
          }}
        />
      ) : (
        <div
          className="w-full h-full flex items-center justify-center"
          dangerouslySetInnerHTML={{ __html: getPlaceholderForCard(card) }}
        />
      )}
    </div>
  );

  return (
    <div
      className="flex flex-col items-center text-center p-4 md:p-6 lg:p-8 animate-fade-in"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* Circular Image Container */}
      {href ? (
        <a href={href} target={target} rel={target === '_blank' ? 'noopener noreferrer' : undefined} className="block">
          {ImageCircle}
        </a>
      ) : (
        ImageCircle
      )}

      {/* Card Content */}
      <div className="flex flex-col items-center max-w-xs">
        {/* Subtitle (appears above title in blue) */}
        {card.subtitle && (
          href ? (
            <a
              href={href}
              target={target}
              rel={target === '_blank' ? 'noopener noreferrer' : undefined}
              className="text-sm font-semibold text-blue-600 mb-1 uppercase tracking-wider hover:underline"
            >
              {card.subtitle}
            </a>
          ) : (
            <p className="text-sm font-semibold text-blue-600 mb-1 uppercase tracking-wider">
              {card.subtitle}
            </p>
          )
        )}

        {/* Underline */}
        <div className="w-16 h-0.5 bg-blue-600 mb-3"></div>

        {/* Main Title */}
        {href ? (
          <a
            href={href}
            target={target}
            rel={target === '_blank' ? 'noopener noreferrer' : undefined}
            className="text-lg font-bold text-gray-900 text-center leading-tight hover:underline"
          >
            {card.title}
          </a>
        ) : (
          <h3 className="text-lg font-bold text-gray-900 text-center leading-tight">
            {card.title}
          </h3>
        )}

        {/* Description (if needed) */}
        {card.description && (
          <p className="text-sm text-gray-600 text-center leading-relaxed mt-2">
            {card.description}
          </p>
        )}
      </div>
    </div>
  );
};

// Main Corporate Management Page
const YonetimPage: React.FC = () => {
  const [cards, setCards] = useState<CorporateCard[]>([]);
  const [layoutSettings, setLayoutSettings] = useState<ParsedLayoutSettings>({
    cardsPerRow: 3,
    maxCardsPerPage: 12,
    cardSpacing: 'medium',
    responsiveBreakpoints: { mobile: 1, tablet: 2, desktop: 3 },
    showPagination: true,
    cardsAnimation: 'fade'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fallback data in case API fails
  const fallbackCards: CorporateCard[] = [
    {
      id: '1',
      title: 'Doç. Dr. Tahir BÜYÜKAKIN',
      subtitle: 'BAŞKANIMIZ',
      description: 'Kent Konut İdaresi Başkanı',
      imageUrl: '/media/kurumsal/kartlar/1753701562176_bxxx466huz.jpg',
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
      accentColor: '#3b82f6',
      displayOrder: 1,
      isActive: true,
      targetUrl: '/kurumsal/baskan',
      openInNewTab: false,
      imagePosition: 'center',
      cardSize: 'medium',
      borderRadius: 'rounded',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '2',
      title: 'Erhan COŞAN',
      subtitle: 'GENEL MÜDÜR',
      description: 'Kent Konut İdaresi Genel Müdürü',
      imageUrl: '/media/kurumsal/kartlar/1753701602359_dzppbgod8o8.jpg',
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
      accentColor: '#10b981',
      displayOrder: 2,
      isActive: true,
      targetUrl: '/kurumsal/genel-mudur',
      openInNewTab: false,
      imagePosition: 'center',
      cardSize: 'medium',
      borderRadius: 'rounded',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '3',
      title: 'MÜDÜRLÜKLER',
      subtitle: 'BİRİMLERİMİZ',
      description: 'Organizasyon yapımız ve birimlerimiz',
      imageUrl: '/media/kurumsal/kartlar/1753701622659_8cc59r4panc.jpg',
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
      accentColor: '#8b5cf6',
      displayOrder: 3,
      isActive: true,
      targetUrl: '/kurumsal/birimler',
      openInNewTab: false,
      imagePosition: 'center',
      cardSize: 'medium',
      borderRadius: 'rounded',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '4',
      title: 'MİSYONUMUZ',
      subtitle: 'STRATEJİMİZ',
      description: 'Kurumsal stratejimiz ve hedeflerimiz',
      imageUrl: '/media/kurumsal/kartlar/1753701636140_8dgfq47pqvi.jpg',
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
      accentColor: '#f59e0b',
      displayOrder: 4,
      isActive: true,
      targetUrl: '/kurumsal/strateji',
      openInNewTab: false,
      imagePosition: 'center',
      cardSize: 'medium',
      borderRadius: 'rounded',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '5',
      title: 'VİZYONUMUZ',
      subtitle: 'HEDEFİMİZ',
      description: 'Sürdürülebilir kentsel dönüşüm hedeflerimiz',
      imageUrl: '/media/kurumsal/kartlar/1753691557624_3m0mpguynyu.png',
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
      accentColor: '#ef4444',
      displayOrder: 5,
      isActive: true,
      targetUrl: '/kurumsal/hedef',
      openInNewTab: false,
      imagePosition: 'center',
      cardSize: 'medium',
      borderRadius: 'rounded',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch layout settings first
        const layoutResponse = await corporateService.getLayoutSettings();
        if (layoutResponse.success && layoutResponse.data) {
          console.log('📊 Layout response:', layoutResponse.data);
          const parsedSettings = layoutResponse.data.parsed || layoutResponse.data;
          setLayoutSettings(parsedSettings);
        } else {
          console.warn('⚠️ Using default layout settings due to API error');
        }

        // Fetch corporate cards
        const cardsResponse = await corporateService.getCorporateCards();
        if (cardsResponse.success && cardsResponse.data) {
          // Ensure data is an array
          const cardsData = Array.isArray(cardsResponse.data) ? cardsResponse.data : [];
          console.log('📊 Cards data:', cardsData);

          // Filter active cards and sort by displayOrder
          const activeCards = cardsData
            .filter(card => card.isActive)
            .sort((a, b) => a.displayOrder - b.displayOrder);
          setCards(activeCards);
        } else {
          console.error('❌ Cards response error:', cardsResponse);
          setError(cardsResponse.error || 'Kurumsal kartlar yüklenemedi');
        }
      } catch (err) {
        console.error('Data fetch error:', err);
        setError('Veriler yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Responsive grid layout: max 3 per row, centered
  const renderCardsGrid = () => {
    if (cards.length === 0) return null;

    return (
      <div className="w-full max-w-7xl mx-auto">
        <div className="flex justify-center">
          <div className="inline-grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
            {cards.map((card, index) => (
              <div key={card.id} className="w-full max-w-sm">
                <CorporateCardComponent card={card} index={index} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Kurumsal bilgiler yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="mt-2">
              {error}
            </AlertDescription>
          </Alert>
          <Button 
            onClick={() => window.location.reload()} 
            className="w-full mt-4"
            variant="outline"
          >
            Tekrar Dene
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-20 md:pt-24">
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.6s ease-out forwards;
          opacity: 0;
        }

        /* Hover effects for cards */
        .card-hover:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }
      `}</style>
      {/* Header */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Kurumsal Yönetim
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              Organizasyon yapımız ve yönetim kadromuz
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        {cards.length === 0 ? (
          <div className="text-center py-16 md:py-24">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Henüz kurumsal kart bulunmuyor
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Kurumsal kartlar eklendiğinde burada görüntülenecektir.
            </p>
          </div>
        ) : (
          renderCardsGrid()
        )}
      </div>
    </div>
  );
};

export default YonetimPage;
