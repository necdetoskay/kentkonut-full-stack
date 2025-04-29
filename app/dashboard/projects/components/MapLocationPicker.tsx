"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import dynamic from "next/dynamic";
import { MapPinIcon } from "lucide-react";

// Leaflet bileşenlerini SSR olmadan client-side'da yüklemek için dynamic import kullanıyoruz
const LeafletMap = dynamic(
  () => import("./LeafletMap"),
  { 
    loading: () => <div className="h-[400px] bg-gray-100 flex items-center justify-center">Harita yükleniyor...</div>,
    ssr: false 
  }
);

interface MapLocationPickerProps {
  onLocationSelect: (location: string) => void;
  initialLocation?: string;
}

export function MapLocationPicker({ onLocationSelect, initialLocation }: MapLocationPickerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState(initialLocation || "");
  const [coordinates, setCoordinates] = useState<{lat: number, lng: number} | null>(null);

  // Koordinatları parse et (eğer initialLocation içinde koordinat varsa)
  useEffect(() => {
    if (initialLocation) {
      const match = initialLocation.match(/\[([\d.-]+),\s*([\d.-]+)\]/);
      if (match) {
        setCoordinates({
          lat: parseFloat(match[1]),
          lng: parseFloat(match[2])
        });
      }
    }
  }, [initialLocation]);

  // Konum arama işlevi
  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    try {
      // OpenStreetMap Nominatim API ile konum arama
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchTerm)}`);
      const data = await response.json();
      
      if (data && data.length > 0) {
        const firstResult = data[0];
        const newCoords = {
          lat: parseFloat(firstResult.lat),
          lng: parseFloat(firstResult.lon)
        };
        
        setCoordinates(newCoords);
        setSelectedLocation(`${firstResult.display_name}`);
      } else {
        // Sonuç bulunamadı
        alert("Arama sonucu bulunamadı. Lütfen başka bir konum deneyin.");
      }
    } catch (error) {
      console.error("Konum arama hatası:", error);
      alert("Konum arama sırasında bir hata oluştu.");
    }
  };

  // Haritada tıklama ile konum seçimi
  const handleMapClick = (lat: number, lng: number, address: string) => {
    setCoordinates({ lat, lng });
    
    // Adres boşsa sadece koordinatları göster
    const locationText = address 
      ? address
      : `Seçilen Konum`;
      
    setSelectedLocation(locationText);
  };

  // Konum seçimi tamamlandığında
  const handleSelectLocation = () => {
    if (selectedLocation && coordinates) {
      // Koordinatları ve adresi içeren bir değer döndür
      const locationWithCoords = `${coordinates.lat.toFixed(6)}, ${coordinates.lng.toFixed(6)}`;
      onLocationSelect(locationWithCoords);
    }
  };

  return (
    <div className="space-y-4">
      <LeafletMap 
        onLocationSelect={handleMapClick}
        initialCoordinates={coordinates}
      />
      
      <div className="space-y-2">
        <Label>Seçilen Konum</Label>
        <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-md text-sm">
          {coordinates ? <MapPinIcon className="h-4 w-4 text-red-500 flex-shrink-0" /> : null}
          <p className="line-clamp-2 flex-1">
            {selectedLocation || "Henüz konum seçilmedi"}
          </p>
          {coordinates && (
            <div className="text-xs text-muted-foreground">
              {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
            </div>
          )}
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <Input 
          placeholder="Konum ara... (Örn: Kocaeli, İzmit)" 
          className="flex-1"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <Button 
          type="button"
          onClick={handleSearch}
        >
          Ara
        </Button>
      </div>
      
      <div className="flex justify-between">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => onLocationSelect("")}
        >
          İptal
        </Button>
        <Button 
          type="button" 
          onClick={handleSelectLocation}
          disabled={!coordinates}
        >
          Konumu Seç
        </Button>
      </div>
    </div>
  );
}

export default MapLocationPicker; 