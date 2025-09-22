# Boş Sayfa Hatası Hata Ayıklama Günlüğü

## Genel Özet ve Alınan Dersler

Bu hata ayıklama süreci boyunca, "boş sayfa" sorununun birkaç temel nedeni olabileceği tespit edilmiştir. Gelecekte benzer sorunlarla karşılaşıldığında aşağıdaki kontrol listesi kullanılabilir:

1.  **Rota Tanımı Eksikliği:**
    -   **Belirti:** Header ve footer gibi ana layout bileşenleri görünürken, sayfanın ana içerik alanı boş kalır. Konsolda `No routes matched location "/gidilmek-istenen-sayfa"` hatası bulunur.
    -   **Çözüm:** `App.tsx` dosyasında, gidilmek istenen sayfa için `<Route>` tanımının eksiksiz ve doğru olduğundan emin olunmalıdır.

2.  **Derleme (Compilation) Hatası:**
    -   **Belirti:** Ekranda hiçbir şey görünmez, tamamen boş beyaz bir sayfa vardır. Tarayıcı konsolunda genellikle `[plugin:vite:react-babel]` gibi bir ön ek ile kırmızı bir derleme hatası bulunur. Genellikle JSX etiketlerinin yanlış kapatılması (`<Link>...</a>` gibi) veya hatalı import'lardan kaynaklanır.
    -   **Çözüm:** Konsoldaki hata mesajı dikkatlice okunarak, belirtilen dosya ve satırdaki yazım hatası düzeltilmelidir.

3.  **Runtime (Çalışma Zamanı) Çökmesi:**
    -   **Belirti:** Sayfa ilk başta normal bir şekilde yüklenir (header, footer ve hatta içerik bir anlığına görünür), ancak saniyeler içinde tamamen boş bir sayfaya döner.
    -   **Tespit Edilen Neden:** Bu durumun en yaygın sebebi, bir alt bileşenin (bu vakada `react-helmet-async`) beklemediği bir formatta (`null`, `undefined`, `object` vb.) veri alması ve çökmesidir. Çöken bileşen, bütün render ağacını etkileyerek sayfanın kaybolmasına neden olur.
    -   **Çözüm:** Veriyi alan bileşene (`<Helmet>`) prop olarak göndermeden önce, verinin her zaman beklenen formatta (örneğin `String()`) olduğundan emin olunmalıdır. Eğer sorun buna rağmen devam ederse, stabiliteyi sağlamak adına sorunlu bileşen geçici veya kalıcı olarak devre dışı bırakılabilir.

---

Bu belge, frontend uygulamasında karşılaşılan ve konsolda herhangi bir hata olmamasına rağmen boş bir sayfa ile sonuçlanan sorunu ve bu sorunu çözmek için yapılan hata ayıklama adımlarını kaydetmektedir.

## 1. Sorun Tanımı

- **Belirti:** Tarayıcıda uygulama yüklendiğinde boş, beyaz bir sayfa görüntüleniyor. Konsolda veya ağ sekmesinde belirgin bir hata mesajı bulunmuyor.
- **Özel Not:** Konsolda sadece `[vite] connecting...`, `[vite] connected.`, `feature is disabled` gibi mesajlar yer alıyor. `feature is disabled` mesajının kaynağı belirsizliğini koruyor.
- **Davranış:** Bazı durumlarda sayfa bir anlığına yükleniyor gibi görünüyor, ardından tekrar boş hale geliyor.

## 2. İlk Hipotezler

- JavaScript çalışma zamanı hatası (ancak konsolda görünmüyor).
- React render sürecinde sessiz bir hata.
- CSS'in içeriği gizlemesi.
- Kök DOM elementinin yanlış yapılandırılması.
- Harici entegrasyonların (Sentry, ConsentManager) render sürecini engellemesi.
- Ortam değişkenleri veya özellik bayrakları ile ilgili sorunlar.

## 3. Hata Ayıklama Adımları ve Gözlemler

### Adım 1: `App.tsx`'i En Basit Haliyle Test Etme ("Hello World")

- **Eylem:** `kentkonut-frontend/src/App.tsx` dosyası, sadece `<div>Hello World</div>` döndüren en basit bileşene indirgendi.
- **Gözlem:** Ekranda "Hello World" yazısı başarıyla görüntülendi.
- **Çıkarım:** Temel React kurulumu, Vite derleme süreci ve `index.html` ile `main.tsx` arasındaki bağlantı doğru çalışıyor. Sorun, `App.tsx` içindeki veya onun import ettiği bileşenlerde.

