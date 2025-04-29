"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Users, Image, BarChart, Building, Images, FolderUp } from "lucide-react"
import { Separator } from "@/components/ui/separator"

// Group the nav items by category
const navGroups = [
  {
    title: "Genel",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        title: "Kullanıcılar",
        href: "/dashboard/users",
        icon: Users,
      },
    ]
  },
  {
    title: "İçerik Yönetimi",
    items: [
      {
        title: "Banner Yönetimi",
        href: "/dashboard/banners",
        icon: Image,
      },
      // Banner İstatistikleri geçici olarak gizlendi
      // {
      //   title: "Banner İstatistikleri",
      //   href: "/dashboard/banner-stats",
      //   icon: BarChart,
      // },
      {
        title: "Projeler",
        href: "/dashboard/projects",
        icon: Building,
      },
    ]
  },
  {
    title: "Medya Yönetimi",
    items: [
      {
        title: "Medya Kütüphanesi",
        href: "/dashboard/media-library",
        icon: Images,
      },
      // Klasöre Yükleme menüsü kaldırıldı
    ]
  }
]

export function SideNav() {
  const pathname = usePathname()

  return (
    <nav className="space-y-6">
      {navGroups.map((group, index) => (
        <div key={group.title} className="space-y-3">
          <div className="text-xs font-semibold text-muted-foreground tracking-wider uppercase px-2">
            {group.title}
          </div>
          <div className="grid items-start gap-2">
            {group.items.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
              
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className="w-full justify-start gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    {item.title}
                  </Button>
                </Link>
              )
            })}
          </div>
          {index < navGroups.length - 1 && <Separator className="my-2" />}
        </div>
      ))}
    </nav>
  )
} 