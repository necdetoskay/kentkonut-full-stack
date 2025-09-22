# Docker Dağıtım Sorunu Çözüm Rehberi: Kurumsal Sayfası Güncelleme

Bu rehber, "Kurumsal" sayfasındaki "öne çıkanlar" öğelerinin Docker dağıtımınızda görünmemesi sorununu çözmek için adım adım talimatlar içermektedir.

---

## Sorun Nedir? (Basitçe)

Arka uç (backend) uygulamamızın Docker'da çalışabilmesi için bir "paket" (buna **Docker imajı** diyoruz) oluşturmamız gerekiyor. Bu "paket" oluşturulurken, içindeki bazı yazılımları güncellemeye çalışıyor. Ancak bu güncellemeler sırasında, yazılımların geldiği yerin (deponun) "kimliği" (GPG anahtarı) doğrulanamıyor. Bu yüzden "paket" oluşturma işlemi duruyor ve yeni özellikleriniz (yani "öne çıkanlar" API'si) Docker'a geçemiyor.

Kısacası: **Yeni API'yi yazdık ama arka uç uygulamanızın Docker paketi (imajı) oluşturulurken bir hata olduğu için yeni API'li arka uç uygulamanız Docker'da çalışmıyor.** Bu yüzden ön uç da yeni verileri gösteremiyor ve "Kurumsal" sayfanız güncel değil.

---

## Sorunu Nasıl Çözebilirim? (Adım Adım Çözüm)

Bu sorunu çözmek için **Dockerfile** adlı bir dosyada küçük bir değişiklik yapmanız gerekiyor.

### Adım 1: Dockerfile Dosyasını Bulun ve Açın

1.  Bilgisayarınızda şu klasöre gidin:
    `E:\Projeler\Proje Source\kentkonut-full-stack\kentkonut-backend`
2.  Bu klasörün içinde `Dockerfile` (veya `Dockerfile.production` gibi bir isimde olabilir) adlı dosyayı bulun.
3.  Bu dosyayı bir metin düzenleyiciyle (örneğin Not Defteri, VS Code, Sublime Text vb.) açın.

### Adım 2: Temel İmajı Değiştirin (En Önemli Adım)

1.  Açtığınız `Dockerfile` dosyasının en üstünde `FROM` ile başlayan bir satır göreceksiniz. Bu satır, uygulamanızın hangi temel sistem üzerinde çalıştığını belirtir. Örneğin, şöyle bir şey olabilir:
    ```dockerfile
    FROM node:18-slim
    ```
2.  Bu satırı, daha güncel bir Node.js imajıyla değiştirin. Bu, GPG anahtarı sorununu genellikle çözer çünkü yeni imajlar güncel güvenlik bilgileriyle gelir.
    *   **Önerilen Değişiklik:** `node:18-slim` yerine `node:20-slim` kullanmayı deneyin. Satırı şöyle değiştirin:
        ```dockerfile
        FROM node:20-slim
        ```
    *   (Eğer `node:20-slim` ile sorun yaşarsanız, `node:18-bullseye-slim` gibi `node:18` serisinin daha güncel ve spesifik bir sürümünü de deneyebilirsiniz.)
3.  **Bu değişikliği yapın ve dosyayı kaydedin.**

### Adım 3: Docker İmajlarını Yeniden Oluşturun

1.  Bilgisayarınızda komut istemcisini (terminal veya CMD) açın.
2.  Projenizin ana dizinine gidin. Yani şu klasöre:
    `E:\Projeler\Proje Source\kentkonut-full-stack`
3.  Şu komutu çalıştırın:
    ```bash
    docker-compose -f docker-compose.production.yml build --no-cache
    ```
4.  Bu komutun çıktısını dikkatlice izleyin. Eğer hata almazsanız (yani "Successfully built" gibi mesajlar görürseniz), bir sonraki adıma geçin. Eğer hala hata alırsanız, komutun çıktısını (ekrandaki tüm yazıları) bana bildirin.

### Adım 4: Docker Konteynerlerini Yeniden Başlatın

1.  İmajlar başarıyla oluştuktan sonra, yeni imajları kullanarak uygulamanızı yeniden başlatın. Aynı komut istemcisinde şu komutu çalıştırın:
    ```bash
    docker-compose -f docker-compose.production.yml up -d --force-recreate
    ```

### Adım 5: Tarayıcı Önbelleğini Temizleyin

1.  Web tarayıcınızın (Chrome, Firefox vb.) önbelleğini (cache) temizleyin. Bu, tarayıcınızın eski sayfa verilerini göstermesini engeller ve yeni güncellemeleri yüklemesini sağlar.

---

Bu adımları uyguladığınızda "Kurumsal" sayfasındaki "öne çıkanlar" öğelerinin görünmesi gerekmektedir. Herhangi bir adımda sorun yaşarsanız veya çıktıda hata görürseniz, lütfen bana bildirin.
