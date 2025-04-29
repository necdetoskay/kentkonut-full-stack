"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { UploadCloud, Loader2 } from "lucide-react";

// Allowed folders for uploads
const ALLOWED_FOLDERS = ['temp', 'corporate', 'homepage', 'banners'];

export default function FolderUploadTestPage() {
  const [selectedFolder, setSelectedFolder] = useState("corporate");
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    
    try {
      // Create FormData
      const formData = new FormData();
      
      // Add the target folder
      formData.append('targetFolder', selectedFolder);
      
      // Add files
      Array.from(files).forEach((file, index) => {
        formData.append(`file${index}`, file);
      });
      
      // Upload files
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Dosya yükleme hatası');
      }
      
      const data = await response.json();
      if (!data.urls || !Array.isArray(data.urls)) {
        throw new Error('API geçerli bir yanıt döndürmedi');
      }
      
      // Update uploaded files
      setUploadedFiles(data.urls);
      toast.success(`${data.urls.length} dosya başarıyla "${selectedFolder}" klasörüne yüklendi`);
      
      // Reset file input
      e.target.value = '';
    } catch (error) {
      console.error('Dosya yükleme hatası:', error);
      toast.error(error instanceof Error ? error.message : 'Dosya yüklenirken bir hata oluştu');
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Klasöre Dosya Yükleme Testi</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Dosya Yükleme</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="folderSelect">Hedef Klasör</Label>
                <Select 
                  value={selectedFolder} 
                  onValueChange={setSelectedFolder}
                >
                  <SelectTrigger id="folderSelect">
                    <SelectValue placeholder="Bir klasör seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {ALLOWED_FOLDERS.map(folder => (
                      <SelectItem key={folder} value={folder}>
                        {folder}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fileUpload">Dosya Seç</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="fileUpload"
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    onChange={handleFileChange}
                    disabled={isUploading}
                  />
                  {isUploading && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                </div>
              </div>
              
              <div className="pt-4">
                <p className="text-sm text-muted-foreground">
                  Dosyalar "{selectedFolder}" klasörüne yüklenecektir. Sadece resim ve video dosyaları kabul edilir.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Yüklenen Dosyalar</CardTitle>
          </CardHeader>
          <CardContent>
            {uploadedFiles.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 border rounded-md">
                <UploadCloud className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">Henüz dosya yüklenmedi</p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm font-medium">Son yüklenen dosyalar:</p>
                <div className="grid grid-cols-2 gap-4">
                  {uploadedFiles.map((url, index) => {
                    const isImage = url.match(/\.(jpe?g|png|gif|webp)$/i);
                    return (
                      <div key={index} className="border rounded-md overflow-hidden">
                        {isImage ? (
                          <img 
                            src={url} 
                            alt={`Yüklenen dosya ${index + 1}`} 
                            className="w-full h-auto aspect-video object-cover"
                          />
                        ) : (
                          <div className="aspect-video bg-muted flex items-center justify-center">
                            <span className="text-sm text-muted-foreground">Video Dosyası</span>
                          </div>
                        )}
                        <div className="p-2">
                          <a 
                            href={url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline truncate block"
                          >
                            {url}
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 