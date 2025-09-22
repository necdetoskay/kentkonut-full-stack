// API servis dosyası

// Servis tipi tanımı
export interface Service {
  id: number;
  title: string;
  color: string;
  borderColor: string;
  bgHover: string;
  imageSrc: string;
}

// Örnek veriler - ilerde admin panelden gelecek
const mockServiceData: Service[] = [
  {
    id: 1,
    title: 'Konut Hizmetleri',
    color: 'text-[#0277bd]',
    borderColor: 'border-[#0277bd]',
    bgHover: 'hover:bg-[#0277bd]/5',
    imageSrc: "/images/services/konut-icon.jpg"
  },
  {
    id: 2,
    title: 'Hafriyat Hizmetleri',
    color: 'text-[#4a4a4a]',
    borderColor: 'border-[#4a4a4a]',
    bgHover: 'hover:bg-[#4a4a4a]/5',
    imageSrc: "/images/services/hafriyat-icon.jpg"
  },
  {
    id: 3,
    title: 'Mimari Projelendirme',
    color: 'text-[#880e4f]',
    borderColor: 'border-[#880e4f]',
    bgHover: 'hover:bg-[#880e4f]/5',
    imageSrc: "/images/services/mimari-icon.jpg"
  },
  {
    id: 4,
    title: 'Kentsel Dönüşüm',
    color: 'text-[#2e7d32]',
    borderColor: 'border-[#2e7d32]',
    bgHover: 'hover:bg-[#2e7d32]/5',
    imageSrc: "/images/services/kentsel-icon.jpg"
  }
];

// Simüle edilmiş API çağrısı
export const fetchServices = async (): Promise<Service[]> => {
  // Gerçek API'ye bağlanma:
  // return fetch('/api/services').then(res => res.json());

  // Şimdilik mock veri dönüyoruz (ilerde gerçek API'ye bağlanacak)
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockServiceData);
    }, 500); // 500ms gecikme ile API çağrısı simülasyonu
  });
};

// Simüle edilmiş servis güncelleme API çağrısı
export const updateService = async (service: Service): Promise<Service> => {
  // Gerçek API'ye bağlanma:
  // return fetch(`/api/services/${service.id}`, {
  //   method: 'PUT',
  //   headers: {
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify(service),
  // }).then(res => res.json());

  // Şimdilik mock veri dönüyoruz (ilerde gerçek API'ye bağlanacak)
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(service);
    }, 500);
  });
}; 