-- Manual update for hierarchical gallery structure
-- This script adds new columns to existing project_gallery_items table

-- Add new columns to project_gallery_items table
ALTER TABLE "project_gallery_items" 
ADD COLUMN IF NOT EXISTS "title" TEXT,
ADD COLUMN IF NOT EXISTS "description" TEXT,
ADD COLUMN IF NOT EXISTS "parent_id" INTEGER,
ADD COLUMN IF NOT EXISTS "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS "is_folder" BOOLEAN NOT NULL DEFAULT false;

-- Make mediaId nullable for folders
ALTER TABLE "project_gallery_items" 
ALTER COLUMN "media_id" DROP NOT NULL;

-- Add foreign key constraint for parent-child relationship
ALTER TABLE "project_gallery_items" 
ADD CONSTRAINT IF NOT EXISTS "project_gallery_items_parent_id_fkey" 
FOREIGN KEY ("parent_id") REFERENCES "project_gallery_items"("id") ON DELETE SET NULL;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS "project_gallery_items_parent_id_idx" ON "project_gallery_items"("parent_id");
CREATE INDEX IF NOT EXISTS "project_gallery_items_is_folder_idx" ON "project_gallery_items"("is_folder");
CREATE INDEX IF NOT EXISTS "project_gallery_items_title_idx" ON "project_gallery_items"("title");

-- Update existing records to have default title
UPDATE "project_gallery_items" 
SET "title" = 'Untitled Gallery Item' 
WHERE "title" IS NULL;

-- Make title NOT NULL after setting default values
ALTER TABLE "project_gallery_items" 
ALTER COLUMN "title" SET NOT NULL;
