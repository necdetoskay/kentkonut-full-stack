 .\dev-mode.bat
 .\prod-mode.bat

npm run snapshot
npm run seed

node backup-seed.js

node restore-seed.js seed-backup-2025-09-24T14-32-13-734Z.json


