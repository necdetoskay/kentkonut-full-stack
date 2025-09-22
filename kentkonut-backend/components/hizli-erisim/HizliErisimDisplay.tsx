'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// Define the shape of the link data we expect from the API
interface HizliErisimOgesi {
  id: string;
  title: string;
  hedefUrl: string;
}

interface HizliErisimSayfa {
    id: string;
    sayfaUrl: string;
    baslik: string;
    aktif: boolean;
    linkler: HizliErisimOgesi[];
}

interface HizliErisimDisplayProps {
  pageUrl: string;
  className?: string;
}

export const HizliErisimDisplay: React.FC<HizliErisimDisplayProps> = ({ pageUrl, className }) => {
  const [data, setData] = useState<HizliErisimSayfa | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!pageUrl) {
        setLoading(false);
        return;
    }

    const fetchLinks = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/frontend/hizli-erisim?url=${encodeURIComponent(pageUrl)}`);
        if (!response.ok) {
          // Don't throw an error, just log it. The component will fail silently.
          console.error('Hızlı erişim linkleri yüklenemedi.');
          return;
        }
        const result = await response.json();
        setData(result);
      } catch (err: any) {
        console.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLinks();
  }, [pageUrl]);

  const handleLinkClick = async (link: HizliErisimOgesi) => {
    // Track the click in the background without waiting for it
    fetch('/api/frontend/hizli-erisim/track-click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: link.id }),
    }).catch(error => {
        // Log tracking error but do not block navigation
        console.error("Hızlı erişim tıklama takibi başarısız:", error);
    });

    // Navigate
    const isExternal = link.hedefUrl.startsWith('http');
    if (isExternal) {
        window.open(link.hedefUrl, '_blank', 'noopener,noreferrer');
    } else {
        router.push(link.hedefUrl);
    }
  };

  // If loading, show a skeleton loader
  if (loading) {
    return (
        <div className={`p-6 border rounded-lg bg-white shadow-sm ${className}`}>
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-5 animate-pulse"></div>
            <div className="space-y-3">
                <div className="h-5 bg-gray-200 rounded w-full animate-pulse"></div>
                <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                <div className="h-5 bg-gray-200 rounded w-full animate-pulse"></div>
                <div className="h-5 bg-gray-200 rounded w-2/3 animate-pulse"></div>
            </div>
        </div>
    );
  }

  // If no data or no links, render nothing
  if (!data || !data.linkler || data.linkler.length === 0) {
    return null;
  }

  return (
    <aside className={`p-6 border rounded-lg bg-white shadow-sm ${className}`}>
      <h3 className="text-lg font-semibold mb-4 text-gray-900 border-b pb-3">{data.baslik}</h3>
      <nav>
        <ul className="space-y-1">
          {data.linkler.map((link) => (
            <li key={link.id}>
              <a
                href={link.hedefUrl}
                onClick={(e) => {
                  e.preventDefault();
                  handleLinkClick(link);
                }}
                className="block py-2 px-3 rounded-md text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition-colors duration-200"
              >
                {link.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};