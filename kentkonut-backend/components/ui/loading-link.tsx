"use client"

import Link, { LinkProps } from "next/link"
import { useNavigationLoading } from "@/contexts/NavigationLoadingContext"
import { ReactNode, MouseEvent } from "react"
import { cn } from "@/lib/utils"

interface LoadingLinkProps extends LinkProps {
  children: ReactNode
  className?: string
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void
  disabled?: boolean
}

export function LoadingLink({ 
  children, 
  className, 
  onClick, 
  disabled = false,
  ...props 
}: LoadingLinkProps) {
  const { startLoading, isLoading } = useNavigationLoading()

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (disabled || isLoading) {
      e.preventDefault()
      return
    }

    // Call custom onClick if provided
    onClick?.(e)

    // Don't start loading for external links or same page links
    const href = props.href.toString()
    if (href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:')) {
      return
    }

    // Check if it's the same page
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname
      const targetPath = href.split('?')[0].split('#')[0]
      if (currentPath === targetPath) {
        return
      }
    }

    startLoading()
  }

  return (
    <Link
      {...props}
      prefetch={false}
      className={cn(
        className,
        disabled && "pointer-events-none opacity-50",
        isLoading && "pointer-events-none"
      )}
      onClick={handleClick}
    >
      {children}
    </Link>
  )
}

// Button-style loading link
export function LoadingButton({ 
  children, 
  className, 
  variant = "default",
  size = "default",
  disabled = false,
  ...props 
}: LoadingLinkProps & {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
}) {
  const { startLoading, isLoading } = useNavigationLoading()

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (disabled || isLoading) {
      e.preventDefault()
      return
    }

    const href = props.href.toString()
    if (!href.startsWith('http') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
      startLoading()
    }
  }

  const baseStyles = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
  
  const variants = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    link: "text-primary underline-offset-4 hover:underline",
  }

  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-md px-8",
    icon: "h-10 w-10",
  }

  return (
    <Link
      {...props}
      prefetch={false}
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        className,
        (disabled || isLoading) && "pointer-events-none opacity-50"
      )}
      onClick={handleClick}
    >
      {children}
    </Link>
  )
}