### Adım 2: Harici Entegrasyonları Devre Dışı Bırakma (`main.tsx`)

- **Eylem:** `kentkonut-frontend/src/main.tsx` dosyasındaki Sentry ve ConsentManager başlatma kodları yorum satırı yapıldı.
- **Gözlem:** Ekranda hala "Hello World" yazısı görüntülendi.
- **Çıkarım:** Sentry veya ConsentManager, boş sayfa sorununa doğrudan neden olmuyor. Ancak, `feature is disabled` mesajının kaynağı hala belirsiz.

### Adım 3: `BrowserRouter` ve Basitleştirilmiş `AppRoutesWithNavbar`'ı Geri Getirme

- **Eylem:** `App.tsx`'e `BrowserRouter` ve sadece `<div>Navbar</div>` döndüren basitleştirilmiş bir `AppRoutesWithNavbar` bileşeni eklendi.
- **Gözlem:** Ekranda "Navbar" yazısı görüntülendi.
- **Çıkarım:** `react-router-dom` kütüphanesinin temel kurulumu doğru çalışıyor.

### Adım 4: Gerçek `Navbar` Bileşenini Geri Getirme

- **Eylem:** `App.tsx`'deki `AppRoutesWithNavbar` bileşeni, gerçek `Navbar` bileşenini render edecek şekilde güncellendi.
- **Gözlem:** Gezinme çubuğu başarıyla görüntülendi.
- **Çıkarım:** `Navbar` bileşeninin kendisi sorun yaratmıyor.

### Adım 5: `Routes` Bileşenini Tek Bir Rota ile Geri Getirme

- **Eylem:** `App.tsx`'e `Routes` bileşeni ve sadece anasayfa (`/`) için `Index` bileşenini yükleyen tek bir rota eklendi. `Suspense` ve `lazy` yükleme de bu adımda geri getirildi.
- **Gözlem:** Anasayfa içeriği başarıyla görüntülendi.
- **Çıkarım:** `Routes` bileşeni ve `Suspense`/`lazy` yükleme mekanizması temel olarak çalışıyor. Sorun, diğer sayfa bileşenlerinden birinde veya rotaların genel yapısında olabilir.

### Adım 6: Tüm Rotaları ve Bileşenleri Geri Getirme

- **Eylem:** `App.tsx` dosyasına tüm orijinal rotalar ve bileşenler geri yüklendi.
- **Gözlem:** Sayfa bir anlığına yükleniyor gibi göründü, ardından tekrar boş hale geldi. Konsolda `The above error occurred in one of your React components: at Lazy` hatası görüldü.
- **Çıkarım:** Hata, tembel yüklenen bileşenlerden birinde veya `Suspense` ile olan etkileşiminde. Sayfa yüklendikten sonra bir bileşen yüklenirken hata veriyor.

### Adım 7: Tembel Yüklemeyi Tamamen Devre Dışı Bırakma

- **Eylem:** `App.tsx`'deki tüm `lazy(() => import(...))` çağrıları doğrudan import ifadeleriyle değiştirildi ve `Suspense` bileşeni kaldırıldı.
- **Gözlem:** Sayfa boş kaldı. Konsolda `[vite] connecting...`, `[vite] connected.`, `feature is disabled` mesajları dışında hata yoktu.
- **Çıkarım:** Sorun sadece tembel yükleme ile ilgili değil, daha temel bir render engeli var. `feature is disabled` mesajının kaynağı hala belirsiz.

### Adım 8: `App.tsx`'i Tekrar "Hello World" Haline Getirme

- **Eylem:** `App.tsx` tekrar en basit "Hello World" bileşenine indirgendi.
- **Gözlem:** Ekranda "Hello World" yazısı görüntülendi.
- **Çıkarım:** Temel ortam hala çalışıyor. Sorun, `App.tsx`'e eklenen karmaşık kodda veya onun bağımlılıklarında.

### Adım 9: `App.tsx`'i Tam Haline Getirme (Son Deneme)

- **Eylem:** `App.tsx` dosyasına tüm orijinal rotalar ve bileşenler geri yüklendi.
- **Gözlem:** Sayfa boş kaldı. Konsolda `[vite] connecting...`, `[vite] connected.`, `feature is disabled` mesajları dışında hata yoktu.
- **Çıkarım:** Sorun hala devam ediyor. Uygulama, `App.tsx`'in tam haliyle render olmuyor, ancak konsolda hata vermiyor. Bu, render sürecinin çok erken bir aşamasında sessizce başarısız olduğu anlamına geliyor.

