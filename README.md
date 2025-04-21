# Kent Konut Platform

Bu proje, Kent Konut için geliştirilmiş web platformudur. İki ana bileşenden oluşur:

1. Kent Konut Web (Ana Site)
2. Kent Konut Admin Panel

## Teknolojiler

- Frontend: React + TypeScript + Vite
- Backend: Node.js + Express
- Veritabanı: PostgreSQL
- Konteynerizasyon: Docker

## Kurulum

Projeyi çalıştırmak için Docker ve Docker Compose gereklidir.

```bash
# Projeyi klonlayın
git clone https://github.com/your-username/kentkonut-platform.git
cd kentkonut-platform

# Docker container'larını başlatın
docker-compose up -d
```

## Servisler

Proje aşağıdaki servisleri içerir:

1. Ana Site: http://localhost:3000
2. Admin Panel: http://localhost:8080
3. Admin API: http://localhost:5000
4. PostgreSQL: localhost:5433
5. pgAdmin: http://localhost:5050
   - Email: admin@kentwebadmin.com
   - Şifre: admin

## Geliştirme

Her iki proje de (web ve admin panel) kendi klasörlerinde bağımsız olarak geliştirilebilir:

```bash
# Ana site için
cd kentkonut-web
npm install
npm run dev

# Admin panel için
cd kentwebadminpanel
npm install
npm run dev
```

## Lisans

Bu proje özel lisans altında geliştirilmiştir. Tüm hakları saklıdır. 