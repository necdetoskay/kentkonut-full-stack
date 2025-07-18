import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Search, Wand2, Copy, CheckCircle } from "lucide-react";
import { generateAllSeoFields, validateSeoData } from "@/lib/seo-utils";

interface SeoCardProps {
  formData: {
    ad?: string;
    konumAdi?: string;
    durum?: string;
    ilerlemeyuzdesi?: number;
    toplamTon?: number;
    seoLink?: string;
    seoTitle?: string;
    seoDescription?: string;
    seoKeywords?: string;
    seoCanonicalUrl?: string;
  };
  onFieldChange: (field: string, value: string) => void;
  errors?: { [key: string]: string };
}

export default function SeoCard({ formData, onFieldChange, errors = {} }: SeoCardProps) {
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  const handleSeoLinkChange = (value: string) => {
    // Auto-format the SEO link
    const formatted = value
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
    
    onFieldChange('seoLink', formatted);
    
    // Update canonical URL when SEO link changes
    if (formatted) {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://kentkonut.com';
      onFieldChange('seoCanonicalUrl', `${baseUrl}/hafriyat/${formatted}`);
    }
  };

  const generateSeoFromTitle = () => {
    if (!formData.ad) return;
    
    const seoFields = generateAllSeoFields(formData);
    
    // Update all SEO fields
    onFieldChange('seoLink', seoFields.seoLink);
    onFieldChange('seoTitle', seoFields.seoTitle);
    onFieldChange('seoDescription', seoFields.seoDescription);
    onFieldChange('seoKeywords', seoFields.seoKeywords);
    onFieldChange('seoCanonicalUrl', seoFields.seoCanonicalUrl);
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(type);
      setTimeout(() => setCopySuccess(null), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const getPreviewUrl = () => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://kentkonut.com';
    return `${baseUrl}/hafriyat/${formData.seoLink || 'ornek-proje'}`;
  };

  const validation = validateSeoData(formData);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          SEO Optimizasyonu
        </CardTitle>
        <CardDescription>
          Arama motoru optimizasyonu için site bilgileri
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* SEO Link */}
        <div className="space-y-2">
          <Label htmlFor="seoLink">SEO Linki</Label>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground flex-shrink-0">
              /hafriyat/
            </span>
            <Input
              id="seoLink"
              value={formData.seoLink || ''}
              onChange={(e) => handleSeoLinkChange(e.target.value)}
              placeholder="korfez-tasocagi-rehabilitasyon"
              pattern="[a-z0-9-]+"
              className={errors.seoLink ? "border-red-500" : ""}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(getPreviewUrl(), 'url')}
              className="flex-shrink-0"
            >
              {copySuccess === 'url' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
          {errors.seoLink && (
            <p className="text-xs text-red-500">{errors.seoLink}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Sadece küçük harf, rakam ve tire (-) kullanın
          </p>
          
          {/* Live Preview */}
          <div className="p-3 bg-muted rounded text-sm">
            <div className="flex items-center justify-between">
              <div>
                <strong>Önizleme:</strong> 
                <span className="font-mono ml-2">{getPreviewUrl()}</span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(getPreviewUrl(), 'preview')}
              >
                {copySuccess === 'preview' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>

        {/* SEO Title */}
        <div className="space-y-2">
          <Label htmlFor="seoTitle">SEO Başlığı</Label>
          <Input
            id="seoTitle"
            value={formData.seoTitle || ''}
            onChange={(e) => onFieldChange('seoTitle', e.target.value)}
            placeholder="Körfez Taşocağı Rehabilitasyon Projesi | KentKonut"
            maxLength={60}
            className={errors.seoTitle ? "border-red-500" : ""}
          />
          <div className="flex justify-between text-xs">
            <span className={`text-muted-foreground ${(formData.seoTitle?.length || 0) > 60 ? 'text-red-500' : ''}`}>
              {formData.seoTitle?.length || 0}/60 karakter
            </span>
            {errors.seoTitle && <span className="text-red-500">{errors.seoTitle}</span>}
          </div>
        </div>

        {/* SEO Description */}
        <div className="space-y-2">
          <Label htmlFor="seoDescription">SEO Açıklaması</Label>
          <Textarea
            id="seoDescription"
            value={formData.seoDescription || ''}
            onChange={(e) => onFieldChange('seoDescription', e.target.value)}
            placeholder="Körfez ilçesinde bulunan eski taş ocağının çevresel rehabilitasyonu ve peyzaj düzenlemesi projesi hakkında detaylar."
            maxLength={160}
            rows={3}
            className={errors.seoDescription ? "border-red-500" : ""}
          />
          <div className="flex justify-between text-xs">
            <span className={`text-muted-foreground ${(formData.seoDescription?.length || 0) > 160 ? 'text-red-500' : ''}`}>
              {formData.seoDescription?.length || 0}/160 karakter
            </span>
            {errors.seoDescription && <span className="text-red-500">{errors.seoDescription}</span>}
          </div>
        </div>

        {/* SEO Keywords */}
        <div className="space-y-2">
          <Label htmlFor="seoKeywords">Anahtar Kelimeler</Label>
          <Input
            id="seoKeywords"
            value={formData.seoKeywords || ''}
            onChange={(e) => onFieldChange('seoKeywords', e.target.value)}
            placeholder="hafriyat, rehabilitasyon, çevre, taş ocağı, körfez"
            className={errors.seoKeywords ? "border-red-500" : ""}
          />
          {errors.seoKeywords && (
            <p className="text-xs text-red-500">{errors.seoKeywords}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Kelimeleri virgül ile ayırın
          </p>
        </div>

        {/* Canonical URL (readonly) */}
        <div className="space-y-2">
          <Label htmlFor="seoCanonicalUrl">Canonical URL</Label>
          <div className="flex items-center space-x-2">
            <Input
              id="seoCanonicalUrl"
              value={formData.seoCanonicalUrl || ''}
              readOnly
              className="bg-muted"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(formData.seoCanonicalUrl || '', 'canonical')}
              className="flex-shrink-0"
            >
              {copySuccess === 'canonical' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Otomatik olarak SEO linkinden oluşturulur
          </p>
        </div>

        {/* Auto-generate Button */}
        <Button 
          type="button" 
          variant="outline" 
          onClick={generateSeoFromTitle}
          className="w-full"
          disabled={!formData.ad}
        >
          <Wand2 className="w-4 h-4 mr-2" />
          SEO Bilgilerini Otomatik Oluştur
        </Button>

        {/* Validation Summary */}
        {!validation.isValid && (
          <div className="p-3 bg-red-50 border border-red-200 rounded">
            <p className="text-sm font-medium text-red-800 mb-1">SEO Doğrulama Hataları:</p>
            <ul className="text-xs text-red-700 space-y-1">
              {validation.errors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* SEO Tips */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded">
          <p className="text-sm font-medium text-blue-800 mb-2">SEO İpuçları:</p>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• SEO başlığı 50-60 karakter arasında olmalı</li>
            <li>• Açıklama 150-160 karakter arasında olmalı</li>
            <li>• SEO linki benzersiz ve anlaşılır olmalı</li>
            <li>• Anahtar kelimeler proje ile ilgili olmalı</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
