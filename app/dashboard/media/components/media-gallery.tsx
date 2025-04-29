"use client"

import { useState, useCallback, useEffect } from "react"
import { useDropzone } from "react-dropzone"
import { DirectCropper } from "@/app/dashboard/banners/components/direct-cropper"
import { Search, FolderIcon, RefreshCw, Settings, ArrowDownAZ, ArrowUpAZ, Calendar, FileDown, FileUp, SortAsc, SortDesc, Trash2, MoreVertical, FileText, Download, Video, Eye, ChevronDown, ChevronRight, Plus, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Card } from "@/components/ui/card"
import { formatDistanceToNow } from "date-fns"
import { tr } from "date-fns/locale"

interface FolderType {
  name: string
  path: string
  fileCount: number
  size: string
  subFolders?: FolderType[]
  isExpanded?: boolean
}

interface MediaFileType {
  name: string;
  path: string;
  size: string;
  type: string;
  dimensions?: string;
  modifiedAt: string;
  url: string;
  sizeBytes?: number;
  sizeFormatted?: string;
}

// Önceden tanımlanmış boyutlar ve oranlar
const PREDEFINED_DIMENSIONS = [
  { name: "Özel", width: 0, height: 0, aspectRatio: undefined },
  { name: "Kare (1:1)", width: 400, height: 400, aspectRatio: 1 },
  { name: "Geniş (16:9)", width: 800, height: 450, aspectRatio: 16/9 },
  { name: "Standart (4:3)", width: 800, height: 600, aspectRatio: 4/3 },
  { name: "Portre (3:4)", width: 600, height: 800, aspectRatio: 3/4 },
  { name: "Banner (5:1)", width: 1000, height: 200, aspectRatio: 5/1 },
  { name: "Mobil (9:16)", width: 450, height: 800, aspectRatio: 9/16 },
];

