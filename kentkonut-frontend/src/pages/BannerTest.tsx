import React, { useEffect, useState } from 'react';
import { bannerService } from '@/services';

const BannerTest = () => {
  const [banners, setBanners] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const testBanners = async () => {
      try {
        console.log('🔄 Banner API test başlıyor...');
        
        const result = await bannerService.getActiveBannerGroups();
        
        console.log('📊 API Response:', result);
        console.log('📊 Response Type:', typeof result);
        console.log('📊 Is Array:', Array.isArray(result));
        
        setBanners(result);
        
        if (result.length === 0) {
          setError('Banner grubu bulunamadı');
        }
      } catch (err) {
        console.error('❌ Banner API hatası:', err);
        setError(`API Hatası: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    testBanners();
  }, []);

  if (loading) return <div>Yükleniyor...</div>;

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>Banner API Test</h1>
      
      {error && (
        <div style={{ color: 'red', padding: '10px', border: '1px solid red' }}>
          Hata: {error}
        </div>
      )}
      
      <h2>Banner Grupları ({banners.length})</h2>
      
      {banners.map((group, index) => (
        <div key={index} style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
          <h3>{group.name}</h3>
          <p>{group.description}</p>
          <p>Aktif: {group.active ? 'Evet' : 'Hayır'}</p>
          <p>Banner Sayısı: {group.banners?.length || 0}</p>
          
          {group.banners && group.banners.map((banner, bIndex) => (
            <div key={bIndex} style={{ marginLeft: '20px', border: '1px solid #eee', padding: '5px' }}>
              <h4>{banner.title}</h4>
              <p>{banner.description}</p>
              <p>Aktif: {banner.active ? 'Evet' : 'Hayır'}</p>
              <img src={banner.imageUrl} alt={banner.title} style={{ maxWidth: '200px' }} />
            </div>
          ))}
        </div>
      ))}
      
      <h2>Debug Bilgisi</h2>
      <pre>{JSON.stringify(banners, null, 2)}</pre>
    </div>
  );
};

export default BannerTest;
