import React from 'react';
import { FooterSection } from '../../types/footer';

interface LegalSectionProps {
  section: FooterSection;
}

const LegalSection: React.FC<LegalSectionProps> = ({ section }) => {
  return (
    <div className="text-sm">
      <div className="flex flex-wrap items-center justify-end gap-2">
        {section.items.map((item, idx) => (
          <div key={item.id} className="flex items-center">
            <a
              href={item.url || '#'}
              className="hover:text-white"
              target={item.isExternal ? '_blank' : '_self'}
              rel={item.isExternal ? 'noopener noreferrer' : undefined}
            >
              {item.label}
            </a>
            {idx < section.items.length - 1 && (
              <span className="mx-2 text-gray-400 select-none">|</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LegalSection;
