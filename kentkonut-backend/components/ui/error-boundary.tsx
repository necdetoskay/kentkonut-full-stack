"use client"

import React, { Component, ErrorInfo, ReactNode } from "react"

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.warn('ErrorBoundary caught an error:', error, errorInfo)
    }
    
    // Call the onError callback if provided
    this.props.onError?.(error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      // Return fallback UI or null to render nothing
      return this.props.fallback || null
    }

    return this.props.children
  }
}

// Silent Error Boundary - specifically for prefetch errors
export function SilentErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={null}
      onError={(error) => {
        // Only log non-prefetch related errors
        if (!error.message.includes('prefetch') && 
            !error.message.includes('ERR_ABORTED') &&
            !error.message.includes('navigation')) {
          console.error('Unexpected error:', error)
        }
      }}
    >
      {children}
    </ErrorBoundary>
  )
}