"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface SiteSetting {
  id: string;
  key: string;
  value: string;
  label?: string;
  group?: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SiteSetting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/admin/settings');
        if (!response.ok) throw new Error('Ayarlar alınamadı');
        const data = await response.json();
        setSettings(data);
      } catch (error) {
        toast.error('Ayarlar yüklenirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleInputChange = (key: string, value: string) => {
    setSettings(currentSettings =>
      currentSettings.map(s => (s.key === key ? { ...s, value } : s))
    );
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      });
      if (!response.ok) throw new Error('Ayarlar kaydedilemedi');
      toast.success('Ayarlar başarıyla kaydedildi.');
    } catch (error) {
      toast.error('Ayarlar kaydedilirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const groupedSettings = settings.reduce((acc, setting) => {
    const group = setting.group || 'Genel';
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(setting);
    return acc;
  }, {} as Record<string, SiteSetting[]>);

  if (loading && settings.length === 0) {
    return <div>Yükleniyor...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Site Ayarları</h1>
          <p className="text-muted-foreground">Genel site ayarlarını ve footer bilgilerini yönetin.</p>
        </div>
        <Button onClick={handleSave} disabled={loading}>
          {loading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
        </Button>
      </div>

      <div className="space-y-8">
        {Object.entries(groupedSettings).map(([group, settingsInGroup]) => (
          <Card key={group}>
            <CardHeader>
              <CardTitle>{group.charAt(0).toUpperCase() + group.slice(1)}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {settingsInGroup.map(setting => (
                <div key={setting.key}>
                  <Label htmlFor={setting.key}>{setting.label || setting.key}</Label>
                  <Input
                    id={setting.key}
                    value={setting.value}
                    onChange={e => handleInputChange(setting.key, e.target.value)}
                    placeholder={`${setting.label || setting.key} değerini girin`}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}