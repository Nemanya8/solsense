"use client"

import { createContext, useContext, useState, ReactNode } from 'react'

interface AdvertiserSidebarContextProps {
  isOpen: boolean
  toggle: () => void
}

const AdvertiserSidebarContext = createContext<AdvertiserSidebarContextProps | undefined>(undefined)

export function AdvertiserSidebarProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(true)

  const toggle = () => {
    setIsOpen(!isOpen)
  }

  return (
    <AdvertiserSidebarContext.Provider value={{ isOpen, toggle }}>
      {children}
    </AdvertiserSidebarContext.Provider>
  )
}

export function useAdvertiserSidebar() {
  const context = useContext(AdvertiserSidebarContext)
  if (context === undefined) {
    throw new Error('useAdvertiserSidebar must be used within an AdvertiserSidebarProvider')
  }
  return context
} 