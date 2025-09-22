**IMPORTANT RULE: asal frontend uygulamasını çalıştırma
**IMPORTANT RULE: uygulamamızda 2 mod var 
    * ilk mod development modu
        * frontend localhost:3020 portunda çalışıyor
        * backend localhost:3021 portunda çalışıyor
        * posgres 172.41.42.51:5433 portunda çalışıyor
    * ikinci mod production modu
        * frontend 172.41.42.51:3020 portunda çalışıyor
        * backend 172.41.42.51:3021 portunda çalışıyor
        * posgres 172.41.42.51:5433 portunda çalışıyor
    
**ASLA curl komutu kullanma onun yerine webrequest komutu kullan
