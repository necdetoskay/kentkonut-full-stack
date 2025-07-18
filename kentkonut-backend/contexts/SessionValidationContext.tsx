"use client"

import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"
import { toast } from "sonner"

interface SessionValidationContextType {
  isValidating: boolean
  lastValidation: Date | null
  forceValidation: () => Promise<void>
  isSessionValid: boolean
}

const SessionValidationContext = createContext<SessionValidationContextType | undefined>(undefined)

export function useSessionValidation() {
  const context = useContext(SessionValidationContext)
  if (context === undefined) {
    throw new Error('useSessionValidation must be used within a SessionValidationProvider')
  }
  return context
}

interface SessionValidationProviderProps {
  children: ReactNode
  validationInterval?: number // in milliseconds, default 5 minutes
  enableAutoValidation?: boolean
}

export function SessionValidationProvider({
  children,
  validationInterval = 5 * 60 * 1000, // 5 minutes
  enableAutoValidation = true
}: SessionValidationProviderProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  const [isValidating, setIsValidating] = useState(false)
  const [lastValidation, setLastValidation] = useState<Date | null>(null)
  const [isSessionValid, setIsSessionValid] = useState(true)

  const validationTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastActivityRef = useRef<Date>(new Date())
  const isValidatingRef = useRef(false)

  // Public routes that don't require authentication
  const publicRoutes = ['/auth/login', '/auth/register', '/auth/error', '/']
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

  // Update last activity time
  const updateLastActivity = () => {
    lastActivityRef.current = new Date()
  }

  // Validate session with server
  const validateSession = async (): Promise<boolean> => {
    if (isValidatingRef.current || isPublicRoute) {
      return true
    }

    try {
      setIsValidating(true)
      isValidatingRef.current = true

      // Check if session exists and is not expired
      if (status === 'unauthenticated') {
        return false
      }

      if (status === 'loading') {
        return true // Don't invalidate while loading
      }

      // Use NextAuth's built-in session check instead of manual API call
      // This avoids the JSON parsing issue
      if (!session || !session.user) {
        return false
      }

      // Additional server-side validation if needed
      try {
        const response = await fetch('/api/auth/session', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Cache-Control': 'no-cache',
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          return false
        }

        // Check if response is actually JSON
        const contentType = response.headers.get('content-type')
        if (!contentType || !contentType.includes('application/json')) {
          console.warn('Session validation received non-JSON response:', contentType)
          // Don't fail validation, just skip server check
          return true
        }

        const sessionData = await response.json()
        const isValid = !!sessionData?.user

        setLastValidation(new Date())
        setIsSessionValid(isValid)

        return isValid
      } catch (fetchError) {
        console.warn('Server session validation failed, using client session:', fetchError)
        // If server check fails, trust the client session
        setLastValidation(new Date())
        setIsSessionValid(true)
        return true
      }
    } catch (error) {
      console.error('Session validation error:', error)

      // If it's a JSON parsing error, log more details
      if (error instanceof SyntaxError && error.message.includes('JSON')) {
        console.error('Received non-JSON response during session validation')
      }

      return false
    } finally {
      setIsValidating(false)
      isValidatingRef.current = false
    }
  }

  // Force validation (public method)
  const forceValidation = async (): Promise<void> => {
    const isValid = await validateSession()
    if (!isValid && !isPublicRoute) {
      await handleSessionExpired()
    }
  }

  // Handle session expiration
  const handleSessionExpired = async () => {
    try {
      // Show user-friendly notification
      toast.error("Oturumunuz sona erdi. Tekrar giriş yapmanız gerekiyor.", {
        duration: 5000,
        action: {
          label: "Giriş Yap",
          onClick: () => router.push('/auth/login')
        }
      })

      // Sign out and redirect
      await signOut({
        redirect: false,
        callbackUrl: '/auth/login'
      })

      // Small delay to allow toast to show
      setTimeout(() => {
        router.push('/auth/login')
      }, 1000)

    } catch (error) {
      console.error('Error handling session expiration:', error)
      // Fallback: direct redirect
      router.push('/auth/login')
    }
  }

  // Set up periodic validation
  useEffect(() => {
    if (!enableAutoValidation || isPublicRoute) {
      return
    }

    const scheduleNextValidation = () => {
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current)
      }

      validationTimeoutRef.current = setTimeout(async () => {
        const isValid = await validateSession()
        if (!isValid) {
          await handleSessionExpired()
        } else {
          scheduleNextValidation()
        }
      }, validationInterval)
    }

    // Initial validation after a short delay
    const initialTimeout = setTimeout(async () => {
      const isValid = await validateSession()
      if (!isValid) {
        await handleSessionExpired()
      } else {
        scheduleNextValidation()
      }
    }, 2000) // 2 second delay for initial load

    return () => {
      clearTimeout(initialTimeout)
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current)
      }
    }
  }, [enableAutoValidation, validationInterval, pathname, status])

  // Listen for user activity to update last activity time
  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']

    const handleActivity = () => {
      updateLastActivity()
    }

    events.forEach(event => {
      document.addEventListener(event, handleActivity, true)
    })

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true)
      })
    }
  }, [])

  // Validate session when tab becomes visible (user returns to tab)
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (!document.hidden && !isPublicRoute) {
        // Check if it's been more than 1 minute since last activity
        const timeSinceLastActivity = Date.now() - lastActivityRef.current.getTime()
        if (timeSinceLastActivity > 60000) { // 1 minute
          const isValid = await validateSession()
          if (!isValid) {
            await handleSessionExpired()
          }
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [pathname])

  // Validate session on route changes to protected routes
  useEffect(() => {
    if (!isPublicRoute && status === 'authenticated') {
      // Small delay to allow route transition to complete
      const timeout = setTimeout(async () => {
        const isValid = await validateSession()
        if (!isValid) {
          await handleSessionExpired()
        }
      }, 500)

      return () => clearTimeout(timeout)
    }
  }, [pathname, status])

  const value = {
    isValidating,
    lastValidation,
    forceValidation,
    isSessionValid
  }

  return (
    <SessionValidationContext.Provider value={value}>
      {children}
    </SessionValidationContext.Provider>
  )
}
