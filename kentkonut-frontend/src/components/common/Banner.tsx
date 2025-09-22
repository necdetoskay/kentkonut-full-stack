import React from 'react';

interface BannerProps {
  imagePath: string;
  altText?: string;
  height?: string;
}

const Banner: React.FC<BannerProps> = ({ 
  imagePath, 
  altText = "Banner Resmi", 
  height = "300px" 
}) => {
  return (
    <div className="banner-container w-full">
      <img 
        src={imagePath} 
        alt={altText} 
        className="w-full" 
        style={{ 
          height, 
          objectFit: 'cover',
          objectPosition: 'center'
        }} 
      />
    </div>
  );
};

export default Banner;