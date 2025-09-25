import React from 'react';
import { FooterSection } from '../../types/footer';
import { MapPin, Mail, Phone } from 'lucide-react';

interface ContactSectionProps {
  section: FooterSection;
}

const iconFor = (type: string, iconKey?: string | null) => {
  const k = (iconKey || '').toLowerCase();
  if (k.includes('map') || k.includes('location') || k.includes('pin')) return <MapPin className="w-5 h-5" aria-hidden="true" />;
  if (k.includes('mail') || k.includes('email')) return <Mail className="w-5 h-5" aria-hidden="true" />;
  if (k.includes('phone') || k.includes('call') || k.includes('tel')) return <Phone className="w-5 h-5" aria-hidden="true" />;
  // fallback by type
  if (type === 'ADDRESS') return <MapPin className="w-5 h-5" aria-hidden="true" />;
  if (type === 'EMAIL') return <Mail className="w-5 h-5" aria-hidden="true" />;
  if (type === 'PHONE') return <Phone className="w-5 h-5" aria-hidden="true" />;
  return null;
};

const ContactSection: React.FC<ContactSectionProps> = ({ section }) => {
  return (
    <div className="col-span-12 md:col-span-4">
      <div className="space-y-4">
        {section.items.map((item) => {
          const iconEl = iconFor(item.type, item.icon || undefined);
          if (item.type === 'ADDRESS') {
            return (
              <div key={item.id} className="flex items-start gap-3">
                {iconEl && <span className="mt-0.5 text-gray-300">{iconEl}</span>}
                <span className="text-gray-200">{item.text || item.label}</span>
              </div>
            );
          }
          if (item.type === 'EMAIL' || item.type === 'PHONE') {
            return (
              <div key={item.id} className="flex items-start gap-3">
                {iconEl && <span className="mt-0.5 text-gray-300">{iconEl}</span>}
                <a href={item.url || '#'} className="text-gray-200 hover:text-white">{item.label || item.text}</a>
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
};

export default ContactSection;
