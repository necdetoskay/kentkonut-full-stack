
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { User, Briefcase, Mail, Phone, Linkedin } from "lucide-react";

async function getExecutive(id: string) {
  const executive = await prisma.executive.findUnique({
    where: { id },
  });
  if (!executive) {
    notFound();
  }
  return executive;
}

export default async function ExecutiveDetailPage({ params }: { params: { id: string } }) {
  const executive = await getExecutive(params.id);

  return (
    <div className="container mx-auto py-10">
      <Breadcrumb
        className="mb-6"
        segments={[
          { name: "Dashboard", href: "/dashboard" },
          { name: "Kurumsal", href: "/dashboard/kurumsal" },
          { name: "Yöneticiler", href: "/dashboard/kurumsal/yoneticiler" },
          { name: executive.name, href: `/dashboard/kurumsal/yoneticiler/${executive.id}` },
        ]}
      />
      <Card className="overflow-hidden">
        <CardHeader className="bg-muted/40 p-6">
          <div className="flex items-start gap-6">
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-background shadow-lg">
              <Image
                src={executive.imageUrl || "/placeholder-person.jpg"}
                alt={executive.name}
                layout="fill"
                objectFit="cover"
              />
            </div>
            <div className="pt-4">
              <CardTitle className="text-3xl font-bold">{executive.name}</CardTitle>
              <CardDescription className="text-xl text-primary mt-1">{executive.title}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2 flex items-center"><Briefcase className="w-5 h-5 mr-2" /> Biyografi</h3>
            <div 
              className="prose prose-sm max-w-none text-muted-foreground"
              dangerouslySetInnerHTML={{ __html: executive.content || "<p>Biyografi bilgisi bulunmamaktadır.</p>" }}
            />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2 flex items-center"><Mail className="w-5 h-5 mr-2" /> İletişim Bilgileri</h3>
            <div className="space-y-1 text-muted-foreground">
              {executive.email && <p className="flex items-center"><Mail className="w-4 h-4 mr-2" /> {executive.email}</p>}
              {executive.phone && <p className="flex items-center"><Phone className="w-4 h-4 mr-2" /> {executive.phone}</p>}
              {executive.linkedIn && 
                <a href={executive.linkedIn} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-600 hover:underline">
                  <Linkedin className="w-4 h-4 mr-2" /> LinkedIn Profili
                </a>
              }
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
