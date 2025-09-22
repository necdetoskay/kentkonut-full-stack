# Tarayıcı Önbelleğini Temizleme Kılavuzu

Frontend uygulaması API çağrılarını hala `localhost:3010` adresine yapıyor. Bu sorun, tarayıcı önbelleğinden kaynaklanıyor olabilir. Aşağıdaki adımları izleyerek tarayıcı önbelleğini temizleyin:

## Chrome Tarayıcısı İçin

1. `Ctrl + Shift + Delete` tuşlarına basın
2. "Zaman aralığı" olarak "Tüm zamanlar" seçin
3. "Önbelleğe alınmış görseller ve dosyalar" seçeneğini işaretleyin
4. "Verileri temizle" düğmesine tıklayın
5. Sayfayı yeniden yükleyin (`Ctrl + F5` veya `Ctrl + Shift + R`)

## Firefox Tarayıcısı İçin

1. `Ctrl + Shift + Delete` tuşlarına basın
2. "Zaman aralığı" olarak "Tüm zamanlar" seçin
3. "Önbellek" seçeneğini işaretleyin
4. "Şimdi temizle" düğmesine tıklayın
5. Sayfayı yeniden yükleyin (`Ctrl + F5` veya `Ctrl + Shift + R`)

## Edge Tarayıcısı İçin

1. `Ctrl + Shift + Delete` tuşlarına basın
2. "Zaman aralığı" olarak "Tüm zamanlar" seçin
3. "Önbelleğe alınmış görseller ve dosyalar" seçeneğini işaretleyin
4. "Şimdi temizle" düğmesine tıklayın
5. Sayfayı yeniden yükleyin (`Ctrl + F5` veya `Ctrl + Shift + R`)

## Alternatif Çözüm: Gizli Pencere Kullanımı

Tarayıcınızın gizli/özel modunu kullanarak uygulamayı test edebilirsiniz:
- Chrome: `Ctrl + Shift + N`
- Firefox: `Ctrl + Shift + P`
- Edge: `Ctrl + Shift + N`

Bu modda önbellek kullanılmaz ve API çağrıları doğru adrese yapılabilir.