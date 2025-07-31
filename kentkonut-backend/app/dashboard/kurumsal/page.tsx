"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { 
  Users, 
  Link, 
  Building2, 
  Award,
  TrendingUp,
  FileText,
  Settings,
  Globe,
  Shield,
  Target,
  ArrowRight,
  Activity,
  Calendar,
  BarChart3
} from "lucide-react";
import { useCorporateStatistics } from "@/hooks/useCorporate";
import CorporateErrorBoundary from "@/components/corporate/CorporateErrorBoundary";
import { LoadingSkeleton } from "@/components/ui/loading";

export default function CorporatePage() {
  const router = useRouter();
  const { statistics, isLoading } = useCorporateStatistics();

  const modules = [
    {
      title: "Yöneticiler",
      description: "Şirket yöneticilerini ve üst düzey kadroları yönetin",
      icon: Users,
      href: "/dashboard/kurumsal/yoneticiler",
      color: "bg-blue-500",
      stats: statistics ? [
        { label: "Toplam", value: statistics.executives.total },
        { label: "Aktif", value: statistics.executives.active },
        { label: "Üst Düzey", value: statistics.executives.types.president + statistics.executives.types.generalManager }
      ] : [],
      features: ["Yönetici profilleri", "Hiyerarşi yönetimi", "İletişim bilgileri", "Biyografi editörü"]
    },
    // Quick Links temporarily disabled
    /*
    {
      title: "Hızlı Erişim Linkleri",
      description: "Frontend'de gösterilecek hızlı erişim linklerini düzenleyin",
      icon: Link,
      href: "/dashboard/kurumsal/hizli-baglanti",
      color: "bg-green-500",
      stats: statistics ? [
        { label: "Toplam", value: statistics.quickLinks?.total || 0 },
        { label: "Aktif", value: statistics.quickLinks?.active || 0 }
      ] : [],
      features: ["Link yönetimi", "İkon seçimi", "Sıralama", "Durum kontrolü"]
    },
    */
    // Gelecekte eklenecek modüller
    {
      title: "Birimlerimiz",
      description: "Şirket departmanlarını ve birimlerini yönetin",
      icon: Building2,
      href: "/dashboard/kurumsal/birimler",
      color: "bg-purple-500",
      stats: statistics ? [
        { label: "Aktif Birim", value: statistics.departments.total },
        { label: "Çalışan", value: statistics.departments.totalEmployees }
      ] : [],
      features: ["Departman yönetimi", "Organizasyon şeması", "Personel takibi", "Görev tanımları"],
      isComingSoon: false    },
    {
      title: "Vizyon & Misyon",
      description: "Kurumsal vizyon ve misyon beyanlarını yönetin",
      icon: Target,
      href: "/dashboard/kurumsal/visyon-misyon",
      color: "bg-indigo-500",
      stats: [
        { label: "Vizyon", value: "1" },
        { label: "Misyon", value: "1" }
      ],
      features: ["Vizyon yönetimi", "Misyon yönetimi", "Rich Text Editor", "Anlık önizleme"],
      isComingSoon: false
    },
    {
      title: "Kurumsal İçerik",
      description: "Strateji, hedefler ve kurumsal değerleri yönetin",
      icon: FileText,
      href: "/dashboard/kurumsal/icerik",
      color: "bg-teal-500",
      stats: [
        { label: "Strateji", value: "1" },
        { label: "Hedefler", value: "1" }
      ],
      features: ["Strateji yönetimi", "Hedefler", "Kurumsal değerler", "İçerik editörü"],
      isComingSoon: false
    },
    {
      title: "Ödüller & Sertifikalar",
      description: "Şirketin aldığı ödülleri ve sertifikaları yönetin",
      icon: Award,
      href: "/dashboard/kurumsal/oduller",
      color: "bg-yellow-500",
      stats: [
        { label: "Ödüller", value: "12" },
        { label: "Sertifikalar", value: "8" }
      ],
      features: ["Ödül galerisi", "Sertifika yükleme", "Kategori yönetimi", "Tarih sıralama"],
      isComingSoon: true
    },
    {
      title: "Sosyal Sorumluluk",
      description: "CSR projeleri ve sosyal sorumluluk faaliyetlerini yönetin",
      icon: Globe,
      href: "/dashboard/kurumsal/sosyal-sorumluluk",
      color: "bg-emerald-500",
      stats: [
        { label: "Aktif Proje", value: "3" },
        { label: "Tamamlanan", value: "12" }
      ],
      features: ["Proje yönetimi", "Etki ölçümü", "Gönüllü programları", "Raporlama"],
      isComingSoon: true
    }
  ];

  return (
    <CorporateErrorBoundary>
      <div className="container mx-auto py-10">
        {/* Breadcrumb */}
        <Breadcrumb 
          className="mb-6"
          segments={[
            { name: "Dashboard", href: "/dashboard" },
            { name: "Kurumsal", href: "/dashboard/kurumsal" }
          ]}
        />

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Kurumsal Yönetim</h1>
            <p className="text-muted-foreground mt-2">
              Şirketinizin kurumsal bilgilerini, yöneticilerini ve kurumsal kimliğini yönetin
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Activity className="h-3 w-3" />
              Aktif Modüller: {modules.filter(m => !m.isComingSoon).length}
            </Badge>
          </div>
        </div>

        {/* İstatistik Kartları */}
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-4 mb-8">
            <LoadingSkeleton rows={1} />
          </div>
        ) : statistics && (
          <div className="grid gap-4 md:grid-cols-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Toplam Yönetici</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statistics.executives.total}</div>
                <p className="text-xs text-muted-foreground">
                  {statistics.executives.active} aktif
                </p>
              </CardContent>
            </Card>
            
            {/* Quick Links Card - Temporarily Disabled */}
            {statistics?.quickLinks && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Hızlı Linkler</CardTitle>
                  <Link className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{statistics.quickLinks?.total || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {statistics.quickLinks?.active || 0} aktif
                  </p>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Üst Düzey Yönetim</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statistics.executives.types.president + statistics.executives.types.generalManager}
                </div>
                <p className="text-xs text-muted-foreground">
                  Başkan + Genel Müdür
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Kurumsal Modüller</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{modules.length}</div>
                <p className="text-xs text-muted-foreground">
                  {modules.filter(m => !m.isComingSoon).length} aktif, {modules.filter(m => m.isComingSoon).length} planlanan
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Modül Kartları */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {modules.map((module, index) => {
            const IconComponent = module.icon;
            return (
              <Card 
                key={index} 
                className={`relative group hover:shadow-lg transition-all duration-200 ${
                  module.isComingSoon ? 'opacity-60' : 'cursor-pointer hover:scale-[1.02]'
                }`}
                onClick={() => !module.isComingSoon && router.push(module.href)}
              >
                {module.isComingSoon && (
                  <div className="absolute top-3 right-3 z-10">
                    <Badge variant="secondary" className="text-xs">
                      Yakında
                    </Badge>
                  </div>
                )}
                
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-lg ${module.color} text-white`}>
                      <IconComponent className="h-6 w-6" />
                    </div>
                    {!module.isComingSoon && (
                      <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                    )}
                  </div>
                  <CardTitle className="text-xl">{module.title}</CardTitle>
                  <CardDescription>{module.description}</CardDescription>
                </CardHeader>
                
                <CardContent>
                  {/* İstatistikler */}
                  {module.stats.length > 0 && (
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      {module.stats.map((stat, statIndex) => (
                        <div key={statIndex} className="text-center">
                          <div className="text-lg font-semibold">{stat.value}</div>
                          <div className="text-xs text-muted-foreground">{stat.label}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Özellikler */}
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-muted-foreground mb-2">Özellikler:</div>
                    {module.features.slice(0, 3).map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center gap-2 text-sm">
                        <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
                        {feature}
                      </div>
                    ))}
                    {module.features.length > 3 && (
                      <div className="text-xs text-muted-foreground">
                        +{module.features.length - 3} daha fazla...
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Hızlı Eylemler */}
        <div className="mt-12">
          <h3 className="text-xl font-semibold mb-4">Hızlı Eylemler</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-2"
              onClick={() => router.push('/dashboard/kurumsal/yoneticiler/form')}
            >
              <Users className="h-5 w-5" />
              Yeni Yönetici Ekle
            </Button>
            
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-2"
              onClick={() => router.push('/dashboard/kurumsal/hizli-baglanti')}
            >
              <Link className="h-5 w-5" />
              Hızlı Link Yönet
            </Button>
            
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-2"
              onClick={() => router.push('/dashboard/kurumsal/birimler')}
            >
              <Building2 className="h-5 w-5" />
              Birimler
            </Button>
            
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-2"
              onClick={() => router.push('/dashboard/kurumsal/icerik')}
            >
              <Target className="h-5 w-5" />
              Kurumsal İçerik
            </Button>
          </div>
        </div>

        {/* Gelecek Özellikler */}
        <div className="mt-12 p-6 bg-muted/30 rounded-lg">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Gelecek Özellikler
          </h3>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            <div className="text-sm">
              <div className="font-medium">Ödüller & Sertifikalar</div>
              <div className="text-muted-foreground">Başarıların sergisi</div>
            </div>
            <div className="text-sm">
              <div className="font-medium">Sosyal Sorumluluk</div>
              <div className="text-muted-foreground">CSR projeleri</div>
            </div>
            <div className="text-sm">
              <div className="font-medium">Kurumsal Kimlik</div>
              <div className="text-muted-foreground">Logo, renk, tipografi</div>
            </div>
            <div className="text-sm">
              <div className="font-medium">İletişim Merkezi</div>
              <div className="text-muted-foreground">Çok kanallı iletişim</div>
            </div>
            <div className="text-sm">
              <div className="font-medium">Raporlama</div>
              <div className="text-muted-foreground">Kapsamlı analitik</div>
            </div>
            <div className="text-sm">
              <div className="font-medium">API Entegrasyonları</div>
              <div className="text-muted-foreground">Üçüncü parti sistemler</div>
            </div>
          </div>
        </div>
      </div>
    </CorporateErrorBoundary>
  );
}
