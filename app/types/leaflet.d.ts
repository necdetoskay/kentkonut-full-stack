declare module 'leaflet' {
  export * from '@types/leaflet';
}

// Leaflet'in resim dosyaları için tip tanımlamaları
declare module '*.png' {
  const value: any;
  export default value;
} 