import { Metadata } from "next"
import { MediaGallery } from "./components/media-gallery"

export const metadata: Metadata = {
  title: "Medya Galerisi",
  description: "Medya dosyalarını yönetin",
}

export default function MediaPage() {
  return (
    <div className="h-full flex-1 flex flex-col space-y-8 p-8">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Medya Galerisi</h2>
          <p className="text-muted-foreground">
            Tüm medya dosyalarınızı buradan yönetebilirsiniz.
          </p>
        </div>
      </div>
      <MediaGallery />
    </div>
  )
} 