# Windows PowerShell için Prisma Client yenileme komutları
# Bu komutları backend dizininde çalıştırın

# 1. Mevcut Prisma client'ı temizle
Remove-Item -Recurse -Force node_modules\.prisma -ErrorAction SilentlyContinue

# 2. Prisma client'ı yeniden generate et
npx prisma generate

# 3. Veritabanı şemasını kontrol et
npx prisma db pull

# 4. Backend'i yeniden başlat
npm run dev
