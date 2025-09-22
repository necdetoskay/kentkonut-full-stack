"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LoadingLink } from "@/components/ui/loading-link"
import {
  LayoutDashboard,
  Users,
  Settings,
  Image,
  FileImage,
  Newspaper,
  FolderOpen,
  ChevronDown,
  ChevronRight,
  Building2,
  FileText,
  UserCheck,
  Target,
  ExternalLink,
  MapPin,
  Mountain,
  TrendingUp,
  FileStack,
  Images,
  MessageCircle,
  Menu,
  BarChart3,
  Briefcase,
  GitBranch,
  Zap // Yeni ikon import edildi
} from "lucide-react"

interface NavItem {
  title: string
  href?: string
  icon?: any
  children?: NavItem[]
}

interface NavGroup {
  title: string
  items: NavItem[]
}

const sidebarNavGroups: NavGroup[] = [
  {
    title: "GENEL BAKIŞ",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        title: "Analytics",
        href: "/dashboard/analytics",
        icon: BarChart3,
      },
    ],
  },
  {
    title: "KURUMSAL YÖNETİM",
    items: [
      {
        title: "Öne Çıkanlar",
        href: "/dashboard/kurumsal/highlights",
        icon: FileStack,
      },
      {
        title: "Yönetim Kadrosu",
        href: "/dashboard/kurumsal/yoneticiler",
        icon: UserCheck,
      },
      {
        title: "Birimlerimiz",
        href: "/dashboard/kurumsal/birimler",
        icon: FolderOpen,
      },
      {
        title: "Kurumsal Yapı",
        href: "/dashboard/kurumsal/kurumsal-yapi",
        icon: Building2,
      },
      {
        title: "Kurumsal İçerik",
        icon: Target,
        children: [
          {
            title: "Hakkımızda",
            href: "/dashboard/kurumsal/hakkimizda",
          },
          {
            title: "Vizyon & Misyon",
            href: "/dashboard/kurumsal/visyon-misyon",
          },
          {
            title: "Strateji & Hedefler",
            href: "/dashboard/kurumsal/icerik/strategy-goals",
          },
        ],
      },
    ],
  },
  {
    title: "PROJE & HİZMETLER",
    items: [
      {
        title: "Projeler",
        href: "/dashboard/projects",
        icon: Building2,
      },
      {
        title: "Hizmetlerimiz",
        href: "/dashboard/hizmetlerimiz",
        icon: Briefcase,
      },
      {
        title: "Hafriyat Yönetimi",
        icon: Mountain,
        children: [
          {
            title: "Hafriyat Dashboard",
            href: "/dashboard/hafriyat",
          },
          {
            title: "Hafriyat Sahaları",
            href: "/dashboard/hafriyat/sahalar",
          },
          {
            title: "Bölge Yönetimi",
            href: "/dashboard/hafriyat/bolgeler",
          },
          {
            title: "İstatistikler",
            href: "/dashboard/hafriyat/istatistikler",
          },
          {
            title: "Belge Kategorileri",
            href: "/dashboard/hafriyat/belge-kategorileri",
          },
          {
            title: "Resim Kategorileri",
            href: "/dashboard/hafriyat/resim-kategorileri",
          },
        ],
      },
    ],
  },
  {
    title: "İÇERİK & MEDYA",
    items: [
      {
        title: "Sayfa Yönetimi",
        href: "/dashboard/pages",
        icon: FileText,
      },
      {
        title: "Haber Yönetimi",
        icon: Newspaper,
        children: [
          {
            title: "Haberler",
            href: "/dashboard/news",
          },
          {
            title: "Kategoriler",
            href: "/dashboard/news/categories",
          },
        ],
      },
      {
        title: "Banner Yönetimi",
        href: "/dashboard/banner-groups",
        icon: Image,
      },
      {
        title: "NavMenu Resim",
        href: "/dashboard/sayfa-arka-plan",
        icon: FileImage,
      },
      {
        title: "Hızlı Erişim Yönetimi",
        href: "/dashboard/hizli-erisim",
        icon: Zap,
      },
      {
        title: "Medya Kütüphanesi",
        href: "/dashboard/media",
        icon: Images,
      },
    ],
  },
  {
    title: "İLETİŞİM",
    items: [
      {
        title: "İletişim Bilgileri",
        href: "/dashboard/contact-info",
        icon: MapPin,
      },
      {
        title: "Geri Bildirimler",
        href: "/dashboard/feedback",
        icon: MessageCircle,
      },
    ],
  },
  {
    title: "SİSTEM YÖNETİMİ",
    items: [
      {
        title: "Menu Yönetimi",
        href: "/dashboard/menu-management",
        icon: Menu,
      },
      {
        title: "Kullanıcı Yönetimi",
        href: "/dashboard/users",
        icon: Users,
      },
      {
        title: "Sistem Ayarları",
        href: "/dashboard/settings",
        icon: Settings,
      },
      {
        title: "Footer Yönetimi",
        href: "/dashboard/footer",
        icon: ExternalLink, // Using a generic icon for now
      },
      {
        title: "Versiyon Yönetimi",
        href: "/dashboard/system/versions",
        icon: GitBranch,
      },
      {
        title: "Loglar",
        href: "/dashboard/logs",
        icon: FileText,
      },
    ],
  },
]

