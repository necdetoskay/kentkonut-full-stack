"use client";

import { useState, useEffect } from "react";
import { Loader2, Search, Trash2, Grid3X3, ViewIcon, RefreshCw, FolderIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { FolderTree } from "../../components/media/FolderTree";
import { FolderContent } from "../../components/media/FolderContent";
import {
  Tabs,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";

interface FolderStructure {
  name: string;
  path: string;
  files: any[];
  subFolders: FolderStructure[];
  sizeBytes: number;
  size: string;
  fileCount: number;
  modifiedAt: string;
}

export default function MediaLibraryPage() {
  const [loading, setLoading] = useState(true);
  const [folderStructure, setFolderStructure] = useState<FolderStructure | null>(null);
  const [selectedPath, setSelectedPath] = useState<string>('');
  const [selectedFolder, setSelectedFolder] = useState<FolderStructure | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredFiles, setFilteredFiles] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [leftWidth, setLeftWidth] = useState(300);
  const [isResizing, setIsResizing] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(0);
  
  // Klasör yapısını yükle
  const fetchFolderStructure = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/media-library/tree', { cache: 'no-store' });
      
      if (!response.ok) {
        throw new Error("Klasör yapısı yüklenemedi");
      }
      
      const data = await response.json();
      setFolderStructure(data);
      
      // Varsayılan olarak kök klasörü seç
      if (!selectedPath && data) {
        setSelectedPath(data.path);
        setSelectedFolder(data);
        setFilteredFiles(data.files);
      } else if (selectedPath) {
        // Seçili klasörü güncelle
        const findFolder = (folder: FolderStructure, path: string): FolderStructure | null => {
          if (folder.path === path) return folder;
          
          for (const subFolder of folder.subFolders) {
            const found = findFolder(subFolder, path);
            if (found) return found;
          }
          
          return null;
        };
        
        const folder = findFolder(data, selectedPath);
        if (folder) {
          setSelectedFolder(folder);
          setFilteredFiles(folder.files);
        }
      }
    } catch (error) {
      console.error('Klasör yapısı yüklenirken hata:', error);
      toast.error('Medya klasörleri yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };
  
  // İlk yükleme
  useEffect(() => {
    fetchFolderStructure();
  }, []);
  
  // Klasör seçimi
  const handleFolderSelect = (path: string) => {
    setSelectedPath(path);
    
    if (!folderStructure) return;
    
    const findFolder = (folder: FolderStructure, path: string): FolderStructure | null => {
      if (folder.path === path) return folder;
      
      for (const subFolder of folder.subFolders) {
        const found = findFolder(subFolder, path);
        if (found) return found;
      }
      
      return null;
    };
    
    const folder = path === '' ? folderStructure : findFolder(folderStructure, path);
    if (folder) {
      setSelectedFolder(folder);
      setFilteredFiles(folder.files);
    }
  };
  
  // Arama işlemi
  useEffect(() => {
    if (selectedFolder && searchTerm) {
      const filtered = selectedFolder.files.filter((file: any) => 
        file.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredFiles(filtered);
    } else if (selectedFolder) {
      setFilteredFiles(selectedFolder.files);
    }
  }, [searchTerm, selectedFolder]);
  
  // Temp klasörü kontrolü
  const isSelectedFolderTemp = selectedPath.includes('temp') || selectedPath.endsWith('temp');
  
  // Divider mouse events
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const min = 200;
      const max = 600;
      const newWidth = Math.min(Math.max(startWidth + (e.clientX - startX), min), max);
      setLeftWidth(newWidth);
    };
    const handleMouseUp = () => setIsResizing(false);
    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, startX, startWidth]);
  
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Medya Galerisi</h1>
          <p className="text-muted-foreground mt-1">
            Tüm medya dosyalarınızı klasör yapısında görüntüleyin ve yönetin
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchFolderStructure}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Yenile
          </Button>
        </div>
      </div>
      
      {/* FLEX LAYOUT WITH RESIZABLE DIVIDER */}
      <div className="flex w-full h-[70vh] bg-background border rounded-md overflow-hidden">
        {/* Sol panel: Klasörler */}
        <div style={{ width: leftWidth }} className="h-full min-w-[200px] max-w-[600px] bg-background p-4 overflow-auto transition-all">
          <div className="font-medium flex items-center justify-between mb-4">
            <div className="flex items-center">
              <FolderIcon className="h-4 w-4 mr-2" />
              Klasörler
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={fetchFolderStructure}
              disabled={loading}
              title="Klasörleri yenile"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-64 border rounded-md">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : folderStructure ? (
            <FolderTree 
              data={folderStructure} 
              onFolderSelect={handleFolderSelect}
              selectedPath={selectedPath}
              onRefresh={fetchFolderStructure}
            />
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-64 p-6">
                <p className="text-muted-foreground">Klasör yapısı yüklenemedi</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={fetchFolderStructure}
                  className="mt-4"
                >
                  Yeniden Dene
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
        {/* Divider */}
        <div
          className={`w-1 h-full bg-muted cursor-ew-resize select-none transition-colors ${isResizing ? 'bg-primary/40' : ''}`}
          onMouseDown={e => {
            e.preventDefault();
            setIsResizing(true);
            setStartX(e.clientX);
            setStartWidth(leftWidth);
          }}
          style={{ zIndex: 10 }}
        />
        {/* Sağ panel: İçerik */}
        <div className="flex-1 h-full p-4 overflow-auto">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="font-medium">
                {selectedFolder ? (
                  <div className="flex flex-col">
                    <span className="flex items-center">
                      <FolderIcon className="h-4 w-4 mr-2" />
                      {selectedFolder.name || 'Uploads'}
                    </span>
                    <span className="text-xs text-muted-foreground mt-1">
                      {selectedFolder.fileCount} Dosya | {selectedFolder.size}
                    </span>
                  </div>
                ) : (
                  'Dosyalar'
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <div className="relative w-full max-w-sm">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Dosya adı ile ara..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
                >
                  {viewMode === "grid" ? (
                    <ViewIcon className="h-4 w-4" />
                  ) : (
                    <Grid3X3 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            
            {loading ? (
              <div className="flex justify-center items-center h-64 border rounded-md">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : selectedFolder ? (
              <FolderContent 
                folderPath={selectedPath}
                files={filteredFiles}
                onRefresh={fetchFolderStructure}
                isTemp={isSelectedFolderTemp}
              />
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center h-64 p-6">
                  <p className="text-muted-foreground">Lütfen bir klasör seçin</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 