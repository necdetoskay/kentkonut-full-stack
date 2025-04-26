"use client"

import Image from "next/image"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"

interface ImageModalProps {
  src: string
  alt: string
  width?: number
  height?: number
}

export function ImageModal({ src, alt, width, height }: ImageModalProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="cursor-pointer">
          <div className="relative w-[100px] h-[56px] rounded-md overflow-hidden">
            <Image
              src={src}
              alt={alt}
              fill
              className="object-cover hover:opacity-80 transition-opacity"
            />
          </div>
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-[90vw] max-h-[90vh] p-0">
        <div className="relative w-full h-full flex items-center justify-center bg-black/50">
          <Image
            src={src}
            alt={alt}
            width={width || 1920}
            height={height || 1080}
            className="object-contain max-w-full max-h-[90vh]"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
} 