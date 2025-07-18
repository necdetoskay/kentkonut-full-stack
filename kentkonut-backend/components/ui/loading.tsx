"use client"

import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

// Basic Loading Spinner
interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  className?: string
  text?: string
}

export function LoadingSpinner({ size = "md", className, text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6", 
    lg: "h-8 w-8"
  }

  return (
    <div className={cn("flex items-center justify-center space-x-2", className)}>
      <Loader2 className={cn("animate-spin text-blue-500", sizeClasses[size])} />
      {text && <span className="text-sm text-gray-600">{text}</span>}
    </div>
  )
}

// Card Loading Skeleton
interface LoadingSkeletonProps {
  className?: string
  rows?: number
  showHeader?: boolean
}

export function LoadingSkeleton({ className, rows = 3, showHeader = true }: LoadingSkeletonProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {showHeader && (
        <div className="space-y-2">
          <div className="h-6 w-48 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
        </div>
      )}
      
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="border rounded-lg p-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gray-200 rounded animate-pulse"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-3 w-48 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="w-16 h-8 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Table Loading Skeleton
interface LoadingTableProps {
  rows?: number
  columns?: number
  className?: string
}

export function LoadingTable({ rows = 5, columns = 4, className }: LoadingTableProps) {
  return (
    <div className={cn("border rounded-lg overflow-hidden", className)}>
      {/* Table header */}
      <div className="border-b bg-gray-50 p-4">
        <div className="flex space-x-4">
          {Array.from({ length: columns }).map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 rounded animate-pulse" style={{ width: `${100/columns}%` }}></div>
          ))}
        </div>
      </div>
      
      {/* Table rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="border-b last:border-b-0 p-4">
          <div className="flex space-x-4">
            {Array.from({ length: columns }).map((_, j) => (
              <div key={j} className="h-4 bg-gray-200 rounded animate-pulse" style={{ width: `${100/columns}%` }}></div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// Form Loading Skeleton
export function LoadingForm({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-6", className)}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
        </div>
      ))}
      <div className="flex space-x-4">
        <div className="h-10 w-24 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-10 w-24 bg-gray-200 rounded animate-pulse"></div>
      </div>
    </div>
  )
}

// Loading Overlay
interface LoadingOverlayProps {
  isLoading: boolean
  children: React.ReactNode
  text?: string
  className?: string
}

export function LoadingOverlay({ isLoading, children, text = "Yükleniyor...", className }: LoadingOverlayProps) {
  return (
    <div className={cn("relative", className)}>
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-2" />
            <p className="text-sm text-gray-600">{text}</p>
          </div>
        </div>
      )}
    </div>
  )
}

// Page Loading (Full screen)
interface PageLoadingProps {
  title?: string
  description?: string
}

export function PageLoading({ title = "Sayfa Yükleniyor", description = "Lütfen bekleyin..." }: PageLoadingProps) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="mb-6">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-600">{description}</p>
      </div>
    </div>
  )
}

// Content Loading (Placeholder for content areas)
interface ContentLoadingProps {
  lines?: number
  className?: string
}

export function ContentLoading({ lines = 3, className }: ContentLoadingProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
          {i === lines - 1 && <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>}
        </div>
      ))}
    </div>
  )
}
