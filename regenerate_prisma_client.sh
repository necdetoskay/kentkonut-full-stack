# Prisma Client'ı yeniden generate etmek için komutlar
# Bu komutları backend dizininde çalıştırın

# 1. Mevcut Prisma client'ı temizle
rm -rf node_modules/.prisma

# 2. Prisma client'ı yeniden generate et
npx prisma generate

# 3. Veritabanı şemasını kontrol et
npx prisma db pull

# 4. Backend'i yeniden başlat
npm run dev