### Adım 10: `Navbar` ve `Footer`'ı Geri Getirme ve `main` İçeriğini Basitleştirme

- **Eylem:** `App.tsx`'e `Navbar`, `Footer` ve `<div>Main Content</div>` içeren bir `main` elementi eklendi.
- **Gözlem:** Header ve footer kısımları geldi, ancak `Main Content` yazısı ekranda görünmüyor. (Bu adımda `App.tsx`'deki `main` elementinin `style={{ paddingTop: '20px' }}` ve `className`'i de kaldırıldı.)
- **Çıkarım:** `main` elementi render oluyor, ancak içindeki içerik (bu durumda `<div>Main Content</div>`) render olmuyor. Sorun `main` elementinin çocuklarında veya `main` elementinin kendisindeki stil veya özelliklerde olabilir.

### Adım 11: `main` İçine `Routes` Bileşenini Tek Bir Rota ile Ekleme

- **Eylem:** `App.tsx`'deki `main` elementi içine `Routes` bileşeni ve sadece anasayfa (`/`) için `Index` bileşenini yükleyen tek bir rota eklendi. `Suspense` ve `lazy` yükleme de bu adımda geri getirildi.
- **Gözlem:** İçerik kısmı hala yok. Header ve footer var. Browser network tabında hiçbir hareket yok. Konsol tabında ise üst menü ve bannerlarla ilgili log kayıtları var.
- **Çıkarım:** `Index` bileşeni veya onun bağımlılıkları doğru şekilde yüklenmiyor veya render olmuyor. `Routes` bileşeni doğru çalışıyor gibi görünüyor, ancak `Index` bileşeninin kendisi sorunlu olabilir.

### Adım 12: `KurumsalPage.tsx`'i Basitleştirme ve `App.tsx`'ten Doğrudan Çağırma

- **Eylem:** `KurumsalPage.tsx` sadece `<div>Kurumsal Page Content</div>` döndürecek şekilde basitleştirildi. `App.tsx` ise `KurumsalPage`'i doğrudan render edecek şekilde değiştirildi (şimdilik `Routes` ve `BrowserRouter` olmadan).
- **Gözlem:** `Kurumsal Page Content` yazısı ekranda görünüyor, ancak `Navbar` ve `Footer` görünmüyor. Bu, `App.tsx`'in `BrowserRouter`'ı içermediği için `Navbar` ve `Footer`'ın render edilmediğini gösteriyor.
- **Çıkarım:** `App.tsx`'in yapısı, `Navbar`, `main` içeriği ve `Footer`'ı birlikte render etmek için doğru şekilde yapılandırılmamış.

### Adım 13: `App.tsx`'i `Navbar`, `KurumsalPage` ve `Footer`'ı Render Edecek Şekilde Geri Yükleme

- **Eylem:** `App.tsx`'i `Navbar`, `KurumsalPage` ve `Footer`'ı sırayla render edecek şekilde değiştirildi.
- **Gözlem:** (Bu adımın sonucu henüz bildirilmedi.)

## 4. Mevcut Durum ve Sonraki Adımlar

- Uygulamanın temel kurulumu ("Hello World" render oluyor) sağlam.
- `feature is disabled` mesajının kaynağı belirsiz, ancak bir özellik bayrağı veya ortam değişkeni ile ilgili olabilir.
- Boş sayfa sorunu, `App.tsx`'e eklenen bileşenler veya rotalarla ilgili. Özellikle `Suspense` ve `lazy` yükleme ile ilgili sorunlar yaşandı.

**Sonraki Adımlar:**

1.  `App.tsx`'i tekrar tam haline getireceğiz, ancak bu sefer `PageHeader` bileşenini ve `main` elementinin `padding-top` stilini dikkatlice kontrol edeceğiz.
2.  `KurumsalPage.tsx`'deki `HighlightCard` bileşeninin doğru şekilde render edildiğinden ve import edildiğinden emin olacağız.
3.  Her adımda dikkatli bir şekilde ilerleyip, her değişiklikten sonra sayfanın durumunu kontrol edeceğiz.

Bu belge, gelecekte benzer sorunlarla karşılaşıldığında hızlı bir referans noktası olacaktır. Sabrınız ve işbirliğiniz için teşekkür ederim。

