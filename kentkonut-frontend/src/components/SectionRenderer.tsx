import React from 'react';
import { FooterSection } from '../types/footer';
import LinkSection from './sections/LinkSection';
import ImageSection from './sections/ImageSection';
import ContactSection from './sections/ContactSection';
import TextSection from './sections/TextSection';
import LegalSection from './sections/LegalSection';

interface SectionRendererProps {
  section: FooterSection;
}

const SectionRenderer: React.FC<SectionRendererProps> = ({ section }) => {
  switch (section.type) {
    case 'LINKS':
      return <LinkSection section={section} />;
    case 'IMAGE':
      return <ImageSection section={section} />;
    case 'CONTACT':
      return <ContactSection section={section} />;
    case 'TEXT':
      return <TextSection section={section} />;
    case 'LEGAL':
      return <LegalSection section={section} />;
    default:
      return <div>Unsupported section type: {section.type}</div>;
  }
};

export default SectionRenderer;
