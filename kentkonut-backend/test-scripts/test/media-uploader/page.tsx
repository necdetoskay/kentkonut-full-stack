"use client"

"use client"

import { useState } from "react"
import KentWebMediaUploader from "@/components/ui/KentWebMediaUploader"

export default function MediaUploaderTestPage() {
  const [hafriyatImage, setHafriyatImage] = useState("")
  const [projeImage, setProjeImage] = useState("")
  const [galleryImages, setGalleryImages] = useState<string[]>([])

  return (
    <div className="container mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold mb-8">KentWebMediaUploader Test</h1>
      
      {/* Gallery Test - clearAfterUpload: true */}
      <div className="border rounded-lg p-6 bg-blue-50">
        <h2 className="text-xl font-semibold mb-4">🖼️ Galeri Test (clearAfterUpload: true)</h2>
        <p className="text-sm text-gray-600 mb-4">Her yüklemeden sonra uploader resetlenir. Galeri senaryoları için ideal.</p>
        <KentWebMediaUploader
          customFolder="uploads/media/gallery-test"
          width={400}
          height={300}
          enableCropping={true}
          clearAfterUpload={true}
          onImageUploaded={(url) => {
            setGalleryImages(prev => [...prev, url])
            console.log("Gallery image uploaded:", url)
          }}
          uploadedText="Resim galeriye eklendi!"
          browseText="Galeri Resmi Yükleyin"
        />
        {galleryImages.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-semibold mb-2">Galeri ({galleryImages.length} resim):</p>
            <div className="grid grid-cols-4 gap-2">
              {galleryImages.map((url, index) => (
                <div key={index} className="relative">
                  <img 
                    src={url} 
                    alt={`Gallery ${index + 1}`}
                    className="w-full h-20 object-cover rounded border"
                  />
                  <button
                    onClick={() => setGalleryImages(prev => prev.filter((_, i) => i !== index))}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Hafriyat Test */}
      <div className="border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Hafriyat Medya Yükleyici</h2>
        <KentWebMediaUploader
          customFolder="uploads/media/hafriyat"
          width={800}
          height={450}
          enableCropping={true}
          onImageUploaded={(url) => {
            setHafriyatImage(url)
            console.log("Hafriyat image uploaded:", url)
          }}
          onImageDeleted={() => {
            setHafriyatImage("")
            console.log("Hafriyat image deleted")
          }}
        />
        {hafriyatImage && (
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-2">Yüklenen URL:</p>
            <p className="text-xs bg-gray-100 p-2 rounded font-mono">{hafriyatImage}</p>
          </div>
        )}
      </div>

      {/* Proje Test - Kırpma Kapalı */}
      <div className="border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Proje Medya Yükleyici (Kırpma Kapalı)</h2>
        <KentWebMediaUploader
          customFolder="uploads/media/proje"
          width={600}
          height={400}
          enableCropping={false}
          onImageUploaded={(url) => {
            setProjeImage(url)
            console.log("Proje image uploaded:", url)
          }}
        />
        {projeImage && (
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-2">Yüklenen URL:</p>
            <p className="text-xs bg-gray-100 p-2 rounded font-mono">{projeImage}</p>
          </div>
        )}
      </div>

      {/* Debug Info */}
      <div className="border rounded-lg p-6 bg-gray-50">
        <h2 className="text-xl font-semibold mb-4">Debug Bilgileri</h2>
        <div className="space-y-2 text-sm">
          <p><strong>Hafriyat:</strong> {hafriyatImage || "Henüz yüklenmedi"}</p>
          <p><strong>Proje:</strong> {projeImage || "Henüz yüklenmedi"}</p>
        </div>
      </div>
    </div>
  )
}
