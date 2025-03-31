"use client"

import { AuthProvider } from "./auth-provider"
import { AdvertiserContent } from "./advertiser-content"
import { AdvertiserSidebarProvider } from "@/components/ui/advertiser-sidebar"
import { Sidebar } from "./advertiser-sidebar"

export default function AdvertiserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <AdvertiserContent>
        <AdvertiserSidebarProvider>
          <div className="min-h-screen bg-background">
            <Sidebar />
            <div className="lg:pl-72">
              {children}
            </div>
          </div>
        </AdvertiserSidebarProvider>
      </AdvertiserContent>
    </AuthProvider>
  )
}

