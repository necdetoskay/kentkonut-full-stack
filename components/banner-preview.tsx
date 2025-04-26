"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Check, Play, Pause, ChevronLeft, ChevronRight, Save } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

interface Banner {
  id: number
  title: string
  imageUrl: string
  linkUrl?: string
  active: boolean
}

export type AnimationType = "FADE" | "SLIDE" | "ZOOM" | "ROTATE" | "BLUR" | "FLIP" | "ELASTIC" | "WAVE" | "STEP" | "SPIRAL"

interface BannerPreviewProps {
  banners: Banner[]
  animation: AnimationType
  duration: number
  playMode: "MANUAL" | "AUTO"
  width: number
  height: number
  groupId: string
  onAnimationChange?: (animation: AnimationType) => void
}

export function BannerPreview({
  banners,
  animation: initialAnimation,
  duration,
  playMode,
  width,
  height,
  groupId,
  onAnimationChange
}: BannerPreviewProps) {
  const [animation, setAnimation] = useState<AnimationType>(initialAnimation)
  const activeBanners = banners.filter(banner => banner.active)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(playMode === "AUTO")
  const [animationState, setAnimationState] = useState<"enter" | "active" | "exit">("active")
  const [isSaving, setIsSaving] = useState(false)
  
  // Banner sayısı 0 veya 1 ise otomatik oynatma devre dışı bırak
  useEffect(() => {
    if (activeBanners.length <= 1) {
      setIsPlaying(false)
    }
  }, [activeBanners.length])
  
  // Görüntüleme istatistiği kaydet
  useEffect(() => {
    if (activeBanners.length === 0 || !activeBanners[currentIndex]) return;
    
    const trackView = async () => {
      try {
        await fetch('/api/statistics/view', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            bannerId: activeBanners[currentIndex].id
          }),
        });
      } catch (error) {
        console.error('Görüntüleme istatistiği kaydedilemedi:', error);
      }
    };
    
    trackView();
  }, [currentIndex, activeBanners]);
  
  // Otomatik oynatma
  useEffect(() => {
    if (!isPlaying || activeBanners.length <= 1) return
    
    const animationTimeout = setTimeout(() => {
      setAnimationState("exit")
    }, duration - 500) // Geçiş animasyonu için süreyi biraz azalt
    
    const indexTimeout = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % activeBanners.length)
      setAnimationState("enter")
      
      // Kısa bir süre sonra active durumuna geç
      setTimeout(() => {
        setAnimationState("active")
      }, 500)
    }, duration)
    
    return () => {
      clearTimeout(animationTimeout)
      clearTimeout(indexTimeout)
    }
  }, [currentIndex, isPlaying, activeBanners.length, duration, animation])
  
  // Animasyon değiştiğinde onAnimationChange callback'i çağır
  useEffect(() => {
    if (onAnimationChange && animation !== initialAnimation) {
      onAnimationChange(animation)
    }
  }, [animation, initialAnimation, onAnimationChange])
  
  // Banner yoksa mesaj göster
  if (activeBanners.length === 0) {
    return (
      <div 
        className="flex items-center justify-center bg-muted rounded-lg overflow-hidden"
        style={{ width: "100%", height: "300px" }}
      >
        <p className="text-muted-foreground">Görüntülenecek aktif banner bulunamadı</p>
      </div>
    )
  }
  
  // Manuel geçiş fonksiyonları
  const handlePrev = () => {
    if (activeBanners.length <= 1) return
    setAnimationState("exit")
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + activeBanners.length) % activeBanners.length)
      setAnimationState("enter")
      setTimeout(() => setAnimationState("active"), 500)
    }, 500)
  }
  
  const handleNext = () => {
    if (activeBanners.length <= 1) return
    setAnimationState("exit")
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % activeBanners.length)
      setAnimationState("enter")
      setTimeout(() => setAnimationState("active"), 500)
    }, 500)
  }
  
  const togglePlay = () => {
    if (activeBanners.length <= 1) return
    setIsPlaying(!isPlaying)
  }
  
  const handleSaveAnimation = async () => {
    if (animation === initialAnimation) return
    
    setIsSaving(true)
    try {
      const response = await fetch(`/api/banner-groups/${groupId}/animation`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ animation }),
      })
      
      if (!response.ok) {
        throw new Error('Animasyon kaydedilirken bir hata oluştu')
      }
      
      toast.success('Animasyon başarıyla kaydedildi')
    } catch (error) {
      console.error('Animasyon kaydedilirken hata:', error)
      toast.error('Animasyon kaydedilemedi')
    } finally {
      setIsSaving(false)
    }
  }
  
  // Tıklama istatistiği kaydet
  const handleBannerClick = async () => {
    const currentBanner = activeBanners[currentIndex];
    if (!currentBanner) return;
    
    try {
      // Tıklama istatistiği kaydet
      await fetch('/api/statistics/click', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bannerId: currentBanner.id
        }),
      });
      
      // Eğer link varsa yönlendir
      if (currentBanner.linkUrl) {
        window.open(currentBanner.linkUrl, '_blank');
      }
    } catch (error) {
      console.error('Tıklama istatistiği kaydedilemedi:', error);
    }
  };
  
  // Animasyon sınıfları
  const getAnimationClass = () => {
    switch (animation) {
      case "FADE":
        return {
          enter: "animate-fade-in",
          active: "opacity-100",
          exit: "animate-fade-out"
        }[animationState]
      
      case "SLIDE":
        return {
          enter: "animate-slide-in-right",
          active: "translate-x-0",
          exit: "animate-slide-out-left"
        }[animationState]
      
      case "ZOOM":
        return {
          enter: "animate-zoom-in",
          active: "scale-100",
          exit: "animate-zoom-out"
        }[animationState]
        
      case "ROTATE":
        return {
          enter: "animate-rotate-in",
          active: "rotate-0",
          exit: "animate-rotate-out"
        }[animationState]
        
      case "BLUR":
        return {
          enter: "animate-blur-in",
          active: "blur-none",
          exit: "animate-blur-out"
        }[animationState]
        
      case "FLIP":
        return {
          enter: "animate-flip-in",
          active: "rotate-y-0",
          exit: "animate-flip-out"
        }[animationState]
        
      case "ELASTIC":
        return {
          enter: "animate-elastic-in",
          active: "scale-100",
          exit: "animate-elastic-out"
        }[animationState]
        
      case "WAVE":
        return {
          enter: "animate-wave-in",
          active: "skew-y-0",
          exit: "animate-wave-out"
        }[animationState]
        
      case "STEP":
        return {
          enter: "animate-step-in",
          active: "clip-path-none",
          exit: "animate-step-out"
        }[animationState]
        
      case "SPIRAL":
        return {
          enter: "animate-spiral-in",
          active: "scale-100 rotate-0",
          exit: "animate-spiral-out"
        }[animationState]
      
      default:
        return ""
    }
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <label htmlFor="animation-select" className="text-sm font-medium">Animasyon:</label>
          <Select 
            value={animation} 
            onValueChange={(value) => setAnimation(value as AnimationType)}
          >
            <SelectTrigger id="animation-select" className="w-[180px]">
              <SelectValue placeholder="Animasyon seçin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="FADE">Solma</SelectItem>
              <SelectItem value="SLIDE">Kayma</SelectItem>
              <SelectItem value="ZOOM">Yakınlaştırma</SelectItem>
              <SelectItem value="ROTATE">Döndürme</SelectItem>
              <SelectItem value="BLUR">Bulanıklaşma</SelectItem>
              <SelectItem value="FLIP">Çevirme</SelectItem>
              <SelectItem value="ELASTIC">Elastik</SelectItem>
              <SelectItem value="WAVE">Dalga</SelectItem>
              <SelectItem value="STEP">Basamak</SelectItem>
              <SelectItem value="SPIRAL">Spiral</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {animation !== initialAnimation && (
          <Button 
            size="sm" 
            onClick={handleSaveAnimation} 
            disabled={isSaving}
            className="flex items-center gap-1"
          >
            {isSaving ? "Kaydediliyor..." : "Kaydet"}
            {!isSaving && <Save className="w-4 h-4 ml-1" />}
          </Button>
        )}
      </div>
      
      <div className="relative overflow-hidden rounded-lg bg-background" style={{ width: "100%", paddingTop: `${(height / width) * 100}%` }}>
        {/* Kontrol butonları */}
        {activeBanners.length > 1 && (
          <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-between z-20 px-4">
            <Button 
              variant="outline" 
              size="icon" 
              className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm"
              onClick={handlePrev}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm"
              onClick={handleNext}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
        
        {/* Banner içeriği */}
        <div 
          className="absolute inset-0 cursor-pointer"
          onClick={handleBannerClick}
        >
          <div 
            className={`absolute inset-0 transition-all duration-500 ease-in-out ${getAnimationClass()}`}
          >
            <Image
              src={activeBanners[currentIndex]?.imageUrl || ""}
              alt={activeBanners[currentIndex]?.title || "Banner"}
              fill
              sizes={`${width}px`}
              className="object-cover"
              priority
            />
          </div>
        </div>
        
        {/* İlerleme göstergesi */}
        {activeBanners.length > 1 && (
          <div className="absolute bottom-14 left-0 right-0 flex justify-center gap-2">
            {activeBanners.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 rounded-full transition-all ${
                  index === currentIndex 
                    ? "w-8 bg-primary" 
                    : "w-2 bg-primary/30"
                }`}
              />
            ))}
          </div>
        )}
      </div>
      
      <p className="text-xs text-center text-muted-foreground">
        {activeBanners[currentIndex].title} ({currentIndex + 1}/{activeBanners.length})
        {activeBanners.length > 1 && 
          <span> • Animasyon: {animationToText(animation)} • Süre: {duration / 1000} saniye</span>
        }
      </p>
    </div>
  )
}

function animationToText(animation: string) {
  switch (animation) {
    case "FADE": return "Solma"
    case "SLIDE": return "Kayma"
    case "ZOOM": return "Yakınlaştırma"
    case "ROTATE": return "Döndürme"
    case "BLUR": return "Bulanıklaşma"
    case "FLIP": return "Çevirme"
    case "ELASTIC": return "Elastik"
    case "WAVE": return "Dalga"
    case "STEP": return "Basamak"
    case "SPIRAL": return "Spiral"
    default: return animation
  }
} 