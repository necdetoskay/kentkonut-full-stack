@echo off
echo PRODUCTION MODU AKTIF EDILIYOR...

REM IP adresini doğrudan ayarla
set PROD_IP=172.41.42.51

REM Doğrudan production modunu aktif et
echo // Bu dosya production modunu aktif eder > "kentkonut-backend\config\production-mode.ts"
echo // Uygulamanın production modunda çalışmasını sağlar >> "kentkonut-backend\config\production-mode.ts"
echo. >> "kentkonut-backend\config\production-mode.ts"
echo // Production modu aktif >> "kentkonut-backend\config\production-mode.ts"
echo export const IS_PRODUCTION = true; >> "kentkonut-backend\config\production-mode.ts"

REM Ortam değişkenini ayarla
set NODE_ENV=production
echo NODE_ENV=production > "kentkonut-frontend\.env"
echo NODE_ENV=production > "kentkonut-backend\.env"

echo PRODUCTION MODU AKTIF EDILDI!
echo.
echo Kullanim Kilavuzu:
echo * Development modu: .\dev-mode.bat
echo * Production modu: .\prod-mode.bat
echo.
echo Erisim Bilgileri:
echo * Frontend: http://%PROD_IP%:3020
echo * Backend: http://%PROD_IP%:3021
echo * Veritabani: %PROD_IP%:5433
pause