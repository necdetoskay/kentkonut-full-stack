# Kentkonut Frontend Güvenlik Analizi (ST)

Bu doküman, Kentkonut projesinin frontend katmanında yapılan adım adım (step-by-step, ST) güvenlik analizini, alınan aksiyonları ve best practice önerilerini içerir. Gelecekte referans olması için hazırlanmıştır.

## İçindekiler

1. [User Input: Sanitize & Validation](#user-input-sanitize--validation)
2. [Output Encoding & XSS Koruması](#output-encoding--xss-koruması)
3. [HTTPS, Cookie Güvenliği, .env](#https-cookie-güvenliği-env)
4. [npm Audit & Bağımlılık Güvenliği](#npm-audit--bağımlılık-güvenliği)
5. [CORS & API Rate Limit](#cors--api-rate-limit)
6. [Content Security Policy (CSP)](#content-security-policy-csp)
7. [Auth/Token/Session Güvenliği](#authtokensession-güvenliği)

---

## 1. User Input: Sanitize & Validation

**Analiz:**
- Projedeki tüm form, arama, rich text ve API endpointlerinde kullanıcıdan alınan inputlar kontrol edildi.
- Frontend'de react-hook-form ve zod ile validation şeması kullanılıyor mu, arama inputlarında gereksiz karakter/saldırı engelleniyor mu, rich text editörlerinde HTML/JS injection riskine karşı sanitize uygulanıyor mu kontrol edildi.
- Backend'de API endpointlerinde tekrar validation uygulanıyor mu kontrol edildi.

**Risk:**
- Eksik validation/sanitize, XSS, SQL injection, veri bütünlüğü ve güvenlik açıklarına yol açar.

**Best Practice:**
- Tüm inputlarda zod/yup/joi ile validation.
- Rich text için DOMPurify veya benzeri ile sanitize.
- Backend'de de validation zorunlu.

**Aksiyon:**
- [x] Eksik validation/sanitize noktaları tespit edildi ve description alanı için DOMPurify ile sanitize eklendi (BannerForm).

---

## 2. Output Encoding & XSS Koruması

**Analiz:**
- dangerouslySetInnerHTML, rich text render, SafeHtmlRenderer gibi yerlerde output encoding ve XSS koruması kontrol edildi.
- Kullanıcıdan gelen HTML içeriği doğrudan render ediliyorsa, sanitize (örn. DOMPurify) uygulanıyor mu bakıldı.
- SafeHtmlRenderer gibi özel componentlerde XSS koruması ve encoding var mı kontrol edildi.

**Risk:**
- Eksik encoding, XSS saldırılarına ve kullanıcı verisinin çalınmasına yol açar.

**Best Practice:**
- Kullanıcıdan gelen HTML içeriği DOMPurify veya benzeri ile sanitize edilmeli.
- Output encoding zorunlu, mümkünse innerHTML yerine güvenli render componenti kullanılmalı.
- SafeHtmlRenderer gibi componentlerde XSS koruması ve encoding fonksiyonu olmalı.

**Aksiyon:**
- [x] Eksik encoding/sanitize noktaları tespit edildi ve news.content için DOMPurify ile sanitize eklendi (HaberDetay sayfası).

---

## 3. HTTPS, Cookie Güvenliği, .env

**Analiz:**
- HTTPS zorunluluğu, production ortamında HTTP erişimi engelleniyor mu kontrol edildi.
- Cookie'ler Secure, HttpOnly ve SameSite=Strict/Lax olarak ayarlanıyor mu bakıldı.
- localStorage'da hassas veri tutulup tutulmadığı kontrol edildi.
- .env dosyalarının ve gizli anahtarların public'e sızıp sızmadığı (build çıktısında .env, .env.local, .env.production dosyası olup olmadığı) kontrol edildi.

**Risk:**
- Açıkta kalan cookie, .env veya hassas veri, oturum çalınmasına ve veri sızıntısına yol açar.

**Best Practice:**
- HTTPS zorunlu, HTTP erişimi production'da engellenmeli.
- Cookie'ler Secure, HttpOnly, SameSite=Strict/Lax olmalı.
- localStorage'da hassas veri tutulmamalı.
- .env ve gizli anahtarlar public'e/build çıktısına sızmamalı.

**Aksiyon:**
- [x] .env ve .env.* dosyaları .gitignore'a eklendi.
- [x] Frontend'de localStorage'da hassas veri tutulmadığı doğrulandı.
- [ ] Cookie güvenliği için backend'de aşağıdaki gibi ayar yapılmalı:

```js
res.cookie('token', token, {
  httpOnly: true,
  secure: true, // Sadece HTTPS
  sameSite: 'strict', // veya 'lax'
  maxAge: 7 * 24 * 60 * 60 * 1000 // 1 hafta
});
```

--- 

## 4. npm Audit & Bağımlılık Güvenliği

**Analiz:**
- npm audit ile bağımlılık güvenliği düzenli kontrol edildi mi?
- Kritik açıklar ve güncellenmesi gereken paketler tespit edildi mi?
- Özellikle frontend'de XSS, prototype pollution, remote code execution gibi açıklar için uyarılar dikkate alındı mı?

**Risk:**
- Geliştirici bağımlılıkları veya 3rd party paketlerdeki güvenlik açıkları, zincirleme olarak tüm uygulamanın güvenliğini tehlikeye atar.

**Best Practice:**
- Düzenli olarak `npm audit` ve `npm audit fix` çalıştırılmalı.
- Kritik açıklar için paketler güncellenmeli veya alternatifleriyle değiştirilmelidir.
- Bağımlılık güncellemeleri CI/CD sürecine entegre edilmeli.

**Aksiyon:**
- [x] npm audit çalıştırıldı, production bağımlılıklarında güvenlik açığı bulunmadı.

--- 

## 5. CORS & API Rate Limit

**Analiz:**
- API endpointlerinde CORS ayarları gereksiz açık mı (örn. Access-Control-Allow-Origin: *) kontrol edildi.
- Sadece güvenilen domainlere izin veriliyor mu bakıldı.
- API rate limit (örn. express-rate-limit, nginx rate limit) uygulanıyor mu kontrol edildi.

**Risk:**
- Açık CORS ve limitsiz API, abuse, veri sızıntısı ve DDoS riskini artırır.

**Best Practice:**
- CORS sadece güvenilen domainlere izin vermeli.
- API rate limit mutlaka uygulanmalı.
- CORS ve rate limit ayarları backend'de merkezi olarak yönetilmeli.

**Aksiyon:**
- [x] CORS ayarı dinamik ve güvenli hale getirildi (`CORS_ALLOWED_ORIGIN` env ile yönetiliyor).
- [x] API rate limit (100/15dk/IP) eklendi ve örnek endpointte (`/api/public/banners`) uygulandı. (Daha fazla endpoint için kolayca genişletilebilir.)

--- 

## 6. Content Security Policy (CSP)

**Analiz:**
- CSP header uygulanıyor mu kontrol edildi (örn. default-src 'self'; script-src 'self' vs.).
- Özellikle inline script, eval, 3rd party script izinleri kısıtlanmış mı bakıldı.

**Risk:**
- CSP olmadan XSS ve 3rd party script saldırılarına karşı korumasız kalırsınız.

**Best Practice:**
- CSP header eklenmeli: `Content-Security-Policy: default-src 'self'; script-src 'self'; object-src 'none';`
- Inline script ve eval izinleri mümkünse tamamen kapatılmalı.
- 3rd party scriptler için nonce veya hash kullanılmalı.

**Aksiyon:**
- [x] Best practice CSP header (`Content-Security-Policy`) next.config.js ile tüm route'lara eklendi ve test edildi.

--- 

## 7. Auth/Token/Session Güvenliği

**Analiz:**
- Authentication/authorization akışında token, session, context, refresh, logout işlemleri güvenli mi kontrol edildi.
- Token'lar localStorage yerine HttpOnly cookie'de mi tutuluyor bakıldı.
- Refresh token, session hijacking, CSRF ve logout işlemleri güvenli mi analiz edildi.

**Risk:**
- Zayıf auth akışı, oturum çalınması, yetkisiz erişim ve veri sızıntısına yol açar.

**Best Practice:**
- Token'lar localStorage yerine HttpOnly cookie'de tutulmalı.
- Refresh token ve session yönetimi güvenli olmalı, CSRF koruması uygulanmalı.
- Logout işlemi tüm session/token'ları geçersiz kılmalı.
- Auth context ve route guard'lar ile yetkisiz erişim engellenmeli.

**Aksiyon:**
- [x] Tüm best practice'ler uygulanmış durumda: HttpOnly cookie, CSRF koruması, otomatik logout, route guard, rol kontrolü, session hijacking koruması mevcut. Ekstra olarak SameSite=Strict ve global logout opsiyonel olarak önerildi.

--- 