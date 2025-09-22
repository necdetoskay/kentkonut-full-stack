"use client"

import { useCallback, useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useSessionValidation as useSessionValidationContext } from "@/contexts/SessionValidationContext"
import { toast } from "sonner"

interface UseSessionValidationOptions {
  onSessionExpired?: () => void
  onSessionValid?: () => void
  validateOnMount?: boolean
  validateOnFocus?: boolean
}

export function useSessionValidation(options: UseSessionValidationOptions = {}) {
  const {
    onSessionExpired,
    onSessionValid,
    validateOnMount = false,
    validateOnFocus = true
  } = options

  const { data: session, status } = useSession()
  const { 
    isValidating, 
    lastValidation, 
    forceValidation, 
    isSessionValid 
  } = useSessionValidationContext()

  const [hasValidated, setHasValidated] = useState(false)

  // Validate session and handle result
  const validateAndHandle = useCallback(async () => {
    try {
      await forceValidation()
      setHasValidated(true)
      
      if (isSessionValid) {
        onSessionValid?.()
      } else {
        onSessionExpired?.()
      }
    } catch (error) {
      console.error('Session validation failed:', error)
      onSessionExpired?.()
    }
  }, [forceValidation, isSessionValid, onSessionValid, onSessionExpired])

  // Validate on mount if requested
  useEffect(() => {
    if (validateOnMount && status === 'authenticated' && !hasValidated) {
      validateAndHandle()
    }
  }, [validateOnMount, status, hasValidated, validateAndHandle])

  // Validate when window gains focus if requested
  useEffect(() => {
    if (!validateOnFocus) return

    const handleFocus = () => {
      if (status === 'authenticated') {
        validateAndHandle()
      }
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [validateOnFocus, status, validateAndHandle])

  return {
    isValidating,
    lastValidation,
    isSessionValid,
    validateSession: validateAndHandle,
    hasValidated,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading'
  }
}

// Hook for API calls with automatic session validation
export function useAuthenticatedFetch() {
  const { validateSession, isSessionValid } = useSessionValidation()

  const authenticatedFetch = useCallback(async (
    url: string, 
    options: RequestInit = {}
  ): Promise<Response> => {
    // Validate session before making the request
    await validateSession()

    if (!isSessionValid) {
      throw new Error('Session expired')
    }

    const response = await fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    // Check if response indicates session expiration
    if (response.status === 401) {
      toast.error('Oturumunuz sona erdi. Lütfen tekrar giriş yapın.')
      await validateSession() // This will trigger logout flow
      throw new Error('Session expired')
    }

    return response
  }, [validateSession, isSessionValid])

  return { authenticatedFetch }
}

// Hook for form submissions with session validation
export function useAuthenticatedSubmit() {
  const { authenticatedFetch } = useAuthenticatedFetch()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const submitWithAuth = useCallback(async <T>(
    url: string,
    data: any,
    options: {
      method?: 'POST' | 'PUT' | 'PATCH' | 'DELETE'
      onSuccess?: (result: T) => void
      onError?: (error: Error) => void
      successMessage?: string
      errorMessage?: string
    } = {}
  ): Promise<T | null> => {
    const {
      method = 'POST',
      onSuccess,
      onError,
      successMessage,
      errorMessage = 'İşlem sırasında bir hata oluştu'
    } = options

    setIsSubmitting(true)

    try {
      const response = await authenticatedFetch(url, {
        method,
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      
      if (successMessage) {
        toast.success(successMessage)
      }
      
      onSuccess?.(result)
      return result
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error')
      
      if (errorMessage && !err.message.includes('Session expired')) {
        toast.error(errorMessage)
      }
      
      onError?.(err)
      return null
    } finally {
      setIsSubmitting(false)
    }
  }, [authenticatedFetch])

  return {
    submitWithAuth,
    isSubmitting
  }
}

// Hook for periodic session checks on critical pages
export function useCriticalPageSessionCheck(intervalMs: number = 2 * 60 * 1000) {
  const { validateSession, isSessionValid } = useSessionValidation()
  const [lastCheck, setLastCheck] = useState<Date | null>(null)

  useEffect(() => {
    const interval = setInterval(async () => {
      await validateSession()
      setLastCheck(new Date())
    }, intervalMs)

    // Initial check
    validateSession().then(() => setLastCheck(new Date()))

    return () => clearInterval(interval)
  }, [validateSession, intervalMs])

  return {
    lastCheck,
    isSessionValid,
    forceCheck: validateSession
  }
}
