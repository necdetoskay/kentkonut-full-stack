"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"

interface NavigationLoadingContextType {
  isLoading: boolean
  progress: number
  startLoading: () => void
  stopLoading: () => void
}

const NavigationLoadingContext = createContext<NavigationLoadingContextType | undefined>(undefined)

export function useNavigationLoading() {
  const context = useContext(NavigationLoadingContext)
  if (context === undefined) {
    throw new Error('useNavigationLoading must be used within a NavigationLoadingProvider')
  }
  return context
}

interface NavigationLoadingProviderProps {
  children: ReactNode
}

export function NavigationLoadingProvider({ children }: NavigationLoadingProviderProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const router = useRouter()
  const pathname = usePathname()

  const startLoading = () => {
    setIsLoading(true)
    setProgress(0)
  }

  const stopLoading = () => {
    setProgress(100)
    setTimeout(() => {
      setIsLoading(false)
      setProgress(0)
    }, 200)
  }

  useEffect(() => {
    let progressInterval: NodeJS.Timeout
    let timeoutId: NodeJS.Timeout

    if (isLoading) {
      // Simulate progress
      progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) return prev
          return prev + Math.random() * 10
        })
      }, 200)

      // Fallback timeout
      timeoutId = setTimeout(() => {
        stopLoading()
      }, 10000)
    }

    return () => {
      if (progressInterval) clearInterval(progressInterval)
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [isLoading])

  // Stop loading when pathname changes (page loaded)
  useEffect(() => {
    if (isLoading) {
      stopLoading()
    }
  }, [pathname])

  useEffect(() => {
    // Override router methods to trigger loading
    const originalPush = router.push
    const originalReplace = router.replace
    const originalBack = router.back
    const originalForward = router.forward

    router.push = (...args) => {
      startLoading()
      try {
        return originalPush.apply(router, args)
      } catch (error) {
        stopLoading()
        throw error
      }
    }

    router.replace = (...args) => {
      startLoading()
      try {
        return originalReplace.apply(router, args)
      } catch (error) {
        stopLoading()
        throw error
      }
    }

    router.back = () => {
      startLoading()
      originalBack()
    }

    router.forward = () => {
      startLoading()
      originalForward()
    }

    // Listen for browser navigation
    const handlePopState = () => {
      startLoading()
    }

    window.addEventListener('popstate', handlePopState)

    // Cleanup
    return () => {
      window.removeEventListener('popstate', handlePopState)
      router.push = originalPush
      router.replace = originalReplace
      router.back = originalBack
      router.forward = originalForward
    }
  }, [router])

  const value = {
    isLoading,
    progress,
    startLoading,
    stopLoading
  }

  return (
    <NavigationLoadingContext.Provider value={value}>
      {children}
    </NavigationLoadingContext.Provider>
  )
}
