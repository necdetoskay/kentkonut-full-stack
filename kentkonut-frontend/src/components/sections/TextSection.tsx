import React from 'react';
import { FooterSection } from '../../types/footer';

interface TextSectionProps {
  section: FooterSection;
}

const TextSection: React.FC<TextSectionProps> = ({ section }) => {
  const textItem = section.items[0];

  if (!textItem || !textItem.text) {
    return null;
  }

  return (
    <div>
      <p>{textItem.text}</p>
    </div>
  );
};

export default TextSection;
