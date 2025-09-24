# KentKonut Quick Seed Restore - 20250924-173223
# Bu script seed verilerini hÄ±zlÄ±ca geri yÃ¼kler

Write-Host "=== KentKonut Quick Seed Restore ===" -ForegroundColor Green

# Seed script'ini Ã§alÄ±ÅŸtÄ±r
Write-Host "
Seed verileri yÃ¼kleniyor..." -ForegroundColor Cyan
node prisma/consolidated-seed.js

if ($LASTEXITCODE -eq 0) {
    Write-Host "
âœ… Seed verileri baÅŸarÄ±yla yÃ¼klendi!" -ForegroundColor Green
    Write-Host "VeritabanÄ± hazÄ±r! ğŸ‰" -ForegroundColor Green
} else {
    Write-Host "
âŒ Seed verileri yÃ¼klenirken hata oluÅŸtu!" -ForegroundColor Red
}
