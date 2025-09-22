import React from 'react';
import { FooterSection } from '../../types/footer';
import { API_BASE_URL } from '../../config/environment';

interface ImageSectionProps {
  section: FooterSection;
}

const ImageSection: React.FC<ImageSectionProps> = ({ section }) => {
  const imageItem = section.items[0];

  if (!imageItem || !imageItem.imageUrl) {
    return null;
  }

  const resolveSrc = (u: string) => {
    if (!u) return '';
    if (u.startsWith('http://') || u.startsWith('https://') || u.startsWith('data:') || u.startsWith('blob:')) return u;
    if (u.startsWith('/')) return `${API_BASE_URL}${u}`;
    return `${API_BASE_URL}/${u}`;
  };

  return (
    <div className="col-span-12 md:col-span-4 flex items-center justify-center">
      <a
        href={imageItem.url || '#'}
        target={imageItem.isExternal ? '_blank' : '_self'}
        rel={imageItem.isExternal ? 'noopener noreferrer' : undefined}
        aria-label={imageItem.label || 'Kurumsal Logo'}
      >
        <img
          src={resolveSrc(imageItem.imageUrl)}
          alt={imageItem.label || 'Kurumsal Logo'}
          className="mx-auto w-full max-w-[250px] h-auto"
        />
      </a>
    </div>
  );
};

export default ImageSection;
