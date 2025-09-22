"use client"

import { Loader2, AlertCircle, CheckCircle, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

// Enhanced Loading Spinner with progress
interface EnhancedLoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  className?: string
  text?: string
  progress?: number
  showProgress?: boolean
  variant?: "default" | "success" | "error" | "warning"
}

export function EnhancedLoadingSpinner({ 
  size = "md", 
  className, 
  text,
  progress = 0,
  showProgress = false,
  variant = "default"
}: EnhancedLoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6", 
    lg: "h-8 w-8"
  }

  const variantClasses = {
    default: "text-blue-500",
    success: "text-green-500",
    error: "text-red-500",
    warning: "text-yellow-500"
  }

  const Icon = variant === "success" ? CheckCircle : 
               variant === "error" ? AlertCircle :
               variant === "warning" ? Clock : Loader2

  return (
    <div className={cn("flex flex-col items-center justify-center space-y-3", className)}>
      <Icon className={cn(
        "animate-spin", 
        sizeClasses[size], 
        variantClasses[variant],
        variant === "success" && "animate-none"
      )} />
      
      {text && (
        <span className="text-sm text-gray-600 text-center max-w-xs">{text}</span>
      )}
      
      {showProgress && (
        <div className="w-full max-w-xs space-y-1">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-center text-gray-500">{Math.round(progress)}%</p>
        </div>
      )}
    </div>
  )
}

// Smart Loading Skeleton with shimmer effect
interface SmartLoadingSkeletonProps {
  className?: string
  rows?: number
  showHeader?: boolean
  variant?: "card" | "table" | "list" | "form"
  animated?: boolean
}

export function SmartLoadingSkeleton({ 
  className, 
  rows = 3, 
  showHeader = true,
  variant = "card",
  animated = true
}: SmartLoadingSkeletonProps) {
  const shimmerClass = animated ? "animate-pulse" : ""
  
  if (variant === "table") {
    return (
      <div className={cn("border rounded-lg overflow-hidden", className)}>
        {/* Table header */}
        <div className="border-b bg-gray-50 p-4">
          <div className="flex space-x-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={cn("h-4 bg-gray-200 rounded flex-1", shimmerClass)}></div>
            ))}
          </div>
        </div>
        
        {/* Table rows */}
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="border-b last:border-b-0 p-4">
            <div className="flex space-x-4">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className={cn("h-4 bg-gray-200 rounded flex-1", shimmerClass)}></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (variant === "list") {
    return (
      <div className={cn("space-y-3", className)}>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center space-x-3 p-3 border rounded-lg">
            <div className={cn("w-10 h-10 bg-gray-200 rounded-full", shimmerClass)}></div>
            <div className="flex-1 space-y-2">
              <div className={cn("h-4 w-3/4 bg-gray-200 rounded", shimmerClass)}></div>
              <div className={cn("h-3 w-1/2 bg-gray-200 rounded", shimmerClass)}></div>
            </div>
            <div className={cn("w-16 h-8 bg-gray-200 rounded", shimmerClass)}></div>
          </div>
        ))}
      </div>
    )
  }

  if (variant === "form") {
    return (
      <div className={cn("space-y-6", className)}>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className={cn("h-4 w-24 bg-gray-200 rounded", shimmerClass)}></div>
            <div className={cn("h-10 w-full bg-gray-200 rounded", shimmerClass)}></div>
          </div>
        ))}
        <div className="flex space-x-4 pt-4">
          <div className={cn("h-10 w-24 bg-gray-200 rounded", shimmerClass)}></div>
          <div className={cn("h-10 w-24 bg-gray-200 rounded", shimmerClass)}></div>
        </div>
      </div>
    )
  }

  // Default card variant
  return (
    <div className={cn("space-y-4", className)}>
      {showHeader && (
        <div className="space-y-2">
          <div className={cn("h-6 w-48 bg-gray-200 rounded", shimmerClass)}></div>
          <div className={cn("h-4 w-64 bg-gray-200 rounded", shimmerClass)}></div>
        </div>
      )}
      
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="border rounded-lg p-4">
          <div className="flex items-center space-x-4">
            <div className={cn("w-12 h-12 bg-gray-200 rounded", shimmerClass)}></div>
            <div className="flex-1 space-y-2">
              <div className={cn("h-4 w-32 bg-gray-200 rounded", shimmerClass)}></div>
              <div className={cn("h-3 w-48 bg-gray-200 rounded", shimmerClass)}></div>
            </div>
            <div className={cn("w-16 h-8 bg-gray-200 rounded", shimmerClass)}></div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Loading State Manager Component
interface LoadingStateManagerProps {
  isLoading: boolean
  error?: string | null
  progress?: number
  children: React.ReactNode
  loadingComponent?: React.ReactNode
  errorComponent?: React.ReactNode
  onRetry?: () => void
  className?: string
}

export function LoadingStateManager({
  isLoading,
  error,
  progress = 0,
  children,
  loadingComponent,
  errorComponent,
  onRetry,
  className
}: LoadingStateManagerProps) {
  if (error) {
    return (
      <div className={cn("space-y-4", className)}>
        {errorComponent || (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              {onRetry && (
                <Button variant="outline" size="sm" onClick={onRetry}>
                  Tekrar Dene
                </Button>
              )}
            </AlertDescription>
          </Alert>
        )}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className={cn("", className)}>
        {loadingComponent || (
          <EnhancedLoadingSpinner 
            text="Yükleniyor..." 
            progress={progress}
            showProgress={progress > 0}
          />
        )}
      </div>
    )
  }

  return <div className={className}>{children}</div>
}

// Page Loading with estimated time
interface PageLoadingWithTimeProps {
  title?: string
  description?: string
  estimatedTime?: number
  progress?: number
  showProgress?: boolean
}

export function PageLoadingWithTime({ 
  title = "Sayfa Yükleniyor", 
  description = "Lütfen bekleyin...",
  estimatedTime,
  progress = 0,
  showProgress = false
}: PageLoadingWithTimeProps) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <EnhancedLoadingSpinner 
            size="lg" 
            progress={progress}
            showProgress={showProgress}
          />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-600 mb-4">{description}</p>
        
        {estimatedTime && (
          <p className="text-sm text-gray-500">
            Tahmini süre: {estimatedTime} saniye
          </p>
        )}
      </div>
    </div>
  )
}

// Inline Loading for buttons and small components
interface InlineLoadingProps {
  isLoading: boolean
  children: React.ReactNode
  loadingText?: string
  size?: "sm" | "md"
  className?: string
}

export function InlineLoading({
  isLoading,
  children,
  loadingText = "Yükleniyor...",
  size = "sm",
  className
}: InlineLoadingProps) {
  if (isLoading) {
    return (
      <div className={cn("flex items-center space-x-2", className)}>
        <Loader2 className={cn("animate-spin", size === "sm" ? "h-4 w-4" : "h-5 w-5")} />
        <span className={cn("text-sm", size === "md" && "text-base")}>{loadingText}</span>
      </div>
    )
  }

  return <>{children}</>
}
