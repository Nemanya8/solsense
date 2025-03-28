"use client"

import { useEffect, useRef, useState, ReactNode } from "react"
import { cn } from "@/lib/utils"

interface CursorGradientProps {
  className?: string
  children: ReactNode
}

export function CursorGradient({ className, children }: CursorGradientProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect()
      setPosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
    }

    const handleMouseEnter = () => setIsHovering(true)
    const handleMouseLeave = () => setIsHovering(false)

    container.addEventListener("mousemove", handleMouseMove)
    container.addEventListener("mouseenter", handleMouseEnter)
    container.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      container.removeEventListener("mousemove", handleMouseMove)
      container.removeEventListener("mouseenter", handleMouseEnter)
      container.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-hidden", className)}
      style={{
        "--cursor-x": `${position.x}px`,
        "--cursor-y": `${position.y}px`,
      } as React.CSSProperties}
    >
      <div
        className={cn(
          "absolute inset-0 pointer-events-none transition-opacity duration-300",
          "bg-[radial-gradient(circle_at_var(--cursor-x)_var(--cursor-y),rgba(255,255,255,0.2)_0%,transparent_50%)]",
          isHovering ? "opacity-100" : "opacity-0"
        )}
      />
      {children}
    </div>
  )
} 