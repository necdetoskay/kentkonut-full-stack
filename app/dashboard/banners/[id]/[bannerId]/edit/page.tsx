"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

// This is a redirect page that sends users from the old edit URL to the detail page
export default function BannerEditRedirect({ params }: { params: { id: string, bannerId: string } }) {
  const router = useRouter()

  useEffect(() => {
    // Redirect to the banner group detail page
    router.push(`/dashboard/banners/${params.id}?editBanner=${params.bannerId}`)
  }, [router, params.id, params.bannerId])

  return (
    <div className="container mx-auto py-10">
      <p className="text-center animate-pulse">Yönlendiriliyor...</p>
    </div>
  )
} 