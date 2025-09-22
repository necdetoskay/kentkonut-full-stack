'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Zap, FileText, Settings, Sparkles } from 'lucide-react';

interface PageCreationModeSelectorProps {
  onModeSelect: (mode: 'simple' | 'advanced') => void;
}

export default function PageCreationModeSelector({ onModeSelect }: PageCreationModeSelectorProps) {
  const [selectedMode, setSelectedMode] = useState<'simple' | 'advanced' | null>(null);

  const modes = [
    {
      id: 'simple' as const,
      title: 'Basit Mod',
      subtitle: 'Mevcut İki Aşamalı Süreç',
      description: 'Önce sayfa bilgilerini oluşturun, sonra içerik ekleme sayfasına yönlendirilir.',
      icon: <FileText className="w-8 h-8" />,
      features: [
        'Hızlı sayfa oluşturma',
        'Basit form arayüzü',
        'Otomatik yönlendirme',
        'Tanıdık iş akışı'
      ],
      badge: 'Varsayılan',
      badgeVariant: 'secondary' as const,
      pros: [
        'Basit ve anlaşılır',
        'Hızlı sayfa oluşturma',
        'Mevcut kullanıcılar için tanıdık'
      ],
      cons: [
        'İki ayrı sayfa arası geçiş',
        'İçerik eklemek için ek adım',
        'Daha fazla tıklama gerektirir'
      ]
    },
    {
      id: 'advanced' as const,
      title: 'Gelişmiş Mod',
      subtitle: 'Tek Sayfa Birleşik Arayüz',
      description: 'Sayfa bilgileri ve içerik editörünü aynı sayfada kullanarak tek seferde oluşturun.',
      icon: <Zap className="w-8 h-8" />,
      features: [
        'Tek sayfa arayüzü',
        'Anında içerik ekleme',
        'Gelişmiş editör',
        'Yönlendirme yok'
      ],
      badge: 'Yeni',
      badgeVariant: 'default' as const,
      pros: [
        'Kesintisiz iş akışı',
        'Anında içerik oluşturma',
        'Daha az sayfa geçişi',
        'Gelişmiş özellikler'
      ],
      cons: [
        'Daha karmaşık arayüz',
        'Öğrenme eğrisi',
        'Daha fazla yükleme süresi'
      ]
    }
  ];

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Sparkles className="w-6 h-6 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Sayfa Oluşturma Modu Seçin</h1>
        </div>
        <p className="text-gray-600 text-lg">
          İhtiyacınıza en uygun sayfa oluşturma yöntemini seçin
        </p>
      </div>

      {/* Mode Selection Cards */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {modes.map((mode) => (
          <Card 
            key={mode.id}
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
              selectedMode === mode.id 
                ? 'ring-2 ring-blue-500 shadow-lg' 
                : 'hover:shadow-md'
            }`}
            onClick={() => setSelectedMode(mode.id)}
          >
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-blue-600">
                    {mode.icon}
                  </div>
                  <div>
                    <CardTitle className="text-xl flex items-center gap-2">
                      {mode.title}
                      <Badge variant={mode.badgeVariant}>
                        {mode.badge}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-base mt-1">
                      {mode.subtitle}
                    </CardDescription>
                  </div>
                </div>
                
                {selectedMode === mode.id && (
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                {mode.description}
              </p>
              
              {/* Features */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Özellikler:</h4>
                <ul className="space-y-1">
                  {mode.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Pros and Cons */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <h5 className="text-sm font-medium text-green-700 mb-1">Avantajlar:</h5>
                  <ul className="space-y-1">
                    {mode.pros.map((pro, index) => (
                      <li key={index} className="text-xs text-green-600 flex items-start gap-1">
                        <span className="text-green-500 mt-0.5">+</span>
                        {pro}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h5 className="text-sm font-medium text-orange-700 mb-1">Dikkat:</h5>
                  <ul className="space-y-1">
                    {mode.cons.map((con, index) => (
                      <li key={index} className="text-xs text-orange-600 flex items-start gap-1">
                        <span className="text-orange-500 mt-0.5">-</span>
                        {con}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-4">
        <Button
          variant="outline"
          onClick={() => window.history.back()}
        >
          Geri Dön
        </Button>
        
        <Button
          onClick={() => selectedMode && onModeSelect(selectedMode)}
          disabled={!selectedMode}
          className="min-w-[200px]"
        >
          {selectedMode ? (
            <>
              {selectedMode === 'simple' ? 'Basit Mod' : 'Gelişmiş Mod'} ile Devam Et
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          ) : (
            'Bir Mod Seçin'
          )}
        </Button>
      </div>

      {/* Help Text */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <Settings className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900">Mod Tercihiniz Hatırlanır</h3>
            <p className="text-blue-700 text-sm mt-1">
              Seçtiğiniz mod bir sonraki sayfa oluşturma işleminizde varsayılan olarak kullanılır. 
              İstediğiniz zaman mod değiştirebilirsiniz.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
