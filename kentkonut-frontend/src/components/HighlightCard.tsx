import React from 'react';
import { Link } from 'react-router-dom';
import { Highlight, highlightsService } from '../services/highlightsService';

interface HighlightCardProps {
  highlight: Highlight;
  className?: string;
}

const HighlightCard: React.FC<HighlightCardProps> = ({ highlight, className = '' }) => {
  const imageUrl = highlightsService.getHighlightImageUrl(highlight);
  const imageClasses = 'w-full h-full object-cover rounded-full';

  const isExternal = highlight.redirectUrl && (highlight.redirectUrl.startsWith('http') || highlight.redirectUrl.startsWith('www'));

  const CardContent = () => (
    <div className={`flex flex-col items-center p-4 transition-all duration-300 group ${className}`}>
      {/* Circular Image Container */}
      <div className="relative w-40 h-40 sm:w-48 sm:h-48 mb-6 rounded-full shadow-lg group-hover:shadow-xl transition-shadow duration-300 transform group-hover:-translate-y-1">
        <img
          src={imageUrl}
          alt={highlight.title}
          className={imageClasses}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            const svg = encodeURIComponent(
              `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>
                <circle cx='50' cy='50' r='50' fill='#e5e7eb'/>
                <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='#9ca3af' font-size='10'>Görsel Yok</text>
              </svg>`
            );
            target.src = `data:image/svg+xml;charset=UTF-8,${svg}`;
          }}
        />
        <div className="absolute inset-0 rounded-full ring-2 ring-transparent group-hover:ring-blue-500 transition-all duration-300" />
      </div>

      {/* Content Container */}
      <div className="text-center">
        {/* Üst başlık */}
        <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-1 tracking-wide uppercase group-hover:text-blue-700 transition-colors duration-300">
          {highlight.title}
        </h3>
        {/* Alt başlık */}
        {highlight.subtitle && (
          <p className="text-blue-900 text-sm sm:text-base font-bold uppercase">
            {highlight.subtitle}
          </p>
        )}
      </div>
    </div>
  );

  if (highlight.routeOverride) {
    return (
      <Link to={highlight.routeOverride} className="cursor-pointer">
        <CardContent />
      </Link>
    );
  }

  if (highlight.redirectUrl) {
    return (
      <a
        href={highlight.redirectUrl}
        target={isExternal ? '_blank' : '_self'}
        rel={isExternal ? 'noopener noreferrer' : ''}
        className="cursor-pointer"
      >
        <CardContent />
      </a>
    );
  }

  return <CardContent />;
};

export default HighlightCard;
