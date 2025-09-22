@echo off
echo DEVELOPMENT MODU AKTIF EDILIYOR...

REM Doğrudan development modunu aktif et
echo // Bu dosya development modunu aktif eder > "kentkonut-backend\config\production-mode.ts"
echo // Uygulamanın development modunda çalışmasını sağlar >> "kentkonut-backend\config\production-mode.ts"
echo. >> "kentkonut-backend\config\production-mode.ts"
echo // Development modu aktif >> "kentkonut-backend\config\production-mode.ts"
echo export const IS_PRODUCTION = false; >> "kentkonut-backend\config\production-mode.ts"

REM Ortam değişkenini ayarla
set NODE_ENV=development
echo NODE_ENV=development > "kentkonut-frontend\.env"
echo NODE_ENV=development > "kentkonut-backend\.env"

echo DEVELOPMENT MODU AKTIF EDILDI!
echo.
echo Kullanim Kilavuzu:
echo * Development modu: .\dev-mode.bat
echo * Production modu: .\prod-mode.bat
echo.
echo Erisim Bilgileri:
echo * Frontend: http://localhost:3020
echo * Backend: http://localhost:3021
echo * Veritabani: 172.41.42.51:5433
pause