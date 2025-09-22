import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';
import { DOMPurify } from '@/lib/sanitize';
import { QuickAccessDisplay } from '@/components/quick-access/QuickAccessDisplay';

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
    const departments = await db.department.findMany({
      where: { isActive: true },
      select: { slug: true },
    });

    return departments.map((department: { slug: string }) => ({
      slug: department.slug,
    }));
  } catch (error) {
    console.warn('Failed to generate static params for departments:', error);
    return [];
  }
}

// Generate metadata for the page
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  
  const department = await db.department.findUnique({
    where: { slug },
  });
  
  if (!department) {
    return {
      title: 'Birim Bulunamadı | Kent Konut',
    };
  }
  
  return {
    title: `${department.name} | Kent Konut`,
    description: `Kent Konut ${department.name} birimi hakkında bilgiler`,
  };
}

export default async function DepartmentDetail({ params }: Props) {
  const { slug } = await params;
  
  // Fetch department data with director and chiefs
  const department = await db.department.findUnique({
    where: { slug },
    include: {
      director: true,
      chiefs: {
        where: { isActive: true },
        orderBy: { order: 'asc' }
      },
      quickLinks: {
        where: { departmentId: { not: "" } },
        orderBy: { order: 'asc' }
      },
      quickAccessLinks: {
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' }
      }
    }
  });
  
  if (!department) {
    notFound();
  }

  // Sanitize the HTML content
  const sanitizedContent = DOMPurify.sanitize(department.content);
  
  return (
    <div className="container mx-auto px-4 py-10">
      {/* Department Header */}
      <div className="flex flex-col md:flex-row mb-10 gap-6">
        <div className="md:w-1/4">
          <div className="relative rounded-lg overflow-hidden h-52 md:h-64 w-full">
            {department.imageUrl ? (
              <Image 
                src={department.imageUrl}
                alt={department.name}
                fill
                sizes="(max-width: 768px) 100vw, 25vw"
                className="object-cover"
              />
            ) : (
              <div className="bg-gray-200 w-full h-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            )}
          </div>
        </div>
        
        <div className="md:w-3/4">
          <h1 className="text-3xl font-bold text-primary mb-4">
            {department.name}
          </h1>          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          </div>
          
          {department.quickLinks && department.quickLinks.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              <h3 className="w-full text-lg font-medium mb-2">Hızlı Erişim</h3>
              
              {department.quickLinks.map((link: { id: string; url: string; title: string; icon?: string | null }) => (
                <Link
                  key={link.id}
                  href={link.url}
                  className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700 transition"
                >
                  {link.icon && (
                    <span className="mr-2">
                      <i className={`fas fa-${link.icon}`}></i>
                    </span>
                  )}
                  {link.title}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Department Content */}
      <div className="mb-12">
        <div 
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: sanitizedContent }} 
        />
      </div>
      
      {/* Department Staff */}
      {(department.director || (department.chiefs && department.chiefs.length > 0)) && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-primary mb-6 border-b border-gray-200 pb-2">
            Birim Yönetimi
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {department.director && (
              <div className="col-span-1 md:col-span-3">
                <h3 className="text-xl font-medium text-gray-800 mb-4">Birim Müdürü</h3>
                <Link
                  href={`/personel/${department.director.slug}`}
                  className="flex flex-col md:flex-row gap-4 bg-white rounded-lg shadow-md p-5 transition-transform hover:shadow-lg hover:-translate-y-1"
                >
                  <div className="relative w-28 h-28 rounded-lg overflow-hidden">
                    {department.director.imageUrl ? (
                      <Image
                        src={department.director.imageUrl}
                        fill
                        sizes="112px"
                        className="object-cover"
                        alt={department.director.name}
                      />
                    ) : (
                      <div className="bg-gray-200 w-full h-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-800">{department.director.name}</h4>
                    <p className="text-primary mb-2">{department.director.title}</p>
                    
                    <div className="flex gap-4 mt-2">
                      {department.director.phone && (
                        <div className="flex items-center text-sm">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          {department.director.phone}
                        </div>
                      )}
                      
                      {department.director.email && (
                        <div className="flex items-center text-sm">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          {department.director.email}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center ml-auto">
                    <span className="text-primary group-hover:translate-x-1 transition-transform duration-300">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </span>
                  </div>
                </Link>
              </div>
            )}
            
            {department.chiefs && department.chiefs.length > 0 && (
              <>
                <div className="col-span-1 md:col-span-3 mt-8">
                  <h3 className="text-xl font-medium text-gray-800 mb-4">Birim Şefleri</h3>
                </div>
                
                {department.chiefs.map((chief: { id: string; slug: string; imageUrl: string | null; name: string; title: string; phone?: string | null; email?: string | null }) => (
                  <Link
                    key={chief.id}
                    href={`/personel/${chief.slug}`}
                    className="flex flex-col bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:shadow-lg hover:-translate-y-1"
                  >
                    <div className="relative w-full h-48">
                      {chief.imageUrl ? (
                        <Image 
                          src={chief.imageUrl}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover"
                          alt={chief.name}
                        />
                      ) : (
                        <div className="bg-gray-200 w-full h-full flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-5">
                      <h4 className="text-lg font-semibold text-gray-800">{chief.name}</h4>
                      <p className="text-primary mb-3">{chief.title}</p>
                      
                      <div className="flex flex-wrap gap-3">
                        {chief.phone && (
                          <div className="flex items-center text-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 01.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            {chief.phone}
                          </div>
                        )}
                        
                        {chief.email && (
                          <div className="flex items-center text-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            {chief.email}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </>
            )}
          </div>
        </div>
      )}

      {/* Quick Access Links */}
      {department.quickAccessLinks && department.quickAccessLinks.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-primary mb-6 border-b border-gray-200 pb-2">
            Hızlı Erişim Bağlantıları
          </h2>
          <QuickAccessDisplay links={department.quickAccessLinks} />
        </div>
      )}
    </div>
  );
}