## 5. Genel Navigasyon ve Runtime Hatalarının Çözümü (14. Adım ve Sonrası)

Önceki adımlarda sorun tek bir sayfaya izole edilmiş gibi görünse de, aslında daha genel sorunlar olduğu tespit edildi.

### Adım 14: Genel Rota Eksikliğinin Tespiti

- **Eylem:** `Kurumsal` ve `Hafriyat` sayfaları için rotalar manuel olarak eklendikten sonra, üst menüdeki diğer linklerin hiçbirinin çalışmadığı fark edildi.
- **Gözlem:** Konsolda farklı sayfalar için (`/hakkimizda`, `/projeler` vb.) `No routes matched location` hatası görüldü.
- **Çıkarım:** Sorun, hata ayıklama sırasında basitleştirilen `App.tsx` dosyasında uygulamanın genel rota tanımlarının eksik olmasıydı.

### Adım 15: Navbar'ın Analizi ve Tüm Rotaların Eklenmesi

- **Eylem:** Menü linklerinin doğru yol (path) bilgilerini nereden aldığını anlamak için `Navbar.tsx` incelendi. Hata durumunda kullanılan yedek (fallback) menü verileri, gerekli tüm ana rotaları ortaya çıkardı. `src/pages` klasöründeki tüm sayfalar (`Index`, `Hakkimizda`, `ProjectsPage` vb.) tespit edildi ve `App.tsx` dosyasına bu sayfalar için ilgili rotalar eklendi.
- **Gözlem:** `App.tsx` tüm rotaları içerecek şekilde güncellendi.
- **Çıkarım:** Uygulama artık tüm sayfa yollarını tanır hale geldi.

### Adım 16: Yanlış Link Kullanımının Düzeltilmesi (`<a>` -> `<Link>`)

- **Eylem:** `Navbar.tsx` dosyasının, sayfa içi navigasyon için standart `<a>` etiketleri kullandığı tespit edildi. Bu, her tıklamada sayfanın yeniden yüklenmesine neden oluyordu. Tüm bu etiketler, `react-router-dom` kütüphanesinin `<Link>` bileşeni ile değiştirildi.
- **Gözlem:** Değişiklik sırasında hatalı etiketlemeler (`<Link>...</a>`) nedeniyle geçici derleme hataları alındı ve bu hatalar düzeltildi.
- **Çıkarım:** Navigasyon, tek sayfa uygulaması (SPA) mantığına uygun, akıcı ve hatasız bir yapıya kavuşturuldu.

### Adım 17: Hafriyat Sayfasındaki Runtime Çökme Hatası

- **Eylem:** Tüm navigasyon düzeltmelerinden sonra, `Hafriyat` sayfasının ilk başta yüklendiği ancak saniyeler içinde çökerek boş beyaz bir ekrana dönüştüğü gözlemlendi.
- **Gözlem:** Konsol, hatanın `react-helmet-async` kütüphanesindeki `<HelmetDispatcher>` bileşeninden kaynaklandığını gösterdi.
- **Çıkarım:** Sorun, `Hafriyat.tsx` bileşeninin render edilmesi sırasında, veri geldikten sonra ortaya çıkan bir çalışma zamanı (runtime) hatasıydı.

### Adım 18: Kök Neden Tespiti ve Nihai Çözüm

- **Eylem:** Hatayı izole etmek için `Hafriyat.tsx` içindeki `<Helmet>` bileşeni geçici olarak devre dışı bırakıldı.
- **Gözlem:** `<Helmet>` devre dışı bırakıldığında sayfanın çökmediği ve stabil çalıştığı görüldü.
- **Çıkarım ve Nihai Çözüm:** Sorunun kök nedeni, API'den gelen sayfa içeriği (`pageContent`) verisi içindeki `metaTitle` veya `metaDescription` alanlarının bazen `null` (boş) olmasıydı. `react-helmet-async` kütüphanesi, `title` veya `meta` etiketlerine `string` (metin) olmayan bir değer (örneğin `null`) verildiğinde çökmektedir. İlk yapılan `|| 'varsayılan'` düzeltmesi bu durumu tam olarak karşılamadığı için sorun devam etmiştir. Sorun, `<Helmet>` bileşenini kalıcı olarak ve daha güvenli kontrollerle (örneğin `String()` ile değeri metne çevirerek) yeniden aktif ederek çözülmüştür.
