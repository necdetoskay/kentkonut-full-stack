# Haber Modülü Geliştirme Planı

## 1. Veritabanı Modelleri ve İlişkileri

### Prisma Schema

```prisma
// Mevcut Medya ve MedyaKategori modelleri ile entegrasyon
model MedyaKategori {
  id          Int       @id @default(autoincrement())
  ad          String
  ikon        String    @default("folder")
  varsayilanMi Boolean   @default(false)
  medyalar    Medya[]
  
  @@map("medya_kategorileri")
}

model Medya {
  id              Int               @id @default(autoincrement())
  dosyaAdi        String
  orijinalAd      String
  mimeType        String
  boyut           Int
  yol             String
  url             String
  altMetin        String?
  aciklama        String?
  kucukOnizleme   String?
  ortaOnizleme    String?
  buyukOnizleme   String?
  kategoriId      Int
  kategori        MedyaKategori     @relation(fields: [kategoriId], references: [id], onDelete: Cascade)
  haberler        Haber[]           @relation("AnaGorsel") // Haber ana görseli ilişkisi
  haberGaleriOgeleri HaberGaleriOge[] // Haber galerisi ilişkisi
  olusturulmaTarihi DateTime        @default(now())
  guncellenmeTarihi DateTime        @updatedAt

  @@map("medyalar")
}

model Kategori {
  id                Int       @id @default(autoincrement())
  ad                String
  slug              String    @unique
  aciklama          String?
  gorselUrl         String?
  sira              Int       @default(0)
  aktifMi           Boolean   @default(true)
  olusturulmaTarihi DateTime  @default(now())
  guncellenmeTarihi DateTime  @updatedAt
  haberler          Haber[]

  @@map("kategoriler")
}

model Haber {
  id                Int               @id @default(autoincrement())
  baslik            String
  slug              String            @unique
  ozet              String?
  icerik            String
  // Medya galerisi entegrasyonu - Ana görsel
  medyaId           Int?
  medya             Medya?            @relation("AnaGorsel", fields: [medyaId], references: [id])
  goruntulenme      Int               @default(0)
  okumaSuresi       Int               @default(3)
  yayindaMi         Boolean           @default(false)
  yayinlanmaTarihi  DateTime?
  kategoriId        Int
  kategori          Kategori          @relation(fields: [kategoriId], references: [id])
  yazarId           Int
  yazar             Kullanici         @relation(fields: [yazarId], references: [id])
  etiketler         HaberEtiket[]
  ilgiliHaberler    HaberIliski[]     @relation("IlgiliKaynak")
  ilgiliOlanHaberler HaberIliski[]    @relation("IlgiliHedef")
  yorumlar          Yorum[]
  // Medya galerisi entegrasyonu - Galeri
  galeriOgeleri     HaberGaleriOge[]
  olusturulmaTarihi DateTime          @default(now())
  guncellenmeTarihi DateTime          @updatedAt

  @@map("haberler")
}

// Haber-Galeri ilişki tablosu
model HaberGaleriOge {
  id                Int         @id @default(autoincrement())
  haberId           Int
  haber             Haber       @relation(fields: [haberId], references: [id], onDelete: Cascade)
  medyaId           Int
  medya             Medya       @relation(fields: [medyaId], references: [id], onDelete: Cascade)
  sira              Int         @default(0)
  olusturulmaTarihi DateTime    @default(now())
  guncellenmeTarihi DateTime    @updatedAt
  
  @@unique([haberId, medyaId])
  @@map("haber_galeri_ogeleri")
}

model HaberEtiket {
  haberId           Int
  etiketId          Int
  haber             Haber       @relation(fields: [haberId], references: [id])
  etiket            Etiket      @relation(fields: [etiketId], references: [id])
  
  @@id([haberId, etiketId])
  @@map("haber_etiketler")
}

model Etiket {
  id                Int         @id @default(autoincrement())
  ad                String      @unique
  slug              String      @unique
  haberler          HaberEtiket[]
  olusturulmaTarihi DateTime    @default(now())
  guncellenmeTarihi DateTime    @updatedAt

  @@map("etiketler")
}

model HaberIliski {
  id                Int     @id @default(autoincrement())
  haberId           Int
  ilgiliHaberId     Int
  haber             Haber   @relation("IlgiliKaynak", fields: [haberId], references: [id])
  ilgiliHaber       Haber   @relation("IlgiliHedef", fields: [ilgiliHaberId], references: [id])
  
  @@unique([haberId, ilgiliHaberId])
  @@map("haber_iliskileri")
}

model Yorum {
  id                Int         @id @default(autoincrement())
  icerik            String
  onaylandiMi       Boolean     @default(false)
  haberId           Int
  haber             Haber       @relation(fields: [haberId], references: [id])
  kullaniciId       Int
  kullanici         Kullanici   @relation(fields: [kullaniciId], references: [id])
  olusturulmaTarihi DateTime    @default(now())
  guncellenmeTarihi DateTime    @updatedAt

  @@map("yorumlar")
}

model Kullanici {
  id                Int         @id @default(autoincrement())
  ad                String
  email             String      @unique
  sifre             String
  rol               Rol         @default(KULLANICI)
  haberler          Haber[]
  yorumlar          Yorum[]
  olusturulmaTarihi DateTime    @default(now())
  guncellenmeTarihi DateTime    @updatedAt

  @@map("kullanicilar")
}

enum Rol {
  KULLANICI
  EDITOR
  ADMIN
}

