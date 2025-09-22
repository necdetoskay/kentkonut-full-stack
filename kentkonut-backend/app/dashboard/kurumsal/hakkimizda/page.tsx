
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Building2, Users, Target, Link as LinkIcon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import prisma from "@/lib/prisma";
import { Highlight, Executive, CorporateContent, HighlightSourceType } from "@prisma/client";

// Veri çekme fonksiyonu (Kurumsal Vitrin sayfasından uyarlandı)
async function getHighlightsData() {
  const highlights = await prisma.highlight.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
  });

  const detailedHighlights = await Promise.all(
    highlights.map(async (highlight) => {
      let executiveData: Executive | null = null;
      let contentData: CorporateContent | null = null;

      if (highlight.sourceType === 'PRESIDENT' || highlight.sourceType === 'GENERAL_MANAGER') {
        const executiveTypeMap = {
          PRESIDENT: "Başkan",
          GENERAL_MANAGER: "Genel Müdür"
        };
        // sourceRefId kullanarak doğru yöneticiyi bulmak daha doğru olur.
        // Eğer sourceRefId boş ise, başlığa göre bulmayı dener.
        executiveData = highlight.sourceRefId 
          ? await prisma.executive.findUnique({ where: { id: highlight.sourceRefId } })
          : await prisma.executive.findFirst({ where: { title: executiveTypeMap[highlight.sourceType] } });

      } else if (highlight.sourceType === 'VISION' || highlight.sourceType === 'MISSION') {
        contentData = highlight.sourceRefId
          ? await prisma.corporateContent.findUnique({ where: { id: highlight.sourceRefId } })
          : await prisma.corporateContent.findUnique({ where: { type: highlight.sourceType as 'VISION' | 'MISSION' } });
      }

      return {
        ...highlight,
        executiveData,
        contentData,
      };
    })
  );

  return detailedHighlights;
}

// Bileşenler
function ExecutiveCard({ executive }: { executive: Executive }) {
  const detailUrl = `/dashboard/kurumsal/yoneticiler/${executive.id}`;
  return (
    <Link href={detailUrl} passHref>
      <Card className="group hover:shadow-xl transition-all duration-300 h-full flex flex-col cursor-pointer">
        <CardHeader>
          <div className="relative w-full h-48 mb-4">
            <Image
              src={executive.imageUrl || '/placeholder-person.jpg'}
              alt={executive.name}
              layout="fill"
              objectFit="cover"
              className="rounded-lg"
            />
          </div>
          <CardTitle>{executive.name}</CardTitle>
          <CardDescription>{executive.title}</CardDescription>
          <a href={detailUrl} className="text-blue-500 underline font-bold text-lg mt-2 block">
            DEBUG: YÖNETİCİ DETAY LİNKİ
          </a>
        </CardHeader>
        <CardContent className="flex-grow">
          <p className="text-sm text-muted-foreground line-clamp-3">
            {executive.content || 'Biyografi bilgisi bulunmamaktadır.'}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

function ContentCard({ content }: { content: CorporateContent }) {
  // Vizyon ve Misyon için sabit URL'ler
  const detailUrl = content.type === 'VISION' || content.type === 'MISSION' 
    ? '/dashboard/kurumsal/visyon-misyon'
    : `/dashboard/kurumsal/icerik/${content.id}`;

  return (
    <Link href={detailUrl} passHref>
      <Card className="group hover:shadow-xl transition-all duration-300 h-full flex flex-col cursor-pointer">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target /> {content.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-grow">
          <p className="text-sm text-muted-foreground line-clamp-5">
            {content.content}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

function DepartmentLinkCard() {
  return (
    <Link href="/dashboard/kurumsal/birimler" passHref>
      <Card className="group hover:shadow-xl transition-all duration-300 h-full flex flex-col justify-center items-center text-center p-6 cursor-pointer">
        <Building2 className="w-12 h-12 mb-4 text-blue-600" />
        <CardTitle>Birimlerimiz</CardTitle>
        <div className="flex items-center text-sm text-blue-600 mt-2">
          Detaylar için tıklayın <ArrowRight className="w-4 h-4 ml-1" />
        </div>
      </Card>
    </Link>
  );
}

// Ana Sayfa Bileşeni
export default async function HakkimizdaPage() {
  const highlights = await getHighlightsData();

  const renderHighlight = (highlight: Awaited<ReturnType<typeof getHighlightsData>>[0]) => {
    switch (highlight.sourceType) {
      case 'PRESIDENT':
      case 'GENERAL_MANAGER':
        return highlight.executiveData ? <ExecutiveCard executive={highlight.executiveData} /> : null;
      case 'DEPARTMENTS':
        return <DepartmentLinkCard />;
      case 'VISION':
      case 'MISSION':
        return highlight.contentData ? <ContentCard content={highlight.contentData} /> : null;
      default:
        // Diğer custom highlight türleri için bir kart gösterilebilir
        if (highlight.redirectUrl) {
            return (
                <Link href={highlight.redirectUrl} passHref>
                    <Card className="group hover:shadow-xl transition-all duration-300 h-full flex flex-col justify-center items-center text-center p-6 cursor-pointer">
                        <LinkIcon className="w-12 h-12 mb-4 text-gray-600" />
                        <CardTitle>{highlight.titleOverride || 'Detaylar'}</CardTitle>
                        <div className="flex items-center text-sm text-blue-600 mt-2">
                            Daha fazla bilgi <ArrowRight className="w-4 h-4 ml-1" />
                        </div>
                    </Card>
                </Link>
            )
        }
        return null;
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Breadcrumb
        className="mb-6"
        segments={[
          { name: "Dashboard", href: "/dashboard" },
          { name: "Kurumsal", href: "/dashboard/kurumsal" },
          { name: "Hakkımızda", href: "/dashboard/kurumsal/hakkimizda" },
        ]}
      />
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Hakkımızda</h1>
        <p className="text-muted-foreground mt-2">
          Kent Konut A.Ş. vizyonu, misyonu ve temel yapı taşları.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {highlights.map((highlight) => (
          <div key={highlight.id} className="w-full">
            {renderHighlight(highlight)}
          </div>
        ))}
      </div>
    </div>
  );
}
