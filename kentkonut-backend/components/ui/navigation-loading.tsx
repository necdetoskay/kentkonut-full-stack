"use client"

import { useNavigationLoading } from "@/contexts/NavigationLoadingContext"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useEffect } from "react"

interface NavigationLoadingProps {
  variant?: "overlay" | "bar" | "minimal"
  className?: string
}

export function NavigationLoading({ variant = "bar", className }: NavigationLoadingProps) {
  const { isLoading, progress } = useNavigationLoading()

  // Prevent body scroll when loading overlay is active
  useEffect(() => {
    if (variant === "overlay" && isLoading) {
      document.body.classList.add('loading-active')
      return () => {
        document.body.classList.remove('loading-active')
      }
    }
  }, [isLoading, variant])

  if (!isLoading) return null

  if (variant === "overlay") {
    return (
      <div
        className={cn(
          "navigation-loading-overlay loading-overlay-enter",
          "fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center",
          className
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="loading-title"
        aria-describedby="loading-description"
      >
        {/* Prevent interaction with background */}
        <div
          className="absolute inset-0"
          onClick={(e) => e.preventDefault()}
          onKeyDown={(e) => e.preventDefault()}
        />

        {/* Loading content */}
        <div className="loading-content-enter relative bg-white dark:bg-gray-800 rounded-xl p-8 shadow-2xl border border-gray-200 dark:border-gray-700 max-w-sm w-full mx-4">
          <div className="text-center">
            {/* Loading spinner */}
            <div className="mb-6">
              <div className="relative">
                <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto" />
                <div className="absolute inset-0 rounded-full border-2 border-blue-100 dark:border-blue-900"></div>
              </div>
            </div>

            {/* Loading text */}
            <h3
              id="loading-title"
              className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2"
            >
              Sayfa Yükleniyor
            </h3>
            <p
              id="loading-description"
              className="text-sm text-gray-600 dark:text-gray-400 mb-6"
            >
              Lütfen bekleyin, sayfa hazırlanıyor...
            </p>

            {/* Progress bar */}
            <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600 transition-all duration-500 ease-out rounded-full shadow-sm"
                style={{ width: `${Math.max(progress, 5)}%` }}
              />
            </div>

            {/* Progress percentage */}
            <div className="mt-3 text-sm font-medium text-gray-600 dark:text-gray-400">
              {Math.round(progress)}% tamamlandı
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (variant === "minimal") {
    return (
      <div className={cn(
        "fixed top-0 left-0 right-0 z-50 h-0.5 bg-gradient-to-r from-blue-500 to-purple-600",
        className
      )}>
        <div
          className="h-full bg-white/50 transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    )
  }

  // Default "bar" variant
  return (
    <>
      {/* Progress Bar */}
      <div className={cn(
        "fixed top-0 left-0 right-0 z-50 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 shadow-lg",
        className
      )}>
        <div
          className="h-full bg-white/30 transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Optional: Small loading indicator in top-right corner */}
      <div className="fixed top-4 right-4 z-50">
        <div className="bg-white dark:bg-gray-800 rounded-full p-2 shadow-lg border border-gray-200 dark:border-gray-700">
          <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
        </div>
      </div>
    </>
  )
}

// Alternative: Top progress bar only
export function NavigationProgressBar({ className }: { className?: string }) {
  const { isLoading, progress } = useNavigationLoading()

  if (!isLoading) return null

  return (
    <div className={cn(
      "fixed top-0 left-0 right-0 z-50 h-1",
      className
    )}>
      <div
        className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-300 ease-out shadow-lg"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}

// Loading overlay for specific sections
export function NavigationLoadingOverlay({ className }: { className?: string }) {
  const { isLoading } = useNavigationLoading()

  if (!isLoading) return null

  return (
    <div className={cn(
      "fixed inset-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center",
      className
    )}>
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-2" />
        <p className="text-sm text-gray-600 dark:text-gray-400">Sayfa yükleniyor...</p>
      </div>
    </div>
  )
}
