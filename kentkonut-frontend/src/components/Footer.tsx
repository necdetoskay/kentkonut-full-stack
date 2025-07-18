import React from 'react';

const Footer = () => {
  return (
    <footer className="relative text-white" style={{ minHeight: '372px' }}>
      {/* Footer Arka Planı */}
      <div 
        className="absolute inset-0 w-full h-full z-0" 
        style={{ 
          backgroundImage: 'url(/referanslar/footer_back.jpg)', 
          backgroundSize: 'cover',
          backgroundPosition: 'left top',
          opacity: 1,
          backgroundColor: '#343434'
        }}
      ></div>
      
      {/* Kocaeli silueti arka plan görselini içeren overlay */}
      <div className="relative z-10">
        {/* Ana footer içeriği */}
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-12 gap-4 md:gap-0">
            
            {/* Sol kısım - Menü bağlantıları 1 - 2 kolon */}
            <div className="col-span-12 md:col-span-2 text-left">
              <div className="h-6 md:h-16"></div>
              <ul className="space-y-2 pb-2">
                <li className="pb-2">
                  <a href="/ihale-yonetimi" className="hover:text-gray-300 block text-base md:text-lg" style={{ color: '#fff' }}>
                    <div className="pl-3 md:pl-0">İhale Yönetimi</div>
                  </a>
                </li>
                <li className="pb-2">
                  <a href="/kurumsal-kimlik" className="hover:text-gray-300 block" style={{ color: '#fff', fontSize: '16px' }}>
                    <div className="pl-3 md:pl-0">Kurumsal Kimlik</div>
                  </a>
                </li>
                <li className="pb-2">
                  <a href="/yayinlarimiz" className="hover:text-gray-300 block" style={{ color: '#fff', fontSize: '16px' }}>
                    <div className="pl-3 md:pl-0">Yayınlarımız</div>
                  </a>
                </li>
                <li className="pb-2">
                  <a href="/memnuniyet-anketi" className="hover:text-gray-300 block" style={{ color: '#fff', fontSize: '16px' }}>
                    <div className="pl-3 md:pl-0">Memnuniyet Anketi</div>
                  </a>
                </li>
                <li className="pb-2">
                  <a href="/beni-haberdar-et" className="hover:text-gray-300 block" style={{ color: '#fff', fontSize: '16px' }}>
                    <div className="pl-3 md:pl-0">Beni Haberdar Et</div>
                  </a>
                </li>
              </ul>
            </div>
            
            {/* Orta sol kısım - Menü bağlantıları 2 - 2 kolon */}
            <div className="col-span-12 md:col-span-2 text-left pr-0">
              <div className="h-6 md:h-16"></div>
              <ul className="space-y-2 pb-4">
                <li className="pb-2 pr-0">
                  <a href="/hafriyat-ucret-tarifeleri" className="hover:text-gray-300 block" style={{ color: '#fff', fontSize: '16px' }}>
                    <div className="pl-3 md:pl-0">Hafriyat Ücret Tarifeleri</div>
                  </a>
                </li>
                <li className="pb-2 pr-0">
                  <a href="/hafriyat-sahalari" className="hover:text-gray-300 block" style={{ color: '#fff', fontSize: '16px' }}>
                    <div className="pl-3 md:pl-0">Hafriyat Sahaları</div>
                  </a>
                </li>
                <li className="pb-2 pr-0">
                  <a href="/kredi-hesaplama" className="hover:text-gray-300 block" style={{ color: '#fff', fontSize: '16px' }}>
                    <div className="pl-3 md:pl-0">Kredi Hesaplama</div>
                  </a>
                </li>
                <li className="pb-2 pr-0">
                  <a href="/dokumanlarimiz" className="hover:text-gray-300 block" style={{ color: '#fff', fontSize: '16px' }}>
                    <div className="pl-3 md:pl-0">Dökümanlarımız</div>
                  </a>
                </li>
                <li className="pb-2 pr-0">
                  <a href="/video" className="hover:text-gray-300 block" style={{ color: '#fff', fontSize: '16px' }}>
                    <div className="pl-3 md:pl-0">Video</div>
                  </a>
                </li>
              </ul>
            </div>
            
            {/* Orta kısım - Logo - 4 kolon */}
            <div className="col-span-12 md:col-span-4 text-center">
              <div>
                <img 
                  src="/referanslar/buyuksehirlogo_28022021011400.png"
                  alt="Kocaeli Büyükşehir Belediyesi"
                  className="mx-auto w-full max-w-[200px] h-auto md:max-w-[354px]"
                />
              </div>
            </div>
            
            {/* Sağ kısım - İletişim bilgileri - 4 kolon */}
            <div className="col-span-12 md:col-span-4">
              <div className="h-6 md:h-16"></div>
              <table className="w-full">
                <tbody>
                  {/* Adres satırı */}
                  <tr style={{ height: '60px' }}>
                    <td valign="top" style={{ width: '20%' }}>
                      <i className="fas fa-map-marker-alt" style={{ color: '#fff', fontSize: '25px' }}></i>
                    </td>
                    <td valign="top">
                      <a style={{ color: '#fff' }} className="text-base md:text-lg">
                        Körfez Mah. Hafız Binbaşı Cad. No:3 İzmit / Kocaeli
                      </a>
                    </td>
                  </tr>
                  
                  {/* Boşluk satırı */}
                  <tr style={{ height: '10px' }}>
                    <td></td>
                  </tr>
                  
                  {/* Email satırı */}
                  <tr style={{ height: '25px' }}>
                    <td>
                      <i className="far fa-envelope" style={{ color: '#fff', fontSize: '25px' }}></i>
                    </td>
                    <td>
                      <a href="mailto:halklailiskiler@kentkonut.com.tr" style={{ color: '#fff' }} className="text-base md:text-lg">
                        halklailiskiler@kentkonut.com.tr
                      </a>
                    </td>
                  </tr>
                  
                  {/* Boşluk satırı */}
                  <tr style={{ height: '20px' }}>
                    <td></td>
                  </tr>
                  
                  {/* Telefon satırı */}
                  <tr style={{ height: '60px' }}>
                    <td valign="top">
                      <i className="fas fa-phone-alt" style={{ color: '#fff', fontSize: '25px' }}></i>
                    </td>
                    <td valign="top">
                      <a href="tel:0 262 331 0703" style={{ color: '#fff' }} className="text-base md:text-lg">
                        0 262 331 0703
                      </a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Alt çizgi ve telif hakkı */}
          <div className="grid grid-cols-12 gap-0 pt-2 pb-2">
            <div className="col-span-12 md:col-span-6 text-center md:text-left" style={{ color: '#fff' }}>
              KENT KONUT İNŞAAT SAN. VE TİC. A.Ş. KOCAELİ BÜYÜKŞEHİR BELEDİYESİ İŞTİRAKİDİR
            </div>
            <div className="col-span-12 md:col-span-6 text-center md:text-right pt-4 md:pt-0">
              <a href="/site-kullanimi" className="hover:text-white" style={{ color: '#fff' }}>Site Kullanımı</a>
              <span style={{ padding: '0 5px', color: '#fff' }}>|</span>
              <a href="/kvkk" className="hover:text-white" style={{ color: '#fff' }}>KVKK</a>
              <span style={{ padding: '0 5px', color: '#fff' }}>|</span>
              <a href="/web-mail" className="hover:text-white" style={{ color: '#fff' }}>Web Mail</a>
              <span style={{ padding: '0 5px', color: '#fff' }}>|</span>
              <a href="/rss" className="hover:text-white" style={{ color: '#fff' }}>RSS</a>
              <span style={{ padding: '0 5px', color: '#fff' }}>|</span>
              <a href="http://www.k7.com.tr" target="_blank" className="hover:text-white" style={{ color: '#fff' }}>Yazılım K7</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
