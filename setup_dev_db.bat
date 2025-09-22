@echo off
setlocal

REM ********************************************************************
REM Bu betik, geliştirme ortamı veritabanını sıfırlar ve başlangıç
REM verilerini yükler.
REM Lütfen bu betiği 'kentkonut-full-stack' projesinin kök dizininden
REM çalıştırmayın. Herhangi bir yerden çalıştırabilirsiniz.
REM ********************************************************************

REM Proje kök dizinine git
set PROJECT_ROOT="E:\Projeler\Proje Source\kentkonut-full-stack"
set BACKEND_DIR="%PROJECT_ROOT%\kentkonut-backend"

echo.
echo --- 1. Docker Compose servislerini baslatiliyor (PostgreSQL ve Redis) ---
echo.
cd %PROJECT_ROOT%
docker-compose -f docker-compose.dev.yml up -d
if %errorlevel% neq 0 (
    echo HATA: Docker Compose servisleri baslatilamadi. Lutfen Docker'in calistigindan emin olun.
    goto :eof
)

echo.
echo --- 2. Veritabaninin baslamasi bekleniyor (15 saniye) ---
echo.
timeout /t 15 /nobreak >nul

echo.
echo --- 3. Prisma migrasyonlari sifirlaniyor ve uygulanıyor ---
echo.
cd %BACKEND_DIR%
set DATABASE_URL=postgresql://postgres:KentKonut2025@172.41.42.51:5433/kentkonutdb
echo.
echo DEBUG: Migrasyonlar dizini icerigi:
dir %BACKEND_DIR%\prisma\migrations
echo.
mkdir %BACKEND_DIR%\prisma\migrations
npx prisma migrate reset --force
echo DEBUG: migrate reset komutu cikis kodu: %errorlevel%
if %errorlevel% neq 0 (
    echo HATA: Prisma migrasyonlari basarisiz oldu. Ciktilari kontrol edin.
    goto :eof
)
set DATABASE_URL=

echo.
echo --- 4. Prisma seed islemi baslatiliyor ---
echo.
set DATABASE_URL=postgresql://postgres:KentKonut2025@172.41.42.51:5433/kentkonutdb
npx tsx prisma/seed.ts
if %errorlevel% neq 0 (
    echo HATA: Prisma seed islemi basarisiz oldu. Ciktilari kontrol edin.
    goto :eof
)
set DATABASE_URL=

echo.
echo --- 5. Islemler tamamlandi ---
echo.
echo Backend uygulamanizi yeniden baslatmayi ve konsol hatalarini kontrol etmeyi unutmayin.

endlocal
pause