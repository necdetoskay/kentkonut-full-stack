"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, Edit, Trash, Eye } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { useContext, useState } from "react"
import { DialogContext } from "./page"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from "@/components/ui/dialog"

export type Project = {
  id: number
  title: string
  description: string
  location: string
  status: "PLANNING" | "ONGOING" | "COMPLETED"
  isActive: boolean
  coverImage: string
  createdAt: string
  updatedAt: string
  completionDate: string | null
  images: { id: number; url: string }[]
}

// Helper for formatted date
const formatDate = (dateString: string | null) => {
  if (!dateString) return "Belirtilmemiş"
  
  return format(new Date(dateString), "dd.MM.yyyy", {
    locale: tr
  })
}

// Status badge mapping
const getStatusBadge = (status: Project["status"]) => {
  const statusMap = {
    "PLANNING": { label: "Planlama", variant: "secondary" as const },
    "ONGOING": { label: "Devam Ediyor", variant: "default" as const },
    "COMPLETED": { label: "Tamamlandı", variant: "outline" as const }
  }
  
  return statusMap[status] || { label: status, variant: "secondary" as const }
}

export const columns: ColumnDef<Project>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Proje Adı
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const project = row.original
      
      return (
        <div className="flex items-center">
          {project.coverImage && (
            <div className="mr-3 h-10 w-10 overflow-hidden rounded-md">
              <img 
                src={project.coverImage}
                alt={project.title}
                className="h-full w-full object-cover"
              />
            </div>
          )}
          <div className="font-medium">{project.title}</div>
        </div>
      )
    }
  },
  {
    accessorKey: "location",
    header: "Konum",
    cell: ({ row }) => <div>{row.original.location}</div>
  },
  {
    accessorKey: "status",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Durum
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const status = getStatusBadge(row.original.status)
      
      return (
        <Badge variant={status.variant}>
          {status.label}
        </Badge>
      )
    }
  },
  {
    accessorKey: "isActive",
    header: "Yayında",
    cell: ({ row }) => {
      return (
        <Badge variant={row.original.isActive ? "default" : "secondary"}>
          {row.original.isActive ? "Aktif" : "Pasif"}
        </Badge>
      )
    }
  },
  {
    accessorKey: "completionDate",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Tamamlanma Tarihi
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => formatDate(row.original.completionDate)
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Oluşturulma Tarihi
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => formatDate(row.original.createdAt),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const project = row.original
      const { isDialogOpen, setIsDialogOpen } = useContext(DialogContext)
      const [isDeleting, setIsDeleting] = useState(false)
      const [showDeleteDialog, setShowDeleteDialog] = useState(false)
      
      const handleDelete = async () => {
        if (isDeleting) return
        setIsDeleting(true)
        try {
          const response = await fetch(`/api/projects/${project.id}`, {
            method: "DELETE",
          })
          if (!response.ok) {
            throw new Error("Proje silinirken bir hata oluştu")
          }
          toast.success("Proje başarıyla silindi")
          setShowDeleteDialog(false)
          setTimeout(() => {
            window.location.reload()
          }, 1000)
        } catch (error) {
          toast.error("Proje silinirken bir hata oluştu")
          console.error(error)
        } finally {
          setIsDeleting(false)
        }
      }
      
      // Track dialog state for this specific row
      const handleOpenDialog = (e: React.MouseEvent) => {
        e.stopPropagation() // Prevent row click
        setIsDialogOpen(true)
      }
      
      return (
        <div onClick={(e) => e.stopPropagation()} className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Menüyü aç</span>
                <Eye className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/projects/${project.id}`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Düzenle
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setShowDeleteDialog(true)}
                disabled={isDeleting}
                className="text-red-600 focus:text-red-600"
              >
                <Trash className="mr-2 h-4 w-4" />
                {isDeleting ? "Siliniyor..." : "Sil"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Projeyi Sil</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <span className="text-destructive font-bold">{project.title}</span> projesini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={isDeleting}>
                  Vazgeç
                </Button>
                <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                  {isDeleting ? "Siliniyor..." : "Sil"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )
    },
  },
] 