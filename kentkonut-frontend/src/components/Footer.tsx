import React, { useEffect, useState } from 'react';
import { FooterSection } from '../types/footer';
import { getFooterSections } from '../services/footerService';
import SectionRenderer from './SectionRenderer';

const Footer: React.FC = () => {
  const [sections, setSections] = useState<FooterSection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFooterData = async () => {
      try {
        const data = await getFooterSections();
        setSections(data);
      } catch (error) {
        console.error("Failed to fetch footer sections:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFooterData();
  }, []);

  if (loading) {
    return <footer className="bg-gray-800 text-white p-8 text-center">Yükleniyor...</footer>;
  }

  if (!sections || sections.length === 0) {
    return <footer className="bg-gray-800 text-white p-8 text-center">Altbilgi bilgileri yüklenemedi.</footer>;
  }

  // Select sections according to the desired 4-column + 2-column layout
  const linksSections = sections
    .filter(s => s.type === 'LINKS')
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const links1 = linksSections[0];
  const links2 = linksSections[1];
  const remainingLinkSections = linksSections.slice(2);

  // Prefer IMAGE section for center brand; fallback to TEXT if not available
  const centerImage = sections.find(s => s.type === 'IMAGE');
  let centerSection: FooterSection | undefined = centerImage;
  let textSection: FooterSection | undefined = sections.find(s => s.type === 'TEXT');

  if (!centerSection && textSection) {
    centerSection = textSection;
    // If TEXT is consumed as center, avoid duplicating it in bottom-left
    textSection = undefined;
  }

  const contactSection = sections.find(s => s.type === 'CONTACT');
  const legalSection = sections.find(s => s.type === 'LEGAL');

  return (
    <footer className="relative text-white w-full bg-[#343434]" role="contentinfo" aria-label="Site altbilgisi">
      <div 
        className="absolute inset-0 w-full h-full z-0" 
        style={{ 
          backgroundImage: 'url(/referanslar/footer_back.jpg)', 
          backgroundSize: 'cover',
          backgroundPosition: 'left top',
        }}
      ></div>
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Top: 4-column layout */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>{links1 && <SectionRenderer section={links1} />}</div>
          <div>{links2 && <SectionRenderer section={links2} />}</div>
          <div className="flex justify-center md:justify-center">
            {centerSection && <SectionRenderer section={centerSection} />}
          </div>
          <div>{contactSection && <SectionRenderer section={contactSection} />}</div>
        </div>

        {/* Additional link sections (5th and beyond) */}
        {remainingLinkSections.length > 0 && (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-8">
            {remainingLinkSections.map((sec) => (
              <div key={sec.id}>
                <SectionRenderer section={sec} />
              </div>
            ))}
          </div>
        )}

        {/* Bottom bar: 2-column layout (always side-by-side) */}
        <div className="border-t border-gray-700 mt-8 pt-6 grid grid-cols-2 gap-4 items-center text-sm">
          <div className="text-left">
            {textSection && <SectionRenderer section={textSection} />}
          </div>
          <div className="text-right">
            {legalSection && <SectionRenderer section={legalSection} />}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
