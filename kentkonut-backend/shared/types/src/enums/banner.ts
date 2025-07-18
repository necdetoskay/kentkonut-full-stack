// Banner Animasyon Tipleri
export const BANNER_ANIMASYON_TIPLERI = {
  SOLUKLESTIR: "Soluklaştırma",
  KAYDIR: "Kaydırma", 
  YAKINLESTIR: "Yakınlaştırma",
  CEVIR: "Çevirme",
  ZIPLA: "Zıplama"
} as const;

export type BannerAnimasyonTipi = keyof typeof BANNER_ANIMASYON_TIPLERI;

// Banner Animasyon Tipi Değerleri
export const BANNER_ANIMASYON_DEGERLERI = {
  SOLUKLESTIR: "SOLUKLESTIR",
  KAYDIR: "KAYDIR",
  YAKINLESTIR: "YAKINLESTIR", 
  CEVIR: "CEVIR",
  ZIPLA: "ZIPLA"
} as const; 