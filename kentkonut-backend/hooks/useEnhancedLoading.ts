"use client"

import { useState, useCallback, useRef, useEffect } from 'react'
import { toast } from 'sonner'

interface LoadingState {
  isLoading: boolean
  progress: number
  error: string | null
  startTime: number | null
  estimatedDuration: number | null
}

interface UseEnhancedLoadingOptions {
  minLoadingTime?: number // Minimum loading time to prevent flashing
  maxLoadingTime?: number // Maximum loading time before timeout
  showProgressBar?: boolean
  onStart?: () => void
  onComplete?: () => void
  onError?: (error: Error) => void
  onTimeout?: () => void
}

export function useEnhancedLoading(options: UseEnhancedLoadingOptions = {}) {
  const {
    minLoadingTime = 300,
    maxLoadingTime = 30000,
    showProgressBar = false,
    onStart,
    onComplete,
    onError,
    onTimeout
  } = options

  const [state, setState] = useState<LoadingState>({
    isLoading: false,
    progress: 0,
    error: null,
    startTime: null,
    estimatedDuration: null
  })

  // Use ReturnType<typeof setTimeout> for browser/node compatibility and allow null
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const progressRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const minTimeRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const startLoading = useCallback((estimatedDuration?: number) => {
    const startTime = Date.now()
    
    setState({
      isLoading: true,
      progress: 0,
      error: null,
      startTime,
      estimatedDuration: estimatedDuration || null
    })

    onStart?.()

    // Set timeout for maximum loading time
    timeoutRef.current = setTimeout(() => {
      setState(prev => ({ ...prev, error: 'İşlem zaman aşımına uğradı' }))
      onTimeout?.()
      stopLoading()
    }, maxLoadingTime)

    // Progress simulation if enabled and estimated duration provided
    if (showProgressBar && estimatedDuration) {
      const progressInterval = estimatedDuration / 100
      let currentProgress = 0

      const updateProgress = () => {
        currentProgress += 1
        if (currentProgress <= 90) { // Don't go to 100% until actually complete
          setState(prev => ({ ...prev, progress: currentProgress }))
          progressRef.current = setTimeout(updateProgress, progressInterval)
        }
      }

      progressRef.current = setTimeout(updateProgress, progressInterval)
    }
  }, [maxLoadingTime, showProgressBar, onStart, onTimeout])

  const stopLoading = useCallback((error?: Error) => {
    const now = Date.now()
    const elapsed = state.startTime ? now - state.startTime : 0
    const remainingMinTime = Math.max(0, minLoadingTime - elapsed)

    // Clear timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    if (progressRef.current) {
      clearTimeout(progressRef.current)
      progressRef.current = null
    }

    const finishLoading = () => {
      setState({
        isLoading: false,
        progress: error ? 0 : 100,
        error: error?.message || null,
        startTime: null,
        estimatedDuration: null
      })

      if (error) {
        onError?.(error)
      } else {
        onComplete?.()
      }

      // Reset progress after a short delay
      setTimeout(() => {
        setState(prev => ({ ...prev, progress: 0, error: null }))
      }, 500)
    }

    // Ensure minimum loading time to prevent flashing
    if (remainingMinTime > 0) {
      minTimeRef.current = setTimeout(finishLoading, remainingMinTime)
    } else {
      finishLoading()
    }
  }, [state.startTime, minLoadingTime, onComplete, onError])

  const setProgress = useCallback((progress: number) => {
    setState(prev => ({ ...prev, progress: Math.min(100, Math.max(0, progress)) }))
  }, [])

  const setError = useCallback((error: string | Error) => {
    const errorMessage = typeof error === 'string' ? error : error.message
    setState(prev => ({ ...prev, error: errorMessage }))
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (progressRef.current) clearTimeout(progressRef.current)
      if (minTimeRef.current) clearTimeout(minTimeRef.current)
    }
  }, [])

  // Wrapper function for async operations
  const withLoading = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    estimatedDuration?: number
  ): Promise<T> => {
    try {
      startLoading(estimatedDuration)
      const result = await asyncFn()
      stopLoading()
      return result
    } catch (error) {
      const err = error instanceof Error ? error : new Error('An error occurred')
      stopLoading(err)
      throw err
    }
  }, [startLoading, stopLoading])

  return {
    ...state,
    startLoading,
    stopLoading,
    setProgress,
    setError,
    withLoading
  }
}

// Hook for API calls with automatic loading management
export function useApiLoading<T = any>() {
  const loading = useEnhancedLoading({
    minLoadingTime: 200,
    maxLoadingTime: 15000,
    showProgressBar: true
  })

  const execute = useCallback(async (
    apiCall: () => Promise<T>,
    options?: {
      successMessage?: string
      errorMessage?: string
      estimatedDuration?: number
    }
  ): Promise<T | null> => {
    try {
      const result = await loading.withLoading(apiCall, options?.estimatedDuration)
      
      if (options?.successMessage) {
        toast.success(options.successMessage)
      }
      
      return result
    } catch (error) {
      const errorMessage = options?.errorMessage || 
        (error instanceof Error ? error.message : 'Bir hata oluştu')
      
      toast.error(errorMessage)
      return null
    }
  }, [loading])

  return {
    ...loading,
    execute
  }
}

// Hook for form submissions
export function useFormLoading() {
  return useEnhancedLoading({
    minLoadingTime: 500,
    maxLoadingTime: 10000,
    showProgressBar: false
  })
}

// Hook for navigation loading
export function usePageLoading() {
  return useEnhancedLoading({
    minLoadingTime: 100,
    maxLoadingTime: 8000,
    showProgressBar: true
  })
}
