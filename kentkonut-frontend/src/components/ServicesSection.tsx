import React from 'react';

const services = [
  {
    id: 1,
    title: 'Konut Hizmetleri',
    imageSrc: '/images/services/1_24022021034916.jpg',
    color: '#4F772D'
  },
  {
    id: 2,
    title: 'Hafriyat Hizmetleri',
    imageSrc: '/images/services/2_24022021040848.jpg',
    color: '#31708E'
  },
  {
    id: 3,
    title: 'Mimari Projelendirme',
    imageSrc: '/images/services/3_24022021034931.jpg',
    color: '#5B4E77'
  },
  {
    id: 4,
    title: 'Kentsel Dönüşüm',
    imageSrc: '/images/services/4_24022021034938.jpg',
    color: '#754043'
  }
];

const ServicesSection: React.FC = () => {
  return (
    <section className="bg-white py-16 px-4">
      <div className="container mx-auto">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">HİZMETLERİMİZ</h2>
          <div className="flex items-center justify-center">
            <div className="h-1 w-20 bg-green-700"></div>
            <div className="h-1 w-10 bg-gray-300 mx-3"></div>
            <div className="h-1 w-20 bg-green-700"></div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service) => (
            <div 
              key={service.id} 
              className="services-card group rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
              style={{ borderTopColor: service.color, borderTopWidth: '4px' }}
            >
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={service.imageSrc} 
                  alt={service.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-6 bg-white text-center">
                <h3 
                  className="text-xl font-semibold transition-colors duration-300"
                  style={{ color: service.color }}
                >
                  {service.title}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection; 