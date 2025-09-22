import React from 'react';

interface HafriyatHeaderProps {
  baslik: string;
  aciklama: string;
  sonGuncelleme: string;
}

const HafriyatHeader: React.FC<HafriyatHeaderProps> = ({ baslik, aciklama, sonGuncelleme }) => {
  return (
    <div className="hafriyat-header" style={{ marginBottom: '2rem' }}>
      <h1 style={{ 
        fontSize: '2rem', 
        color: '#0b244c', 
        marginBottom: '1rem',
        fontWeight: 'bold'
      }}>
        {baslik}
      </h1>
      <p style={{ 
        fontSize: '1rem', 
        lineHeight: '1.6', 
        color: '#333', 
        marginBottom: '1rem',
        textAlign: 'justify'
      }}>
        {aciklama}
      </p>
      <p style={{ 
        fontSize: '0.9rem', 
        color: '#666', 
        fontStyle: 'italic' 
      }}>
        Saha verileri {sonGuncelleme} tarihi itibarı ile güncellenmiştir...
      </p>
    </div>
  );
};

export default HafriyatHeader;