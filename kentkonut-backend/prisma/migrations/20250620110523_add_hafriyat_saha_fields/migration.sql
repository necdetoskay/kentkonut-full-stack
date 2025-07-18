-- AlterTable
ALTER TABLE "hafriyat_sahalar" ADD COLUMN     "aciklama" TEXT,
ADD COLUMN     "baslangicTarihi" TIMESTAMP(3),
ADD COLUMN     "tahminibitisTarihi" TIMESTAMP(3),
ADD COLUMN     "tamamlananTon" DECIMAL(65,30),
ADD COLUMN     "toplamTon" DECIMAL(65,30);
