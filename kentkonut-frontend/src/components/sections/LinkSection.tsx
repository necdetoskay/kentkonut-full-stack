import React from 'react';
import { FooterSection } from '../../types/footer';

interface LinkSectionProps {
  section: FooterSection;
}

const LinkSection: React.FC<LinkSectionProps> = ({ section }) => {
  const isHorizontal = section.orientation === 'HORIZONTAL';

  if (isHorizontal) {
    return (
      <div>
        {section.title && <h3 className="font-bold text-lg mb-3">{section.title}</h3>}
        <ul className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          {section.items.map((item, idx) => (
            <li key={item.id} className="flex items-center">
              <a
                href={item.url || '#'}
                className="hover:text-gray-300 transition-colors"
                target={item.isExternal ? '_blank' : '_self'}
                rel={item.isExternal ? 'noopener noreferrer' : undefined}
              >
                {item.label}
              </a>
              {idx < section.items.length - 1 && (
                <span className="mx-2 text-gray-400 select-none">|</span>
              )}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  // Vertical (default)
  return (
    <div>
      {section.title && <h3 className="font-bold text-lg mb-4">{section.title}</h3>}
      <ul className="space-y-2">
        {section.items.map((item) => (
          <li key={item.id}>
            <a
              href={item.url || '#'}
              className="hover:text-gray-300 transition-colors"
              target={item.isExternal ? '_blank' : '_self'}
              rel={item.isExternal ? 'noopener noreferrer' : undefined}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LinkSection;
