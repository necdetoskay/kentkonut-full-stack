"use client";

import { useState } from 'react';
import { useVersionHistory, addNewVersion, updateVersionInfo } from '@/hooks/useVersionInfo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { 
  GitBranch, 
  Calendar, 
  User, 
  Plus, 
  Edit, 
  Code, 
  RefreshCw,
  Tag,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NewVersionForm {
  version: string;
  title: string;
  description: string;
  changes: string[];
  type: 'initial' | 'feature' | 'bugfix' | 'infrastructure' | 'security';
  author: string;
}

export default function VersionManagementPage() {
  const { versions, currentVersion, loading, error, refresh } = useVersionHistory();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newVersionForm, setNewVersionForm] = useState<NewVersionForm>({
    version: '',
    title: '',
    description: '',
    changes: [''],
    type: 'feature',
    author: 'Kent Konut Dev Team'
  });

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'initial': return 'bg-blue-500 hover:bg-blue-600';
      case 'feature': return 'bg-green-500 hover:bg-green-600';
      case 'bugfix': return 'bg-yellow-500 hover:bg-yellow-600';
      case 'infrastructure': return 'bg-purple-500 hover:bg-purple-600';
      case 'security': return 'bg-red-500 hover:bg-red-600';
      default: return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'initial': return 'İlk Sürüm';
      case 'feature': return 'Özellik';
      case 'bugfix': return 'Hata Düzeltme';
      case 'infrastructure': return 'Altyapı';
      case 'security': return 'Güvenlik';
      default: return 'Genel';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Bilinmiyor';
    }
  };

  const handleAddChange = (index: number, value: string) => {
    const newChanges = [...newVersionForm.changes];
    newChanges[index] = value;
    setNewVersionForm({ ...newVersionForm, changes: newChanges });
  };

  const addChangeField = () => {
    setNewVersionForm({
      ...newVersionForm,
      changes: [...newVersionForm.changes, '']
    });
  };

  const removeChangeField = (index: number) => {
    const newChanges = newVersionForm.changes.filter((_, i) => i !== index);
    setNewVersionForm({ ...newVersionForm, changes: newChanges });
  };

  const handleSubmitNewVersion = async () => {
    try {
      const filteredChanges = newVersionForm.changes.filter(change => change.trim() !== '');
      
      if (!newVersionForm.version || !newVersionForm.title || filteredChanges.length === 0) {
        toast.error('Lütfen tüm gerekli alanları doldurun');
        return;
      }

      const success = await addNewVersion({
        ...newVersionForm,
        changes: filteredChanges
      });

      if (success) {
        toast.success('Yeni versiyon başarıyla eklendi');
        setIsAddDialogOpen(false);
        setNewVersionForm({
          version: '',
          title: '',
          description: '',
          changes: [''],
          type: 'feature',
          author: 'Kent Konut Dev Team'
        });
        refresh();
      } else {
        toast.error('Versiyon eklenirken hata oluştu');
      }
    } catch (error) {
      toast.error('Beklenmeyen bir hata oluştu');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Versiyon Yönetimi</h1>
            <p className="text-muted-foreground">Uygulama versiyonlarını yönetin</p>
          </div>
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-6 bg-muted rounded w-1/3"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                  <div className="h-20 bg-muted rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Versiyon Yönetimi</h1>
            <p className="text-muted-foreground">Uygulama versiyonlarını yönetin</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">
              <p>Versiyon bilgileri yüklenirken hata oluştu: {error}</p>
              <Button onClick={refresh} className="mt-4">
                <RefreshCw className="h-4 w-4 mr-2" />
                Yeniden Dene
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Versiyon Yönetimi</h1>
          <p className="text-muted-foreground">
            Uygulama versiyonlarını yönetin ve geçmişi görüntüleyin
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={refresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Yenile
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Yeni Versiyon
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Yeni Versiyon Ekle</DialogTitle>
                <DialogDescription>
                  Yeni bir versiyon oluşturun ve değişiklikleri kaydedin
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="version">Versiyon Numarası *</Label>
                    <Input
                      id="version"
                      placeholder="1.2.0"
                      value={newVersionForm.version}
                      onChange={(e) => setNewVersionForm({ ...newVersionForm, version: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Versiyon Tipi *</Label>
                    <Select
                      value={newVersionForm.type}
                      onValueChange={(value: any) => setNewVersionForm({ ...newVersionForm, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="feature">Özellik</SelectItem>
                        <SelectItem value="bugfix">Hata Düzeltme</SelectItem>
                        <SelectItem value="infrastructure">Altyapı</SelectItem>
                        <SelectItem value="security">Güvenlik</SelectItem>
                        <SelectItem value="initial">İlk Sürüm</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Versiyon Başlığı *</Label>
                  <Input
                    id="title"
                    placeholder="Redis Monitoring Update"
                    value={newVersionForm.title}
                    onChange={(e) => setNewVersionForm({ ...newVersionForm, title: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Açıklama</Label>
                  <Textarea
                    id="description"
                    placeholder="Bu versiyonda yapılan değişikliklerin genel açıklaması..."
                    value={newVersionForm.description}
                    onChange={(e) => setNewVersionForm({ ...newVersionForm, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="author">Yazar</Label>
                  <Input
                    id="author"
                    value={newVersionForm.author}
                    onChange={(e) => setNewVersionForm({ ...newVersionForm, author: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Değişiklikler *</Label>
                  {newVersionForm.changes.map((change, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder="Yapılan değişiklik açıklaması..."
                        value={change}
                        onChange={(e) => handleAddChange(index, e.target.value)}
                      />
                      {newVersionForm.changes.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeChangeField(index)}
                        >
                          Sil
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addChangeField}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Değişiklik Ekle
                  </Button>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  İptal
                </Button>
                <Button onClick={handleSubmitNewVersion}>
                  Versiyon Ekle
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Current Version Info */}
      {currentVersion && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-primary" />
              <CardTitle className="text-primary">Mevcut Versiyon</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-lg font-semibold">
              <span>v{currentVersion}</span>
              {versions.find(v => v.version === currentVersion) && (
                <Badge 
                  className={cn(
                    "text-white border-0",
                    getTypeBadgeColor(versions.find(v => v.version === currentVersion)?.type || 'feature')
                  )}
                >
                  {getTypeLabel(versions.find(v => v.version === currentVersion)?.type || 'feature')}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Version History */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Versiyon Geçmişi
        </h2>
        
        {versions.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              Henüz versiyon geçmişi bulunmuyor
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {versions.map((version, index) => (
              <Card key={version.version} className={cn(
                version.version === currentVersion && "border-primary/20 bg-primary/5"
              )}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <GitBranch className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          v{version.version} - {version.title}
                          <Badge 
                            className={cn(
                              "text-white border-0",
                              getTypeBadgeColor(version.type)
                            )}
                          >
                            {getTypeLabel(version.type)}
                          </Badge>
                          {version.version === currentVersion && (
                            <Badge variant="outline" className="text-primary border-primary">
                              Mevcut
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-4 mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(version.releaseDate)}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {version.author}
                          </span>
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      {version.description}
                    </p>
                    
                    {version.changes && version.changes.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Code className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Değişiklikler:</span>
                        </div>
                        <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                          {version.changes.map((change, changeIndex) => (
                            <li key={changeIndex} className="flex items-start gap-2">
                              <span className="text-primary mt-1">•</span>
                              <span>{change}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
