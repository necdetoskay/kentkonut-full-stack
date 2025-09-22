import React, { useState } from 'react';

// Mock service card data for testing
const mockServiceCards = [
  {
    id: 1,
    title: 'Konut Hizmetleri',
    imageSrc: 'https://via.placeholder.com/400x300/4F772D/white?text=Konut',
    color: '#4F772D',
    shortDescription: 'Konut Hizmetleri hizmetlerimiz hakkında detaylı bilgi'
  },
  {
    id: 2,
    title: 'Hafriyat Hizmetleri',
    imageSrc: 'https://via.placeholder.com/400x300/31708E/white?text=Hafriyat',
    color: '#31708E',
    shortDescription: 'Hafriyat Hizmetleri hizmetlerimiz hakkında detaylı bilgi'
  },
  {
    id: 3,
    title: 'Mimari Projelendirme',
    imageSrc: 'https://via.placeholder.com/400x300/5B4E77/white?text=Mimari',
    color: '#5B4E77',
    shortDescription: 'Mimari Projelendirme hizmetlerimiz hakkında detaylı bilgi'
  },
  {
    id: 4,
    title: 'Kentsel Dönüşüm',
    imageSrc: 'https://via.placeholder.com/400x300/754043/white?text=Kentsel',
    color: '#754043',
    shortDescription: 'Kentsel Dönüşüm hizmetlerimiz hakkında detaylı bilgi'
  }
];

const ServiceCardCenteringDemo: React.FC = () => {
  const [cardCount, setCardCount] = useState(4);

  // Get dynamic grid classes based on number of cards
  const getGridClasses = (cardCount: number): string => {
    const baseClasses = "grid gap-8";
    
    if (cardCount === 1) {
      // Single card - center it
      return `${baseClasses} grid-cols-1 justify-items-center max-w-sm mx-auto`;
    } else if (cardCount === 2) {
      // Two cards - center them with responsive layout
      return `${baseClasses} grid-cols-1 md:grid-cols-2 justify-items-center max-w-2xl mx-auto`;
    } else if (cardCount === 3) {
      // Three cards - responsive layout with centering
      return `${baseClasses} grid-cols-1 md:grid-cols-2 lg:grid-cols-3 justify-items-center max-w-4xl mx-auto`;
    } else {
      // Four or more cards - full width layout
      return `${baseClasses} grid-cols-1 md:grid-cols-2 lg:grid-cols-4`;
    }
  };

  const displayedCards = mockServiceCards.slice(0, cardCount);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Service Card Centering Demo</h2>
        
        {/* Controls */}
        <div className="mb-8 p-4 bg-gray-100 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Test Different Card Counts:</h3>
          <div className="flex gap-4 flex-wrap">
            {[1, 2, 3, 4].map(count => (
              <button
                key={count}
                onClick={() => setCardCount(count)}
                className={`px-4 py-2 rounded font-medium transition-colors ${
                  cardCount === count
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border'
                }`}
              >
                {count} Card{count > 1 ? 's' : ''}
              </button>
            ))}
          </div>
          
          <div className="mt-4 text-sm text-gray-600">
            <p><strong>Current Grid Classes:</strong> <code className="bg-white px-2 py-1 rounded">{getGridClasses(cardCount)}</code></p>
            <p><strong>Cards Displayed:</strong> {cardCount} of {mockServiceCards.length}</p>
          </div>
        </div>

        {/* Service Cards Section */}
        <section className="bg-white py-16 px-4">
          <div className="container mx-auto">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">HİZMETLERİMİZ</h2>
              <div className="flex items-center justify-center">
                <div className="h-1 w-20 bg-green-700"></div>
                <div className="h-1 w-10 bg-gray-300 mx-3"></div>
                <div className="h-1 w-20 bg-green-700"></div>
              </div>
            </div>
            
            {/* Dynamic Grid */}
            <div className={getGridClasses(cardCount)}>
              {displayedCards.map((service) => (
                <div 
                  key={service.id} 
                  className="services-card group rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer w-full max-w-sm mx-auto"
                  style={{ borderTopColor: service.color, borderTopWidth: '4px' }}
                >
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={service.imageSrc}
                      alt={service.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-6 bg-white text-center">
                    <h3 
                      className="text-xl font-semibold transition-colors duration-300 group-hover:opacity-80"
                      style={{ color: service.color }}
                    >
                      {service.title}
                    </h3>
                    {service.shortDescription && (
                      <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                        {service.shortDescription}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Layout Analysis */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Layout Analysis:</h3>
          <div className="text-sm text-gray-700 space-y-1">
            {cardCount === 1 && (
              <p>✅ <strong>1 Card:</strong> Centered with max-width constraint for optimal viewing</p>
            )}
            {cardCount === 2 && (
              <p>✅ <strong>2 Cards:</strong> Centered pair with responsive layout (1 col mobile, 2 cols tablet+)</p>
            )}
            {cardCount === 3 && (
              <p>✅ <strong>3 Cards:</strong> Centered trio with responsive layout (1 col mobile, 2 cols tablet, 3 cols desktop)</p>
            )}
            {cardCount === 4 && (
              <p>✅ <strong>4 Cards:</strong> Full-width layout utilizing entire container space</p>
            )}
            <p><strong>Responsive Breakpoints:</strong> Mobile (1 col) → Tablet (2 cols) → Desktop (3-4 cols)</p>
            <p><strong>Centering Method:</strong> CSS Grid with justify-items-center and mx-auto container</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceCardCenteringDemo;
