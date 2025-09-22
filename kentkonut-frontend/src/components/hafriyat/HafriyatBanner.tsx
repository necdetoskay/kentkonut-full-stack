import React from 'react';

const HafriyatBanner: React.FC = () => {
  return (
    <div className="hafriyat-banner">
      <img 
        src="/hafriyat-banner.jpg" 
        alt="Hafriyat Çalışmaları" 
        className="w-full h-auto"
        style={{ maxHeight: '300px', objectFit: 'cover' }}
      />
    </div>
  );
};

export default HafriyatBanner;