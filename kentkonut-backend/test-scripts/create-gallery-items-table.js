
const { Client } = require('pg');

const config = {
  host: '172.41.42.51',
  port: 5433,
  user: 'postgres',
  password: 'KentKonut2025',
  database: 'kentkonutdb'
};

const createTableQuery = `
  CREATE TABLE "project_gallery_items" (
    "id" SERIAL NOT NULL,
    "galleryId" INTEGER NOT NULL,
    "mediaId" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_gallery_items_pkey" PRIMARY KEY ("id")
  );

  CREATE INDEX "project_gallery_items_galleryId_idx" ON "project_gallery_items"("galleryId");
  CREATE INDEX "project_gallery_items_mediaId_idx" ON "project_gallery_items"("mediaId");

  ALTER TABLE "project_gallery_items" ADD CONSTRAINT "project_gallery_items_galleryId_fkey" FOREIGN KEY ("galleryId") REFERENCES "project_galleries"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  ALTER TABLE "project_gallery_items" ADD CONSTRAINT "project_gallery_items_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "media"("id") ON DELETE CASCADE ON UPDATE CASCADE;
`;

async function main() {
  const client = new Client(config);
  try {
    await client.connect();
    console.log('Successfully connected to the database!');
    
    console.log('Creating "project_gallery_items" table...');
    await client.query(createTableQuery);
    console.log('Table "project_gallery_items" created successfully.');
    
    await client.end();
  } catch (error) {
    console.error('Error creating table:', error);
  }
}

main();
