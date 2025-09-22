import { Metadata } from 'next';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { renderContentToHTML } from '@/lib/content-renderer';
import { QuickAccessDisplay } from '@/components/quick-access/QuickAccessDisplay';
import './page.css';
import './tiptap-render.css';

// Bu fonksiyon sayfa metadata bilgilerini oluşturur
export async function generateMetadata({ 
  params 
}: { 
  params: { slug: string }
}): Promise<Metadata> {
  const { slug } = params;
  const page = await prisma.page.findUnique({
    where: { slug, isActive: true }
  });

  if (!page) {
    return {
      title: 'Sayfa Bulunamadı'
    };
  }

  return {
    title: page.metaTitle || page.title,
    description: page.metaDescription,
  };
}

export default async function Page({ params }: { params: { slug: string } }) {
  const { slug } = params;
  // Sayfayı veritabanından al
  const page = await prisma.page.findUnique({
    where: {
      slug,
      isActive: true
    },
    include: {
      quickAccessLinks: {
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' }
      }
    }
  });

  // Sayfa bulunamazsa 404 sayfasına yönlendir
  if (!page) {
    notFound();
  }

  const renderedContent = renderContentToHTML(page.content);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow-sm p-8">
                <h1 className="text-3xl font-bold mb-6 text-gray-900">{page.title}</h1>
                <div className="page-content styled-content-wrapper">
                  <div
                    dangerouslySetInnerHTML={{ __html: renderedContent }}
                  />
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="space-y-6">
                {/* Quick Access Links */}
                {page.hasQuickAccess && (
                  <QuickAccessDisplay
                    moduleType="page"
                    moduleId={page.id}
                    variant="sidebar"
                    title="Hızlı Erişim"
                    showCount={true}
                  />
                )}

                {/* Additional sidebar content can be added here */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
