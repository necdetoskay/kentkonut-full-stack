import { Metadata } from 'next';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { renderContentToHTML } from '@/lib/content-renderer';
import { getParams } from '@/lib/params-utils';
import { QuickAccessDisplay } from '@/components/quick-access/QuickAccessDisplay';
import './page.css';
import './tiptap-render.css';

// Bu fonksiyon sayfa metadata bilgilerini oluşturur
export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params;
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

// HTML'i tüm stilleriyle birlikte wrapper içine al
function getStyledContent(htmlContent: string) {
  const styles = `
    <style>
      .styled-content-wrapper {
        line-height: 1.7;
        font-size: 16px;
        color: #374151;
        font-family: system-ui, -apple-system, sans-serif;
      }

      .styled-content-wrapper p {
        margin-bottom: 1rem;
        line-height: 1.7;
        min-height: 1.7em;
      }

      .styled-content-wrapper p:empty {
        min-height: 1.7em;
        margin-bottom: 1rem;
      }

      .styled-content-wrapper p:empty::before {
        content: "\\00a0";
        opacity: 0;
      }

      .styled-content-wrapper h1, .styled-content-wrapper h2, .styled-content-wrapper h3,
      .styled-content-wrapper h4, .styled-content-wrapper h5, .styled-content-wrapper h6 {
        margin-top: 1.5rem;
        margin-bottom: 1rem;
        font-weight: 600;
        color: #1f2937;
      }

      .styled-content-wrapper strong {
        font-weight: 600;
        color: #1f2937;
      }

      .styled-content-wrapper ul, .styled-content-wrapper ol {
        margin-bottom: 1rem;
        padding-left: 1.5rem;
      }

      .styled-content-wrapper li {
        margin-bottom: 0.5rem;
      }

      /* Test sayfasındaki çalışan CSS'i kopyala */
      .styled-content-wrapper img[data-float="left"] {
        float: left !important;
        margin: 0 20px 20px 0 !important;
        clear: left !important;
        display: block !important;
        max-width: 300px !important;
        height: auto !important;
      }

      .styled-content-wrapper img[data-float="right"] {
        float: right !important;
        margin: 0 0 20px 20px !important;
        clear: right !important;
        display: block !important;
        max-width: 300px !important;
        height: auto !important;
      }

      .styled-content-wrapper img[data-float="center"],
      .styled-content-wrapper img[data-float="none"] {
        display: block !important;
        margin: 20px auto !important;
        clear: both !important;
        max-width: 100% !important;
        height: auto !important;
      }

      /* Clearfix for floating elements */
      .styled-content-wrapper::after {
        content: "";
        display: table;
        clear: both;
      }
    </style>
    <div class="styled-content-wrapper">
      ${htmlContent}
    </div>
  `;
  return styles;
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
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

  // Content'i server-side render et
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
                <div className="page-content">
                  <div
                    dangerouslySetInnerHTML={{ __html: getStyledContent(renderedContent) }}
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
