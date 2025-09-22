import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import Image from 'next/image';
import { Metadata } from 'next';
import { sanitizeRichContent } from '@/lib/sanitize';

// Define the types for the page props
type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  // Skip during build if no database connection
  if (process.env.DATABASE_URL?.includes('placeholder')) {
    return [];
  }

  try {
    const personnel = await db.personnel.findMany({
      where: { isActive: true },
      select: { slug: true },
    });

    return personnel.map((person: any) => ({
      slug: person.slug,
    }));
  } catch (error) {
    console.warn('Failed to generate static params for personnel:', error);
    return [];
  }
}

// Generate metadata for the page
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  
  const person = await db.personnel.findUnique({
    where: { slug },
  });
  
  if (!person) {
    return {
      title: 'Personel Bulunamadı | Kent Konut',
    };
  }
  
  return {
    title: `${person.name} - ${person.title} | Kent Konut`,
    description: `Kent Konut personeli ${person.name} hakkında bilgiler`,
  };
}

export default async function PersonnelDetail({ params }: Props) {
  const { slug } = await params;
  
  // Fetch personnel data with gallery
  const person = await db.personnel.findUnique({
    where: { slug },
    include: {
      galleryItems: {
        include: {
          media: true
        },
        orderBy: {
          order: 'asc'
        }
      },
      directedDept: true,
      chiefInDepts: true
    }
  });
  
  if (!person) {
    notFound();
  }

  const sanitizedContent = sanitizeRichContent(person.content);

  // This function injects !important inline styles to win any CSS specificity wars.
  const adaptAndForceStyles = (html: string): string => {
    if (!html) return '';

    // This regex finds paragraphs with centered text and an image inside.
    return html.replace(
      /(<p style="[^"]*text-align: center;[^"]*">\s*(<img[^>]+>)\s*<\/p>)/g,
      (match, pTag, imgTag) => {
        // We rebuild the <p> tag, injecting our forceful flexbox styles.
        return `<p style="display: flex !important; justify-content: center !important; align-items: center !important;">${imgTag}</p>`;
      }
    );
  };

  const finalContent = adaptAndForceStyles(sanitizedContent);
  
  // Separate gallery items by type
  const imageGalleryItems = person.galleryItems.filter((item: any) => item.type === 'IMAGE');
  const documentGalleryItems = person.galleryItems.filter((item: any) => ['DOCUMENT', 'PDF', 'WORD'].includes(item.type));
  
  return (
    <div className="container mx-auto px-4 py-10">
      {/* Personnel Header */}
      <div className="flex flex-col md:flex-row items-start gap-8 mb-12">
        <div className="md:w-1/3">
          <div className="relative h-72 w-full rounded-lg overflow-hidden shadow-lg mb-6">
            {person.imageUrl ? (
              <Image 
                src={person.imageUrl}
                alt={person.name}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover"
              />
            ) : (
              <div className="bg-gray-200 w-full h-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            )}
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">{person.name}</h1>
            <p className="text-primary font-medium text-lg mb-4">{person.title}</p>
            
            <div className="space-y-3">
              {person.phone && (
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="text-gray-700">{person.phone}</span>
                </div>
              )}
              
              {person.email && (
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <a href={`mailto:${person.email}`} className="text-primary hover:underline">
                    {person.email}
                  </a>
                </div>
              )}
              
              {/* Show department affiliations */}
              {person.type === 'DIRECTOR' && person.directedDept && (
                <div className="flex items-center mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span className="text-gray-700">
                    {person.directedDept.name} Müdürü
                  </span>
                </div>
              )}
              
              {person.type === 'CHIEF' && person.chiefInDepts.length > 0 && (
                <div className="flex flex-col">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span className="text-gray-700">
                      {person.chiefInDepts.length > 1 ? 'Şef olduğu birimler:' : 'Şef olduğu birim:'}
                    </span>
                  </div>
                  <ul className="ml-7 mt-1 space-y-1">
                    {person.chiefInDepts.map((dept: any) => (
                      <li key={dept.id} className="text-gray-700">
                        • {dept.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="md:w-2/3">
          <h2 className="text-2xl font-bold text-primary mb-6 pb-2 border-b border-gray-200">
            Özgeçmiş
          </h2>
          
          {person.content ? (
            <div 
              dangerouslySetInnerHTML={{ __html: finalContent }} 
            />
          ) : (
            <p className="text-gray-500 italic">Bu personel için henüz özgeçmiş bilgisi girilmemiştir.</p>
          )}
          
          {/* Personnel Gallery */}
          {imageGalleryItems.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-primary mb-6 pb-2 border-b border-gray-200">
                Görsel Galerisi
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {imageGalleryItems.map((item: any) => (
                  <div key={item.id} className="group relative h-48 rounded-lg overflow-hidden shadow-md">
                    <Image 
                      src={item.media.url || item.media.path}
                      alt={item.title || item.media.alt || `Galeri görseli ${item.order + 1}`}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {(item.title || item.description) && (
                        <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                          {item.title && <h3 className="font-semibold text-sm">{item.title}</h3>}
                          {item.description && <p className="text-xs mt-1">{item.description}</p>}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Documents Gallery */}
          {documentGalleryItems.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-primary mb-6 pb-2 border-b border-gray-200">
                Dokümanlar
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {documentGalleryItems.map((item: any) => {
                  // Determine document icon based on type
                  let icon = "file-alt";
                  if (item.type === 'PDF') icon = "file-pdf";
                  if (item.type === 'WORD') icon = "file-word";
                  
                  return (
                    <a 
                      key={item.id}
                      href={item.media.url || item.media.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
                    >
                      <div className="bg-gray-100 rounded p-3 mr-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-800">
                          {item.title || item.media.originalName || "Doküman"}
                        </h3>
                        {item.description && (
                          <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                        )}
                      </div>
                      
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
