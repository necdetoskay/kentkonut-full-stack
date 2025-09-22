 .\dev-mode.bat
 .\prod-mode.bat

npm run snapshot
npm run seed

export-data.ts dosyasını güncelle 
npx tsx scripts/export-data.ts çalıştırma

Sonuç: prisma/seed-data.json

geri yükleme: npx tsx scripts/seed-from-file.ts