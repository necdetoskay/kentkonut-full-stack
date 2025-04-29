"use client";

import React, { ReactNode, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface MarqueeProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  pauseOnHover?: boolean;
  direction?: "left" | "right";
  speed?: number;
  className?: string;
}

export function Marquee({
  children,
  pauseOnHover = false,
  direction = "left",
  speed = 40,
  className,
  ...props
}: MarqueeProps) {
  const [containerWidth, setContainerWidth] = useState(0);
  const [contentWidth, setContentWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (containerRef.current && contentRef.current) {
      const updateWidths = () => {
        setContainerWidth(containerRef.current?.offsetWidth ?? 0);
        setContentWidth(contentRef.current?.scrollWidth ?? 0);
      };

      updateWidths();
      const resizeObserver = new ResizeObserver(updateWidths);
      resizeObserver.observe(containerRef.current);
      resizeObserver.observe(contentRef.current);

      return () => {
        resizeObserver.disconnect();
      };
    }
  }, [children]);

  // Calculate animation duration based on content width and speed
  const duration = Math.max(contentWidth / speed, 5);
  const needsAnimation = contentWidth > containerWidth;

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-hidden", className)}
      onMouseEnter={() => pauseOnHover && setIsPaused(true)}
      onMouseLeave={() => pauseOnHover && setIsPaused(false)}
      {...props}
    >
      <div
        ref={contentRef}
        className="inline-flex gap-4 whitespace-nowrap"
        style={{
          animationPlayState: isPaused ? "paused" : "running",
          animationDuration: needsAnimation ? `${duration}s` : "0s",
          animationName: needsAnimation ? "marquee" : "none",
          animationTimingFunction: "linear",
          animationIterationCount: "infinite",
          animationDirection: direction === "right" ? "reverse" : "normal",
        }}
      >
        {children}
        {needsAnimation && <div className="inline-flex gap-4">{children}</div>}
      </div>

      <style jsx global>{`
        @keyframes marquee {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
} 