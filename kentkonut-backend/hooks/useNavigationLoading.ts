"use client"

import { useNavigationLoading as useNavigationLoadingContext } from "@/contexts/NavigationLoadingContext"
import { useRouter } from "next/navigation"
import { useCallback } from "react"

export function useNavigationLoading() {
  const { isLoading, progress, startLoading, stopLoading } = useNavigationLoadingContext()
  const router = useRouter()

  const navigateWithLoading = useCallback(async (href: string, options?: { replace?: boolean }) => {
    try {
      startLoading()
      
      if (options?.replace) {
        await router.replace(href)
      } else {
        await router.push(href)
      }
    } catch (error) {
      stopLoading()
      throw error
    }
  }, [router, startLoading, stopLoading])

  const withLoading = useCallback(async <T>(asyncFn: () => Promise<T>): Promise<T> => {
    try {
      startLoading()
      const result = await asyncFn()
      return result
    } catch (error) {
      throw error
    } finally {
      stopLoading()
    }
  }, [startLoading, stopLoading])

  return {
    isLoading,
    progress,
    startLoading,
    stopLoading,
    navigateWithLoading,
    withLoading
  }
}

// Hook for components that need to show loading during async operations
export function useAsyncLoading() {
  const { startLoading, stopLoading } = useNavigationLoadingContext()

  const executeWithLoading = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    options?: {
      onSuccess?: (result: T) => void
      onError?: (error: Error) => void
    }
  ): Promise<T | undefined> => {
    try {
      startLoading()
      const result = await asyncFn()
      options?.onSuccess?.(result)
      return result
    } catch (error) {
      const err = error instanceof Error ? error : new Error('An error occurred')
      options?.onError?.(err)
      throw err
    } finally {
      stopLoading()
    }
  }, [startLoading, stopLoading])

  return { executeWithLoading }
}
