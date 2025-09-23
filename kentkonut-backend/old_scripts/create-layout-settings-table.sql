-- Create CorporateLayoutSettings table manually
-- Run this if the table doesn't exist

-- Drop table if exists (optional)
-- DROP TABLE IF EXISTS "corporate_layout_settings";

-- Create table
CREATE TABLE IF NOT EXISTS "corporate_layout_settings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL UNIQUE,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL DEFAULT 'string',
    "category" TEXT NOT NULL DEFAULT 'layout',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "corporate_layout_settings_pkey" PRIMARY KEY ("id")
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "corporate_layout_settings_key_idx" ON "corporate_layout_settings"("key");
CREATE INDEX IF NOT EXISTS "corporate_layout_settings_category_idx" ON "corporate_layout_settings"("category");

-- Insert default settings
INSERT INTO "corporate_layout_settings" ("id", "key", "value", "description", "type", "category", "createdAt", "updatedAt") VALUES
('clayout001', 'cards_per_row', '3', 'Bir satırda kaç kart gösterileceği (1-6 arası)', 'number', 'layout', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('clayout002', 'max_cards_per_page', '12', 'Bir sayfada maksimum kaç kart gösterileceği', 'number', 'layout', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('clayout003', 'card_spacing', 'medium', 'Kartlar arası boşluk (small, medium, large)', 'select', 'layout', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('clayout004', 'responsive_breakpoints', '{"mobile": 1, "tablet": 2, "desktop": 3}', 'Responsive breakpoint ayarları', 'json', 'layout', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('clayout005', 'show_pagination', 'true', 'Sayfalama gösterilsin mi', 'boolean', 'layout', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('clayout006', 'cards_animation', 'fade', 'Kart animasyon tipi (none, fade, slide)', 'select', 'layout', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("key") DO NOTHING;

-- Verify data
SELECT * FROM "corporate_layout_settings" ORDER BY "key";
