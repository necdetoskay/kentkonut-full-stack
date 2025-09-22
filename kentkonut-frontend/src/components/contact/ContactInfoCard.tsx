import React from 'react';
import type { ContactInfo } from '@/types/contact';

interface Props {
  item?: ContactInfo;
}

export const ContactInfoCard: React.FC<Props> = ({ item }) => {
  if (!item) {
    return (
      <div className="p-6 rounded-lg border bg-white shadow-sm">
        <div className="animate-pulse space-y-3">
          <div className="h-5 w-40 bg-gray-200 rounded" />
          <div className="h-4 w-72 bg-gray-100 rounded" />
          <div className="h-4 w-64 bg-gray-100 rounded" />
          <div className="h-4 w-48 bg-gray-100 rounded" />
        </div>
      </div>
    );
  }

  const isValidEmbed = item.mapUrl && item.mapUrl.startsWith('https://www.google.com/maps/embed?');
  const fallbackEmbed = !isValidEmbed && item.address
    ? `https://www.google.com/maps?q=${encodeURIComponent(item.address)}&output=embed`
    : null;

  return (
    <div className="p-6 rounded-lg border bg-white shadow-sm space-y-4">
      {item.title && (
        <h2 className="text-xl font-semibold text-gray-900">{item.title}</h2>
      )}
      <div className="space-y-3 text-gray-700">
        <div className="flex items-start gap-3">
          <span className="mt-1 text-gray-500">📍</span>
          <p>{item.address}</p>
        </div>
        {item.phonePrimary && (
          <div className="flex items-center gap-3">
            <span className="text-gray-500">📞</span>
            <a href={`tel:${item.phonePrimary}`} className="hover:underline">{item.phonePrimary}</a>
          </div>
        )}
        {item.phoneSecondary && (
          <div className="flex items-center gap-3">
            <span className="text-gray-500">☎️</span>
            <a href={`tel:${item.phoneSecondary}`} className="hover:underline">{item.phoneSecondary}</a>
          </div>
        )}
        {item.email && (
          <div className="flex items-center gap-3">
            <span className="text-gray-500">✉️</span>
            <a href={`mailto:${item.email}`} className="hover:underline">{item.email}</a>
          </div>
        )}
        {item.workingHours && (
          <div className="flex items-center gap-3">
            <span className="text-gray-500">⏰</span>
            <p>{item.workingHours}</p>
          </div>
        )}
      </div>
      {isValidEmbed || fallbackEmbed ? (
        <div className="rounded-lg overflow-hidden border">
          <iframe
            title="Harita"
            src={isValidEmbed ? item.mapUrl! : fallbackEmbed!}
            className="w-full h-64"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      ) : (
        <div className="text-sm text-gray-600 bg-gray-50 border rounded p-3">
          Harita görünmüyor. Lütfen yönetim panelinden geçerli bir Google Maps embed URL ("Share" → "Embed a map") girin.
        </div>
      )}
    </div>
  );
};

export default ContactInfoCard;
