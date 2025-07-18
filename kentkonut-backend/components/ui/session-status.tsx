"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useSessionValidation } from "@/hooks/useSessionValidation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Shield, ShieldAlert, ShieldCheck, RefreshCw, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface SessionStatusProps {
  variant?: "badge" | "icon" | "full"
  className?: string
  showLastValidation?: boolean
}

export function SessionStatus({ 
  variant = "icon", 
  className,
  showLastValidation = false 
}: SessionStatusProps) {
  const { status } = useSession()
  const { 
    isValidating, 
    lastValidation, 
    isSessionValid, 
    validateSession,
    isAuthenticated 
  } = useSessionValidation()

  const [timeAgo, setTimeAgo] = useState<string>("")

  // Update time ago display
  useEffect(() => {
    if (!lastValidation) return

    const updateTimeAgo = () => {
      const now = new Date()
      const diff = now.getTime() - lastValidation.getTime()
      const minutes = Math.floor(diff / 60000)
      const seconds = Math.floor((diff % 60000) / 1000)

      if (minutes > 0) {
        setTimeAgo(`${minutes}dk önce`)
      } else {
        setTimeAgo(`${seconds}s önce`)
      }
    }

    updateTimeAgo()
    const interval = setInterval(updateTimeAgo, 1000)
    return () => clearInterval(interval)
  }, [lastValidation])

  if (status === 'loading') {
    return variant === "icon" ? (
      <Shield className="h-4 w-4 text-gray-400 animate-pulse" />
    ) : null
  }

  if (!isAuthenticated) {
    return null // Don't show on public pages
  }

  const getStatusColor = () => {
    if (isValidating) return "text-blue-500"
    if (!isSessionValid) return "text-red-500"
    return "text-green-500"
  }

  const getStatusIcon = () => {
    if (isValidating) return <RefreshCw className="h-4 w-4 animate-spin" />
    if (!isSessionValid) return <ShieldAlert className="h-4 w-4" />
    return <ShieldCheck className="h-4 w-4" />
  }

  const getStatusText = () => {
    if (isValidating) return "Doğrulanıyor..."
    if (!isSessionValid) return "Oturum Geçersiz"
    return "Oturum Aktif"
  }

  const getStatusBadgeVariant = () => {
    if (isValidating) return "secondary"
    if (!isSessionValid) return "destructive"
    return "default"
  }

  if (variant === "badge") {
    return (
      <Badge 
        variant={getStatusBadgeVariant()} 
        className={cn("gap-1", className)}
      >
        {getStatusIcon()}
        {getStatusText()}
      </Badge>
    )
  }

  if (variant === "icon") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={cn("h-8 w-8 p-0", getStatusColor(), className)}
              onClick={validateSession}
              disabled={isValidating}
            >
              {getStatusIcon()}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-center">
              <p className="font-medium">{getStatusText()}</p>
              {lastValidation && showLastValidation && (
                <p className="text-xs text-muted-foreground">
                  Son kontrol: {timeAgo}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Tıklayarak yenile
              </p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  // Full variant
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn("flex items-center gap-1", getStatusColor())}>
        {getStatusIcon()}
        <span className="text-sm font-medium">{getStatusText()}</span>
      </div>
      
      {lastValidation && showLastValidation && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>{timeAgo}</span>
        </div>
      )}
      
      <Button
        variant="outline"
        size="sm"
        onClick={validateSession}
        disabled={isValidating}
        className="h-6 px-2 text-xs"
      >
        {isValidating ? "Kontrol ediliyor..." : "Yenile"}
      </Button>
    </div>
  )
}

// Minimal session indicator for header/navbar
export function SessionIndicator({ className }: { className?: string }) {
  const { isSessionValid, isValidating } = useSessionValidation()

  if (isValidating) {
    return (
      <div className={cn("h-2 w-2 rounded-full bg-blue-500 animate-pulse", className)} />
    )
  }

  return (
    <div 
      className={cn(
        "h-2 w-2 rounded-full",
        isSessionValid ? "bg-green-500" : "bg-red-500",
        className
      )} 
    />
  )
}

// Session warning banner for critical operations
export function SessionWarningBanner() {
  const { isSessionValid, validateSession, isValidating } = useSessionValidation()
  const [dismissed, setDismissed] = useState(false)

  if (isSessionValid || dismissed) {
    return null
  }

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-red-500" />
          <div>
            <h4 className="text-sm font-medium text-red-800">
              Oturum Sorunu Tespit Edildi
            </h4>
            <p className="text-sm text-red-600">
              Oturumunuz geçersiz görünüyor. İşlemleriniz başarısız olabilir.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={validateSession}
            disabled={isValidating}
            className="border-red-300 text-red-700 hover:bg-red-50"
          >
            {isValidating ? "Kontrol ediliyor..." : "Oturumu Kontrol Et"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDismissed(true)}
            className="text-red-500 hover:bg-red-50"
          >
            ×
          </Button>
        </div>
      </div>
    </div>
  )
}