export function MediaGallery() {
  const [folders, setFolders] = useState<FolderType[]>([
    {
      name: "uploads",
      path: "uploads",
      fileCount: 30,
      size: "15.9 MB",
      isExpanded: true,
      subFolders: [
        { name: "anasayfa", path: "uploads/anasayfa", fileCount: 0, size: "0 B" },
        { name: "banners", path: "uploads/banners", fileCount: 3, size: "650.6 KB" },
        { name: "diger", path: "uploads/diger", fileCount: 0, size: "0 B" },
        { name: "haberler", path: "uploads/haberler", fileCount: 0, size: "0 B" },
        { name: "homepage", path: "uploads/homepage", fileCount: 0, size: "0 B" },
        { name: "kurumsal", path: "uploads/kurumsal", fileCount: 0, size: "0 B" },
        {
          name: "projeler",
          path: "uploads/projeler",
          fileCount: 27,
          size: "15.3 MB",
          isExpanded: true,
          subFolders: [
            { name: "14", path: "uploads/projeler/14", fileCount: 10, size: "11.3 MB" },
            { name: "temp", path: "uploads/projeler/temp", fileCount: 0, size: "0 B" }
          ]
        }
      ]
    }
  ])

  const [selectedFolder, setSelectedFolder] = useState<string>("uploads")
  const [searchQuery, setSearchQuery] = useState("")
  const [cropDialogOpen, setCropDialogOpen] = useState(false)
  const [cropImage, setCropImage] = useState<string | null>(null)
  const [dragTargetFolder, setDragTargetFolder] = useState<string | null>(null)
  const [selectedDimensionIndex, setSelectedDimensionIndex] = useState(2) // Default: Standart (4:3)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [fileToDelete, setFileToDelete] = useState<MediaFileType | null>(null)
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [previewFile, setPreviewFile] = useState<MediaFileType | null>(null)
  const [imageDimensions, setImageDimensions] = useState<{width: number, height: number} | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  
  // Varsayılan kırpma boyutları - önceden tanımlanmış boyutlardan alınır
  const [cropDimensions, setCropDimensions] = useState({
    width: PREDEFINED_DIMENSIONS[selectedDimensionIndex].width,
    height: PREDEFINED_DIMENSIONS[selectedDimensionIndex].height,
    aspectRatio: PREDEFINED_DIMENSIONS[selectedDimensionIndex].aspectRatio
  });

  // Sıralama için state'ler
  const [sortBy, setSortBy] = useState<"name" | "date" | "size">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Temsili dosya listesi (normalde API'den gelecek)
  const [mediaFiles, setMediaFiles] = useState<MediaFileType[]>([
    {
      name: "sample-image-1.jpg",
      path: "uploads/sample-image-1.jpg",
      size: "245 KB",
      sizeBytes: 245 * 1024,
      sizeFormatted: "245 KB",
      type: "image",
      dimensions: "1200x800",
      modifiedAt: "2023-09-15",
      url: "https://picsum.photos/seed/1/600/400"
    },
    {
      name: "sample-image-2.png",
      path: "uploads/sample-image-2.png",
      size: "512 KB",
      sizeBytes: 512 * 1024,
      sizeFormatted: "512 KB",
      type: "image",
      dimensions: "1600x900",
      modifiedAt: "2023-10-20",
      url: "https://picsum.photos/seed/2/600/400"
    },
    {
      name: "sample-image-3.jpg",
      path: "uploads/sample-image-3.jpg",
      size: "128 KB",
      sizeBytes: 128 * 1024,
      sizeFormatted: "128 KB",
      type: "image",
      dimensions: "800x600",
      modifiedAt: "2023-11-05",
      url: "https://picsum.photos/seed/3/600/400"
    },
    {
      name: "document-1.pdf",
      path: "uploads/document-1.pdf",
      size: "1.2 MB",
      sizeBytes: 1.2 * 1024 * 1024,
      sizeFormatted: "1.2 MB",
      type: "document",
      modifiedAt: "2023-11-10",
      url: ""
    }
  ]);

  // API'den dosya ve klasörleri getir (gerçek uygulamada)
  const fetchFiles = useCallback(async () => {
    setIsLoading(true);
    try {
      // Örnek: API'den veri alma
      // const response = await fetch(`/api/media-library/files?path=${selectedFolder}`);
      // if (!response.ok) throw new Error('Dosyalar getirilemedi');
      // const data = await response.json();
      // setMediaFiles(data.files);
      
      // Demo için var olan dosyaları filtrele
      const filteredFiles = mediaFiles.filter(file => 
        file.path.startsWith(selectedFolder + '/')
      );
      
      // Gerçek uygulamada bu kısım API'den gelir, burada sadece simülasyon
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
      
    } catch (error) {
      console.error("Dosya listeleme hatası:", error);
      toast.error("Dosyalar yüklenirken bir hata oluştu");
      setIsLoading(false);
    }
  }, [selectedFolder]);
  
  // Klasör değiştiğinde dosyaları yeniden yükle
  useEffect(() => {
    fetchFiles();
  }, [selectedFolder, fetchFiles]);
  
  // Dosyaları filtreleme ve sıralama
  const filteredAndSortedFiles = useCallback(() => {
    // Önce filtreleme
    let files = [...mediaFiles];
    
    // Sadece seçili klasördeki dosyaları göster
    files = files.filter(file => {
      const filePath = file.path.split('/');
      filePath.pop(); // Son elemanı (dosya adını) çıkar
      return filePath.join('/') === selectedFolder;
    });
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      files = files.filter(file => 
        file.name.toLowerCase().includes(query) || 
        file.type.toLowerCase().includes(query)
      );
    }
    
    // Sonra sıralama
    files.sort((a, b) => {
      if (sortBy === "name") {
        return sortOrder === "asc" 
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else if (sortBy === "date") {
        return sortOrder === "asc"
          ? new Date(a.modifiedAt).getTime() - new Date(b.modifiedAt).getTime()
          : new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime();
      } else if (sortBy === "size") {
        // Boyut karşılaştırması
        const sizeA = a.sizeBytes || parseFloat(a.size.split(' ')[0]);
        const sizeB = b.sizeBytes || parseFloat(b.size.split(' ')[0]);
        
        return sortOrder === "asc" ? sizeA - sizeB : sizeB - sizeA;
      }
      
      return 0;
    });
    
    return files;
  }, [mediaFiles, searchQuery, sortBy, sortOrder, selectedFolder]);

  // Boyut değiştiğinde güncelle
  const handleDimensionChange = (index: number) => {
    setSelectedDimensionIndex(index);
    setCropDimensions({
      width: PREDEFINED_DIMENSIONS[index].width,
      height: PREDEFINED_DIMENSIONS[index].height,
      aspectRatio: PREDEFINED_DIMENSIONS[index].aspectRatio
    });
    toast.info(`Görüntü boyutu: ${PREDEFINED_DIMENSIONS[index].name}`);
  };

  const onDrop = useCallback((acceptedFiles: File[], folderPath: string) => {
    const file = acceptedFiles[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setCropImage(reader.result as string)
        setCropDialogOpen(true)
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const handleCropComplete = (croppedImage: string, outputScale?: number) => {
    // Burada crop edilmiş resmi API'ye gönderme işlemi yapılacak
    console.log(
      "Cropped image:", croppedImage.substring(0, 50) + "...",
      "Output scale:", outputScale || 100, "%"
    );
    
    // Scaleleme bilgisini log'la
    if (outputScale) {
      const img = document.createElement('img');
      img.src = croppedImage;
      
      img.onload = () => {
        const originalWidth = img.width;
        const originalHeight = img.height;
        const scaledWidth = Math.round(originalWidth * (outputScale / 100));
        const scaledHeight = Math.round(originalHeight * (outputScale / 100));
        
        console.log("Image dimensions:", {
          original: `${originalWidth}×${originalHeight}px`,
          scaled: `${scaledWidth}×${scaledHeight}px (${outputScale}% scale)`
        });
      };
    }
    
    // TODO: Burada API'ye gönderme işlemi yapılacak
    // const formData = new FormData();
    // formData.append('image', dataURLtoFile(croppedImage, 'cropped.jpg'));
    // formData.append('folder', selectedFolder);
    // formData.append('outputScale', String(outputScale || 100));
    // fetch('/api/media/upload', { method: 'POST', body: formData });
    
    setCropDialogOpen(false);
    setCropImage(null);
    toast.success("Görsel başarıyla yüklendi");
    fetchFiles(); // Dosya listesini yenile
  }

  const toggleFolder = (path: string) => {
    setFolders(prevFolders => {
      const updateFolder = (folders: FolderType[]): FolderType[] => {
        return folders.map(folder => {
          if (folder.path === path) {
            return { ...folder, isExpanded: !folder.isExpanded }
          }
          if (folder.subFolders) {
            return { ...folder, subFolders: updateFolder(folder.subFolders) }
          }
          return folder
        })
      }
      return updateFolder(prevFolders)
    })
  }

  // Dosya önizleme
  const handlePreview = (file: MediaFileType) => {
    setPreviewFile(file);
    // Resim boyutlarını sıfırla
    setImageDimensions(null);
    
    // Görsel ise boyutları hesapla
    if (file.type === 'image') {
      // Browser'da çalışacak
      if (typeof window !== 'undefined') {
        const img = document.createElement('img');
        img.onload = () => {
          setImageDimensions({
            width: img.naturalWidth,
            height: img.naturalHeight
          });
        };
        img.src = file.url;
      }
    }
  };
  
  // Dosya silme
  const handleDeleteFile = (file: MediaFileType) => {
    setFileToDelete(file);
    setDeleteConfirmOpen(true);
  }
  
  // Silme onaylandığında
  const confirmDelete = async () => {
    if (!fileToDelete) return;
    
    setIsLoading(true);
    try {
      // Gerçek API çağrısı
      // const response = await fetch('/api/media-library/delete-file', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ path: fileToDelete.path })
      // });
      
      // if (!response.ok) throw new Error('Dosya silinemedi');
      
      // Başarılı olduğunda UI'dan kaldır
      setMediaFiles(prevFiles => prevFiles.filter(file => file.path !== fileToDelete.path));
      
      toast.success(`${fileToDelete.name} dosyası silindi`);
    } catch (error) {
      console.error('Dosya silme hatası:', error);
      toast.error('Dosya silinirken bir hata oluştu');
    } finally {
      setIsLoading(false);
      setDeleteConfirmOpen(false);
      setFileToDelete(null);
    }
  };
  
  // Çoklu dosya silme
  const handleBulkDelete = async () => {
    if (selectedFiles.length === 0) return;
    setBulkDeleteLoading(true);
    try {
      // Gerçek API çağrısı 
      // const response = await fetch('/api/media-library/delete-files', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ 
      //     fileNames: selectedFiles, 
      //     folderPath: selectedFolder 
      //   }),
      // });
      
      // if (!response.ok) throw new Error('Dosyalar silinemedi');
      
      // Başarılı olduğunda UI'dan kaldır
      setMediaFiles(prevFiles => 
        prevFiles.filter(file => !selectedFiles.includes(file.name))
      );
      
      toast.success(`${selectedFiles.length} dosya silindi`);
      setSelectedFiles([]);
    } catch (error) {
      console.error('Toplu dosya silme hatası:', error);
      toast.error('Dosyalar silinirken bir hata oluştu');
    } finally {
      setBulkDeleteLoading(false);
    }
  };

  // Checkbox değişimi
  const handleSelectFile = (fileName: string, checked: boolean) => {
    setSelectedFiles(prev =>
      checked ? [...prev, fileName] : prev.filter(f => f !== fileName)
    );
  };
  
  // Tümünü seç/kaldır
  const allFiles = filteredAndSortedFiles();
  const allSelected = allFiles.length > 0 && selectedFiles.length === allFiles.length;
  
  const handleSelectAll = (checked: boolean) => {
    setSelectedFiles(checked ? allFiles.map(f => f.name) : []);
  };
  
  // Tarih formatı
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { 
        addSuffix: true,
        locale: tr
      });
    } catch (e) {
      return 'Bilinmeyen tarih';
    }
  };

  const renderFolder = (folder: FolderType, level: number = 0) => {
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop: (files) => onDrop(files, folder.path),
      noClick: true,
      noKeyboard: true,
    })

    return (
      <div key={folder.path}>
        <div
          {...getRootProps()}
          className={cn(
            "flex items-center py-1 px-2 hover:bg-accent rounded-md cursor-pointer",
            selectedFolder === folder.path && "bg-accent",
            isDragActive && "border-2 border-dashed border-primary",
            dragTargetFolder === folder.path && "bg-primary/20"
          )}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={() => setSelectedFolder(folder.path)}
        >
          <input {...getInputProps()} />
          <div className="flex items-center flex-1">
            {folder.subFolders && folder.subFolders.length > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  toggleFolder(folder.path)
                }}
                className="w-4 h-4 mr-1 flex items-center justify-center"
              >
                {folder.isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              </button>
            )}
            <FolderIcon className="w-4 h-4 mr-2" />
            <span className="flex-1">{folder.name}</span>
            <span className="text-xs text-muted-foreground">
              {folder.fileCount} dosya | {folder.size}
            </span>
          </div>
        </div>
        {folder.subFolders && folder.isExpanded && (
          <div>
            {folder.subFolders.map(subFolder => renderFolder(subFolder, level + 1))}
          </div>
        )}
      </div>
    )
  }
  
  // Dosya kartları render fonksiyonu
  const renderFileCards = () => {
    const files = filteredAndSortedFiles();
    
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mt-4">
        {files.map((file) => (
          <Card key={file.path} className="overflow-hidden relative group">
            <div className="h-32 p-2 flex items-center justify-center bg-slate-50 relative">
              {file.type === 'image' ? (
                <img
                  src={file.url}
                  alt={file.name}
                  className="max-h-full max-w-full object-contain"
                />
              ) : file.type === 'video' ? (
                <Video className="h-16 w-16 text-muted-foreground" />
              ) : (
                <FileText className="h-16 w-16 text-muted-foreground" />
              )}
              
              {/* Dosya işlemleri - üzerine gelince görünür */}
              <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                <div className="absolute top-2 right-2">
                  <input
                    type="checkbox"
                    className="accent-primary h-4 w-4"
                    checked={selectedFiles.includes(file.name)}
                    onChange={(e) => handleSelectFile(file.name, e.target.checked)}
                  />
                </div>

                <div className="flex gap-1">
                  <Button
                    onClick={() => handlePreview(file)}
                    size="icon"
                    variant="secondary"
                    className="h-8 w-8 rounded-full"
                    title="Önizle"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  
                  <a
                    href={file.url}
                    download={file.name}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      size="icon"
                      variant="secondary" 
                      className="h-8 w-8 rounded-full"
                      title="İndir"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </a>
                  
                  <Button
                    onClick={() => handleDeleteFile(file)}
                    size="icon"
                    variant="destructive"
                    className="h-8 w-8 rounded-full"
                    title="Sil"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="p-2 text-xs">
              <div className="font-medium truncate" title={file.name}>
                {file.name}
              </div>
              <div className="text-muted-foreground flex justify-between mt-1">
                <span>{file.sizeFormatted || file.size}</span>
                <span>{formatDate(file.modifiedAt)}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="flex gap-4 h-[calc(100vh-12rem)]">
      {/* Sol Sidebar - Klasör Yapısı */}
      <div className="w-80 bg-card rounded-lg p-4 overflow-auto">
        <h3 className="font-semibold mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderIcon className="w-5 h-5" /> Klasörler
          </div>
          <Button size="sm" variant="ghost" title="Yenile" onClick={fetchFiles}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </h3>
        <div className="space-y-1">
          {folders.map(folder => renderFolder(folder))}
        </div>
      </div>

      {/* Sağ Alan - Dosya Görünümü */}
      <div className="flex-1 bg-card rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="text-lg font-semibold">
            {selectedFolder}
            <span className="text-sm text-muted-foreground ml-2">
              {filteredAndSortedFiles().length} Dosya
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Dosya adı ile ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 w-[300px]"
              />
            </div>
            
            {/* Sıralama Seçenekleri Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <SortAsc className="w-4 h-4" />
                  <span>Sırala</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Sıralama Seçenekleri</DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                <DropdownMenuItem 
                  onClick={() => { setSortBy("name"); setSortOrder("asc"); }}
                  className={cn(sortBy === "name" && sortOrder === "asc" && "bg-accent")}
                >
                  <ArrowDownAZ className="w-4 h-4 mr-2" />
                  <span>Ada Göre (A-Z)</span>
                </DropdownMenuItem>
                
                <DropdownMenuItem 
                  onClick={() => { setSortBy("name"); setSortOrder("desc"); }}
                  className={cn(sortBy === "name" && sortOrder === "desc" && "bg-accent")}
                >
                  <ArrowUpAZ className="w-4 h-4 mr-2" />
                  <span>Ada Göre (Z-A)</span>
                </DropdownMenuItem>
                
                <DropdownMenuItem 
                  onClick={() => { setSortBy("date"); setSortOrder("desc"); }}
                  className={cn(sortBy === "date" && sortOrder === "desc" && "bg-accent")}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>Tarihe Göre (Yeni-Eski)</span>
                </DropdownMenuItem>
                
                <DropdownMenuItem 
                  onClick={() => { setSortBy("date"); setSortOrder("asc"); }}
                  className={cn(sortBy === "date" && sortOrder === "asc" && "bg-accent")}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>Tarihe Göre (Eski-Yeni)</span>
                </DropdownMenuItem>
                
                <DropdownMenuItem 
                  onClick={() => { setSortBy("size"); setSortOrder("desc"); }}
                  className={cn(sortBy === "size" && sortOrder === "desc" && "bg-accent")}
                >
                  <FileDown className="w-4 h-4 mr-2" />
                  <span>Boyuta Göre (Büyük-Küçük)</span>
                </DropdownMenuItem>
                
                <DropdownMenuItem 
                  onClick={() => { setSortBy("size"); setSortOrder("asc"); }}
                  className={cn(sortBy === "size" && sortOrder === "asc" && "bg-accent")}
                >
                  <FileUp className="w-4 h-4 mr-2" />
                  <span>Boyuta Göre (Küçük-Büyük)</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Boyut Seçici Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" title="Görüntü Boyutu Ayarları">
                  <Settings className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Görüntü Boyutu</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {PREDEFINED_DIMENSIONS.map((dim, index) => (
                  <DropdownMenuItem 
                    key={index}
                    className={cn(
                      "cursor-pointer", 
                      selectedDimensionIndex === index && "bg-accent text-accent-foreground"
                    )}
                    onClick={() => handleDimensionChange(index)}
                  >
                    {dim.name}
                    {dim.width > 0 && <span className="ml-2 text-xs text-muted-foreground">
                      {dim.width}×{dim.height}
                    </span>}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button variant="outline" size="icon" onClick={fetchFiles}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Toplu seçim ve silme işlemleri */}
        {filteredAndSortedFiles().length > 0 && (
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={e => handleSelectAll(e.target.checked)}
                className="accent-primary h-4 w-4"
                id="select-all-files"
              />
              <label htmlFor="select-all-files" className="text-sm select-none cursor-pointer">
                Tümünü Seç ({filteredAndSortedFiles().length} dosya)
              </label>
            </div>
            {selectedFiles.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
                disabled={bulkDeleteLoading}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {bulkDeleteLoading ? 'Siliniyor...' : `Seçili Dosyaları Sil (${selectedFiles.length})`}
              </Button>
            )}
          </div>
        )}

        {/* Dosya Listesi */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-2">
              <div className="animate-spin w-8 h-8 border-t-2 border-b-2 border-primary rounded-full"></div>
              <p className="text-sm text-muted-foreground">Dosyalar yükleniyor...</p>
            </div>
          </div>
        ) : filteredAndSortedFiles().length > 0 ? (
          renderFileCards()
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <FolderIcon className="h-12 w-12 mb-2 text-muted-foreground/50" />
            <p>Bu klasörde dosya bulunmuyor veya arama kriterlerine uygun dosya yok</p>
          </div>
        )}
      </div>

      {/* Crop Dialog */}
      <DirectCropper
        open={cropDialogOpen}
        onClose={() => setCropDialogOpen(false)}
        image={cropImage || ""}
        onCropComplete={handleCropComplete}
        aspectRatio={cropDimensions.aspectRatio}
        width={cropDimensions.width}
        height={cropDimensions.height}
      />
      
      {/* Dosya önizleme diyaloğu */}
      <Dialog open={!!previewFile} onOpenChange={(open) => !open && setPreviewFile(null)}>
        <DialogContent className="sm:max-w-4xl mx-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span className="truncate">{previewFile?.name}</span>
              <span className="text-sm font-normal text-muted-foreground">{previewFile?.sizeFormatted || previewFile?.size}</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex items-center justify-center bg-muted/30 rounded-lg p-2 min-h-[300px]">
            {previewFile?.type === 'image' ? (
              <div className="relative">
                <img 
                  src={previewFile.url} 
                  alt={previewFile.name} 
                  className="max-h-[70vh] max-w-full object-contain rounded"
                />
                {imageDimensions && (
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {imageDimensions.width} × {imageDimensions.height}
                  </div>
                )}
              </div>
            ) : previewFile?.type === 'video' ? (
              <video
                src={previewFile.url}
                controls
                className="max-h-[70vh] max-w-full"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-muted-foreground">
                <FileText className="h-20 w-20 mb-4" />
                <p>Bu dosya türü önizlenemez</p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <a
              href={previewFile?.url}
              download={previewFile?.name}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                İndir
              </Button>
            </a>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Silme onay diyaloğu */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Dosyayı Sil</DialogTitle>
            <DialogDescription>
              Bu dosyayı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="mb-4">
              <strong>{fileToDelete?.name}</strong> dosyasını silmek üzeresiniz.
            </p>
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setDeleteConfirmOpen(false)}
              >
                İptal
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                disabled={isLoading}
              >
                {isLoading ? "Siliniyor..." : "Sil"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 