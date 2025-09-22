"use client";

import { useState, useCallback, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Crop, Settings, RotateCw, ZoomIn, ZoomOut, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import Cropper from 'react-easy-crop';
import { getCroppedImg, createImage, calculateOptimalZoom } from "@/lib/image-utils";

// Preset dimensions for common use cases
const PRESET_DIMENSIONS = [
  { name: "Instagram Post", width: 1080, height: 1080 },
  { name: "Instagram Story", width: 1080, height: 1920 },
  { name: "Facebook Post", width: 1200, height: 630 },
  { name: "Twitter Header", width: 1500, height: 500 },
  { name: "YouTube Thumbnail", width: 1280, height: 720 },
  { name: "LinkedIn Post", width: 1200, height: 627 },
  { name: "Web Banner", width: 1920, height: 1080 },
  { name: "Square", width: 500, height: 500 },
];

interface UploadFile {
  id: string;
  file: File;
  preview?: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  alt?: string;
  caption?: string;
  name: string;
  size: number;
  type: string;
}

interface ImageEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageFile: UploadFile | null;
  onSave: (editedFile: UploadFile) => void;
  targetDimensions?: { width: number; height: number };
}

export function ImageEditorModal({
  isOpen,
  onClose,
  imageFile,
  onSave,
  targetDimensions
}: ImageEditorModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [imageDimensions, setImageDimensions] = useState<{width: number, height: number} | null>(null);
  const [isPresetPopoverOpen, setIsPresetPopoverOpen] = useState(false);
  const [localTargetDimensions, setLocalTargetDimensions] = useState({
    width: targetDimensions?.width?.toString() || "",
    height: targetDimensions?.height?.toString() || ""
  });

  // Update target dimensions when modal opens or target dimensions change
  useEffect(() => {
    if (isOpen && targetDimensions) {
      setLocalTargetDimensions({
        width: targetDimensions.width?.toString() || "",
        height: targetDimensions.height?.toString() || ""
      });
    }
  }, [isOpen, targetDimensions]);

  // Load image dimensions when modal opens
  useEffect(() => {
    if (isOpen && imageFile?.preview) {
      loadImageDimensions();
    }
  }, [isOpen, imageFile?.preview]);

  const loadImageDimensions = async () => {
    if (!imageFile?.preview) return;

    try {
      const image = await createImage(imageFile.preview);
      setImageDimensions({ width: image.naturalWidth, height: image.naturalHeight });

      // Auto-calculate optimal zoom if target dimensions are set
      if (localTargetDimensions.width && localTargetDimensions.height) {
        const optimalZoom = calculateOptimalZoom(
          image.naturalWidth,
          image.naturalHeight,
          parseInt(localTargetDimensions.width),
          parseInt(localTargetDimensions.height)
        );
        setZoom(optimalZoom);
      }
    } catch (error) {
      console.error('Error loading image dimensions:', error);
    }
  };

  const handleCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleTargetDimensionChange = (dimension: 'width' | 'height', value: string) => {
    // Allow only numbers
    if (value === '' || /^\d+$/.test(value)) {
      setLocalTargetDimensions(prev => ({
        ...prev,
        [dimension]: value
      }));
    }
  };

  const handlePresetSelect = (preset: typeof PRESET_DIMENSIONS[0]) => {
    setLocalTargetDimensions({
      width: preset.width.toString(),
      height: preset.height.toString()
    });
    setIsPresetPopoverOpen(false);

    // Auto-calculate optimal zoom
    if (imageDimensions) {
      const optimalZoom = calculateOptimalZoom(
        imageDimensions.width,
        imageDimensions.height,
        preset.width,
        preset.height
      );
      setZoom(optimalZoom);
    }
  };

  const applyCropAndScale = async () => {
    if (!imageFile || !croppedAreaPixels) {
      toast.error("Kırpma alanı seçilmedi");
      return;
    }

    setIsProcessing(true);
    try {
      const targetWidth = localTargetDimensions.width ? parseInt(localTargetDimensions.width) : undefined;
      const targetHeight = localTargetDimensions.height ? parseInt(localTargetDimensions.height) : undefined;

      // Ensure we have a valid image source
      const imageSource = imageFile.preview || URL.createObjectURL(imageFile.file);

      const croppedBlob = await getCroppedImg(
        imageSource,
        croppedAreaPixels,
        rotation,
        targetWidth,
        targetHeight
      );

      // Create new file from cropped blob
      const croppedFile = new File(
        [croppedBlob],
        imageFile.name,
        { type: 'image/jpeg' }
      );

      // Create new UploadFile object with all required properties
      const editedFile: UploadFile = {
        id: imageFile.id,
        file: croppedFile,
        preview: URL.createObjectURL(croppedBlob),
        name: croppedFile.name,
        size: croppedFile.size,
        type: croppedFile.type,
        status: 'pending' as const,
        progress: 0,
        error: undefined,
        alt: imageFile.alt,
        caption: imageFile.caption
      };

      onSave(editedFile);
      toast.success("Resim başarıyla düzenlendi");
      handleClose();
    } catch (error) {
      console.error('Error applying crop:', error);
      toast.error("Resim düzenlenirken hata oluştu");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    // Reset all states
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setCroppedAreaPixels(null);
    setImageDimensions(null);
    setLocalTargetDimensions({ width: "", height: "" });
    onClose();
  };

  if (!imageFile) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="flex-shrink-0 p-6 pb-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Geri
            </Button>
            <div>
              <DialogTitle className="flex items-center gap-2">
                <Crop className="h-5 w-5" />
                Resim Düzenleyici
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {imageFile.name} - {imageDimensions ? `${imageDimensions.width}×${imageDimensions.height}px` : 'Yükleniyor...'}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden p-6 pt-0">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
            {/* Left Panel - Controls */}
            <div className="lg:col-span-1 space-y-6 overflow-y-auto">
              {/* Target Dimensions */}
              <div className="space-y-4">
                <h3 className="font-medium text-sm">Hedef Boyutlar</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="target-width" className="text-xs">Genişlik (px)</Label>
                    <Input
                      id="target-width"
                      type="text"
                      placeholder="Örn: 400"
                      value={localTargetDimensions.width}
                      onChange={(e) => handleTargetDimensionChange('width', e.target.value)}
                      className="text-sm"
                    />
                    <Slider
                      min={100}
                      max={2000}
                      step={50}
                      value={[parseInt(localTargetDimensions.width) || 400]}
                      onValueChange={(value) => handleTargetDimensionChange('width', value[0].toString())}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="target-height" className="text-xs">Yükseklik (px)</Label>
                    <Input
                      id="target-height"
                      type="text"
                      placeholder="Örn: 400"
                      value={localTargetDimensions.height}
                      onChange={(e) => handleTargetDimensionChange('height', e.target.value)}
                      className="text-sm"
                    />
                    <Slider
                      min={100}
                      max={2000}
                      step={50}
                      value={[parseInt(localTargetDimensions.height) || 400]}
                      onValueChange={(value) => handleTargetDimensionChange('height', value[0].toString())}
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Preset Dimensions */}
                <Popover open={isPresetPopoverOpen} onOpenChange={setIsPresetPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full justify-start text-xs"
                    >
                      <Settings className="w-3 h-3 mr-2" />
                      Hazır Boyutlar
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-4" align="start">
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm">Sosyal Medya ve Web Boyutları</h4>
                      <div className="grid grid-cols-1 gap-2">
                        {PRESET_DIMENSIONS.map((preset) => (
                          <Button
                            key={preset.name}
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePresetSelect(preset)}
                            className="justify-start text-left h-auto p-3 hover:bg-gray-50"
                          >
                            <div>
                              <div className="font-medium text-xs">{preset.name}</div>
                              <div className="text-xs text-gray-500">{preset.width} × {preset.height}</div>
                            </div>
                          </Button>
                        ))}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Zoom Control */}
              <div className="space-y-3">
                <Label className="text-xs font-medium">Yakınlaştırma</Label>
                <div className="space-y-2">
                  <Slider
                    value={[zoom]}
                    onValueChange={(value) => setZoom(value[0])}
                    min={1}
                    max={3}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>1x</span>
                    <span>{zoom.toFixed(1)}x</span>
                    <span>3x</span>
                  </div>
                </div>
              </div>

              {/* Rotation Control */}
              <div className="space-y-3">
                <Label className="text-xs font-medium">Döndürme</Label>
                <div className="space-y-2">
                  <Slider
                    value={[rotation]}
                    onValueChange={(value) => setRotation(value[0])}
                    min={-180}
                    max={180}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>-180°</span>
                    <span>{rotation}°</span>
                    <span>180°</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel - Cropping Interface */}
            <div className="lg:col-span-3 flex flex-col">
              <div className="flex-1 relative bg-gray-100 border rounded-lg overflow-hidden min-h-[500px]">
                {imageFile && (
                  <Cropper
                    image={imageFile.preview || URL.createObjectURL(imageFile.file)}
                    crop={crop}
                    zoom={zoom}
                    rotation={rotation}
                    aspect={
                      localTargetDimensions.width && localTargetDimensions.height
                        ? parseInt(localTargetDimensions.width) / parseInt(localTargetDimensions.height)
                        : undefined
                    }
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onRotationChange={setRotation}
                    onCropComplete={handleCropComplete}
                    showGrid={true}
                    style={{
                      containerStyle: {
                        width: '100%',
                        height: '100%',
                        backgroundColor: '#f3f4f6'
                      }
                    }}
                  />
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between mt-6">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  disabled={isProcessing}
                >
                  İptal
                </Button>
                <Button
                  onClick={applyCropAndScale}
                  disabled={isProcessing || !croppedAreaPixels}
                  className="min-w-[120px]"
                >
                  {isProcessing ? 'İşleniyor...' : 'Kaydet'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
