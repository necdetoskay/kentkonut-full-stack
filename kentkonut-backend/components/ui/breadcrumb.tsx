"use client"

import * as React from "react"
import { ChevronRight, Home } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface BreadcrumbProps extends React.HTMLAttributes<HTMLDivElement> {
  segments?: {
    name: string
    href: string
  }[]
  separator?: React.ReactNode
  homeHref?: string
}

const Breadcrumb = React.forwardRef<HTMLDivElement, BreadcrumbProps>(
  ({ segments, separator, homeHref = "/", className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex items-center text-sm text-muted-foreground", className)}
        {...props}
      >
        <Link
          href={homeHref}
          className="flex items-center hover:text-foreground transition-colors"
        >
          <Home className="h-4 w-4" />
        </Link>
        {segments && segments.map((segment, index) => (
          <React.Fragment key={index}>
            <span className="mx-2">
              {separator || <ChevronRight className="h-4 w-4" />}
            </span>
            {index === segments.length - 1 ? (
              <span className="font-medium text-foreground">{segment.name}</span>
            ) : (
              <Link
                href={segment.href}
                className="hover:text-foreground transition-colors"
              >
                {segment.name}
              </Link>
            )}
          </React.Fragment>
        ))}
      </div>
    )
  }
)

Breadcrumb.displayName = "Breadcrumb"

export { Breadcrumb }
