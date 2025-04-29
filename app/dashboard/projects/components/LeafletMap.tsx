"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import { Button } from "@/components/ui/button";

// Haritadaki marker ikonunu içeri aktar
// SSR ile ilgili sorunları çözmek için şu ikonu ekliyoruz
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

// TypeScript'te iconları tanımlama
// @ts-ignore - Leaflet tiplerine şimdilik ignore ekliyoruz
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: iconRetinaUrl.src,
  iconUrl: iconUrl.src,
  shadowUrl: shadowUrl.src,
});

interface LeafletMapProps {
  onLocationSelect: (lat: number, lng: number) => void;
  initialCoordinates?: { lat: number; lng: number } | null;
}

export default function LeafletMap({ onLocationSelect, initialCoordinates }: LeafletMapProps) {
  const [selected, setSelected] = useState<{
    lat: number;
    lng: number;
  } | null>(
    initialCoordinates ? { lat: initialCoordinates.lat, lng: initialCoordinates.lng } : null
  );
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  function LocationMarker() {
    const map = useMap();
    useEffect(() => {
      if (selected) {
        map.setView([selected.lat, selected.lng], 16);
      }
    }, [selected, map]);
    useMapEvents({
      click(e: any) {
        setSelected(e.latlng);
      },
    });
    return selected ? <Marker position={selected} /> : null;
  }

  const handleSearch = async () => {
    setError("");
    if (!search.trim()) return;
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(search)}`
      );
      const data = await res.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        setSelected({ lat: parseFloat(lat), lng: parseFloat(lon) });
      } else {
        setError("Sonuç bulunamadı.");
      }
    } catch {
      setError("Arama sırasında hata oluştu.");
    }
  };

  return (
    <div>
      <MapContainer
        center={selected ? [selected.lat, selected.lng] : [40.7654, 29.9408]}
        zoom={13}
        style={{ height: 350, width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <LocationMarker />
      </MapContainer>
      <div className="flex gap-2 mt-2">
        <input
          className="border rounded px-2 py-1 flex-1"
          placeholder="Adres veya yer ara..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") handleSearch(); }}
        />
        <Button type="button" onClick={handleSearch}>Ara</Button>
      </div>
      {error && <div className="text-red-500 text-sm mt-1">{error}</div>}
      <div className="flex justify-end mt-4">
        <Button
          disabled={!selected}
          onClick={() => {
            if (selected) onLocationSelect(selected.lat, selected.lng);
          }}
        >
          Tamam
        </Button>
      </div>
    </div>
  );
} 