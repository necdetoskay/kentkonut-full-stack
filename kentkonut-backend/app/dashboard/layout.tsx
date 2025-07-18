"use client";

import { UserNav } from "../components/layout/UserNav"
import { ModeToggle } from "../components/layout/ModeToggle"
import { SideNav } from "../components/layout/SideNav"
import { Toaster } from "@/components/ui/sonner"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { LoadingSkeleton } from "@/components/ui/loading"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()

  // Authentication guard
  useEffect(() => {
    if (status === "loading") return // Still loading

    if (status === "unauthenticated") {
      console.log("Dashboard layout: User not authenticated, redirecting to login")
      router.push("/auth/login")
      return
    }
  }, [status, router])

  // Show loading state while checking authentication
  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Oturum kontrol ediliyor...</p>
        </div>
      </div>
    )
  }

  // Don't render anything if not authenticated
  if (status === "unauthenticated") {
    return null
  }
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="hidden border-r bg-background md:block md:w-64">
        <div className="flex h-16 items-center border-b px-6">
          <h1 className="text-lg font-bold">Kent Konut</h1>
        </div>
        <div className="p-6">
          <SideNav />
        </div>
      </div>
      {/* Main Content */}
      <div className="flex flex-1 flex-col" style={{ marginLeft: '20px' }}>
        <header className="sticky top-0 z-40 border-b bg-background">
          <div className="flex h-16 items-center justify-between py-4 px-6">
            <h1 className="text-xl font-bold md:hidden">Kent Konut</h1>
            <div className="flex items-center space-x-4">
              <ModeToggle />
              <UserNav />
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto" style={{ padding: '24px 24px 24px 0' }}>
          {children}
        </main>
        <Toaster />
      </div>
    </div>
  )
} 