export interface HafriyatSahasi {
  id: string;
  ad: string;           // Saha adı
  tamamlanmaYuzdesi: number;  // 0-100 arası değer
  aciklama?: string;    // Opsiyonel açıklama
  sonGuncelleme?: string; // Tarih formatında
}

export interface HafriyatVerileri {
  baslik: string;
  aciklama: string;
  sonGuncelleme: string;
  sahalar: HafriyatSahasi[];
}

export interface HafriyatPageContent {
  title: string;
  subtitle: string;
  description: string;
  content?: string;
  metaTitle: string;
  metaDescription: string;
}