export function SideNav() {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<string[]>(() => {
    // Auto-expand groups that contain the current path
    const expanded: string[] = []
    sidebarNavGroups.forEach((group) => {
      group.items.forEach((item) => {
        if (item.children) {
          const hasActiveChild = item.children.some(child =>
            child.href && (pathname === child.href || pathname.startsWith(`${child.href}/`))
          )
          if (hasActiveChild) {
            expanded.push(item.title)
          }
        }
      })
    })
    return expanded
  })

  const toggleExpanded = (itemTitle: string) => {
    setExpandedItems(prev =>
      prev.includes(itemTitle)
        ? prev.filter(title => title !== itemTitle)
        : [...prev, itemTitle]
    )
  }

  const isItemActive = (item: NavItem): boolean => {
    if (item.href) {
      return pathname === item.href || pathname.startsWith(`${item.href}/`)
    }
    if (item.children) {
      return item.children.some(child =>
        child.href && (pathname === child.href || pathname.startsWith(`${child.href}/`))
      )
    }
    return false
  }

  const renderNavItem = (item: NavItem, isChild = false) => {
    const Icon = item.icon
    const isActive = isItemActive(item)
    const isExpanded = expandedItems.includes(item.title)
    const hasChildren = item.children && item.children.length > 0

    if (hasChildren) {
      return (
        <div key={item.title}>
          <Button
            variant={isActive ? "secondary" : "ghost"}
            className={cn(
              "w-full justify-start gap-2",
              isChild && "ml-4 text-sm"
            )}
            onClick={() => toggleExpanded(item.title)}
          >
            {Icon && <Icon className="h-4 w-4" />}
            <span className="flex-1 text-left">{item.title}</span>
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>          {isExpanded && item.children && (
            <div className="ml-2 mt-1 space-y-1">
              {item.children.map((child) => renderNavItem(child, true))}
            </div>
          )}
        </div>
      )
    }

    if (item.href) {
      return (
        <LoadingLink key={item.href} href={item.href}>
          <Button
            variant={isActive ? "secondary" : "ghost"}
            className={cn(
              "w-full justify-start gap-2",
              isChild && "ml-4 text-sm"
            )}
          >
            {Icon && <Icon className="h-4 w-4" />}
            {item.title}
          </Button>
        </LoadingLink>
      )
    }

    return null
  }

  return (
    <nav className="space-y-6">
      {sidebarNavGroups.map((group) => (
        <div key={group.title}>
          <h3 className="mb-2 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {group.title}
          </h3>
          <div className="space-y-1">
            {group.items.map((item) => renderNavItem(item))}
          </div>
        </div>
      ))}
    </nav>
  )
}
