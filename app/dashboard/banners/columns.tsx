"use client"

import { useState, useContext, useEffect } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, ArrowUpDown, Pencil, Trash2, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { BannerGroupForm } from "./banner-group-form"
import { DialogContext } from "./page"

export type BannerGroup = {
  id: string
  name: string
  active: boolean
  playMode: "MANUAL" | "AUTO"
  animation: "FADE" | "SLIDE" | "ZOOM"
  duration: number
  width: number
  height: number
  createdAt: string
  updatedAt: string
}

export const columns: ColumnDef<BannerGroup>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Tümünü seç"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Satırı seç"
        onClick={(e) => e.stopPropagation()}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Banner Grup Adı
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "active",
    header: "Durum",
    cell: ({ row }) => {
      const active = row.getValue("active") as boolean
      return (
        <Badge variant={active ? "default" : "secondary"}>
          {active ? "Aktif" : "Pasif"}
        </Badge>
      )
    },
  },
  {
    accessorKey: "playMode",
    header: "Oynatma Modu",
    cell: ({ row }) => {
      const playMode = row.getValue("playMode") as string
      return playMode === "MANUAL" ? "Manuel" : "Otomatik"
    },
  },
  {
    accessorKey: "animation",
    header: "Animasyon Tipi",
    cell: ({ row }) => {
      const animation = row.getValue("animation") as string
      switch (animation) {
        case "FADE":
          return "Solma"
        case "SLIDE":
          return "Kayma"
        case "ZOOM":
          return "Yakınlaştırma"
        default:
          return animation
      }
    },
  },
  {
    accessorKey: "duration",
    header: "Görüntülenme Süresi",
    cell: ({ row }) => {
      const duration = row.getValue("duration") as number
      return `${duration / 1000} sn`
    },
  },
  {
    accessorKey: "width",
    header: "Genişlik",
    cell: ({ row }) => {
      const width = row.getValue("width") as number
      return `${width}px`
    },
  },
  {
    accessorKey: "height",
    header: "Yükseklik",
    cell: ({ row }) => {
      const height = row.getValue("height") as number
      return `${height}px`
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const bannerGroup = row.original
      const router = useRouter()
      const [editOpen, setEditOpen] = useState(false)
      const [deleteOpen, setDeleteOpen] = useState(false)
      const { setIsDialogOpen } = useContext(DialogContext)
      const [isEditFormDirty, setIsEditFormDirty] = useState(false)

      useEffect(() => {
        setIsDialogOpen(editOpen || deleteOpen)
      }, [editOpen, deleteOpen, setIsDialogOpen])

      const handleDelete = async () => {
        try {
          const response = await fetch(`/api/banner-groups/${bannerGroup.id}`, {
            method: "DELETE",
          })

          if (!response.ok) {
            throw new Error("Banner grubu silinirken bir hata oluştu")
          }

          toast.success("Banner grubu başarıyla silindi")
          router.refresh()
          setDeleteOpen(false)
        } catch (error) {
          console.error("Silme hatası:", error)
          toast.error("Banner grubu silinirken bir hata oluştu")
        }
      }

      const handleDetail = () => {
        router.push(`/dashboard/banners/${bannerGroup.id}`)
      }

      const handleEditOpenChange = (openState: boolean) => {
        if (!openState) {
          if (isEditFormDirty) {
            if (confirm("Düzenleme formunu kapatmak istediğinize emin misiniz? Kaydedilmemiş değişiklikler kaybolacaktır.")) {
              setEditOpen(false);
              setIsEditFormDirty(false);
            }
          } else {
            setEditOpen(false);
          }
        } else {
          setEditOpen(openState);
          setIsEditFormDirty(false);
        }
      };

      const handleEditFormChange = (isDirty: boolean) => {
        setIsEditFormDirty(isDirty);
      };

      const handleDeleteOpenChange = (openState: boolean) => {
        setDeleteOpen(openState);
      };

      return (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="h-8 w-8 p-0"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="sr-only">Menüyü aç</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>İşlemler</DropdownMenuLabel>
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation()
                setEditOpen(true)
              }}>
                <Pencil className="mr-2 h-4 w-4" />
                Düzenle
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation()
                setDeleteOpen(true)
              }} className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Sil
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Dialog open={editOpen} onOpenChange={handleEditOpenChange}>
            <DialogContent 
              className="sm:max-w-[600px]"
            >
              <DialogHeader>
                <DialogTitle>Banner Grubunu Düzenle</DialogTitle>
                <DialogDescription>
                  Banner grubunun özelliklerini güncelleyin
                </DialogDescription>
              </DialogHeader>
              <BannerGroupForm
                bannerGroup={{
                  ...bannerGroup,
                  status: bannerGroup.active ? "active" : "passive",
                  animationType: bannerGroup.animation,
                  displayDuration: bannerGroup.duration / 1000,
                  transitionDuration: 0.5,
                }}
                onSuccess={() => {
                  setEditOpen(false)
                  setIsEditFormDirty(false)
                  router.refresh()
                }}
                onFormChange={handleEditFormChange}
              />
            </DialogContent>
          </Dialog>

          <Dialog open={deleteOpen} onOpenChange={handleDeleteOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Banner Grubunu Sil</DialogTitle>
                <DialogDescription>
                  Bu banner grubunu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-end gap-4">
                <Button
                  variant="outline"
                  onClick={() => setDeleteOpen(false)}
                >
                  İptal
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                >
                  Sil
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </>
      )
    },
  },
] 