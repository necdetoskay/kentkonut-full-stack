"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Edit, Mail, Phone, User, Building, FileText, Image as ImageIcon, Download } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

interface Media {
  id: string;
  filename: string;
  originalName: string | null;
  mimeType: string;
  path: string;
  url: string | null;
}

interface GalleryItem {
  id: string;
  type: string;
  title: string;
  description: string;
  order: number;
  media: Media;
}

interface Department {
  id: string;
  name: string;
  slug: string;
}

interface Personnel {
  id: string;
  name: string;
  title: string;
  content: string;
  phone: string | null;
  email: string | null;
  imageUrl: string | null;
  slug: string | null;
  type: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
  galleryItems: GalleryItem[];
  directedDept: Department | null;
  chiefInDepts: Department[];
}

export default function PersonnelViewPage() {
  const router = useRouter();
  const params = useParams();
  const [personnel, setPersonnel] = useState<Personnel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      fetchPersonnel(params.id as string);
    }
  }, [params.id]);

  const fetchPersonnel = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/personnel/${id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Personel bulunamadı');
        } else {
          throw new Error('Personel yüklenemedi');
        }
        return;
      }
      
      const data = await response.json();
      setPersonnel(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Personel yüklenemedi');
      toast.error('Personel bilgileri yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    router.push(`/dashboard/kurumsal/personnel/${params.id}/edit`);
  };

  const handleBack = () => {
    router.back();
  };

  const getPersonnelTypeLabel = (type: string) => {
    switch (type) {
      case 'DIRECTOR':
        return 'Müdür';
      case 'CHIEF':
        return 'Şef';
      default:
        return 'Personel';
    }
  };

  const getPersonnelTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'DIRECTOR':
        return 'default';
      case 'CHIEF':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error || !personnel) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <User className="h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">
            {error || 'Personel bulunamadı'}
          </h2>
          <Button onClick={handleBack} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri Dön
          </Button>
        </div>
      </div>
    );
  }

  // Separate gallery items by type
  const imageGalleryItems = personnel.galleryItems.filter(item => item.type === 'IMAGE');
  const documentGalleryItems = personnel.galleryItems.filter(item => 
    ['DOCUMENT', 'PDF', 'WORD'].includes(item.type)
  );

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button onClick={handleBack} variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri
          </Button>
          <h1 className="text-2xl font-bold">Personel Detayı</h1>
        </div>
        <Button onClick={handleEdit}>
          <Edit className="h-4 w-4 mr-2" />
          Düzenle
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Kişisel Bilgiler
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">{personnel.name}</h2>
                  <p className="text-gray-600">{personnel.title}</p>
                </div>
                <Badge variant={getPersonnelTypeBadgeVariant(personnel.type)}>
                  {getPersonnelTypeLabel(personnel.type)}
                </Badge>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {personnel.email && (
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{personnel.email}</span>
                  </div>
                )}
                {personnel.phone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{personnel.phone}</span>
                  </div>
                )}
              </div>

              {personnel.content && (
                <div>
                  <h3 className="font-medium mb-2">Açıklama</h3>
                  <div 
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: personnel.content }}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Department Information */}
          {(personnel.directedDept || personnel.chiefInDepts.length > 0) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="h-5 w-5 mr-2" />
                  Birim Bilgileri
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {personnel.directedDept && (
                  <div>
                    <h3 className="font-medium text-sm text-gray-600 mb-1">Yönettiği Birim</h3>
                    <p className="font-medium">{personnel.directedDept.name}</p>
                  </div>
                )}
                
                {personnel.chiefInDepts.length > 0 && (
                  <div>
                    <h3 className="font-medium text-sm text-gray-600 mb-2">Şef Olduğu Birimler</h3>
                    <div className="flex flex-wrap gap-2">
                      {personnel.chiefInDepts.map((dept) => (
                        <Badge key={dept.id} variant="outline">
                          {dept.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Documents */}
          {documentGalleryItems.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Belgeler
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {documentGalleryItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="font-medium">{item.title}</p>
                          {item.description && (
                            <p className="text-sm text-gray-600">{item.description}</p>
                          )}
                        </div>
                      </div>
                      {item.media.url && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(item.media.url!, '_blank')}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          İndir
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Profile Image */}
          <Card>
            <CardHeader>
              <CardTitle>Profil Fotoğrafı</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-square relative rounded-lg overflow-hidden bg-gray-100">
                {personnel.imageUrl ? (
                  <Image
                    src={personnel.imageUrl}
                    alt={personnel.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <User className="h-16 w-16 text-gray-400" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Gallery Images */}
          {imageGalleryItems.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ImageIcon className="h-5 w-5 mr-2" />
                  Galeri
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {imageGalleryItems.map((item) => (
                    <div key={item.id} className="aspect-square relative rounded-lg overflow-hidden bg-gray-100">
                      {item.media.url && (
                        <Image
                          src={item.media.url}
                          alt={item.title}
                          fill
                          className="object-cover cursor-pointer hover:scale-105 transition-transform"
                          onClick={() => window.open(item.media.url!, '_blank')}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle>Sistem Bilgileri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Durum:</span>
                <Badge variant={personnel.isActive ? "default" : "secondary"}>
                  {personnel.isActive ? "Aktif" : "Pasif"}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Sıra:</span>
                <span>{personnel.order}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Oluşturulma:</span>
                <span>{new Date(personnel.createdAt).toLocaleDateString('tr-TR')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Güncellenme:</span>
                <span>{new Date(personnel.updatedAt).toLocaleDateString('tr-TR')}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
