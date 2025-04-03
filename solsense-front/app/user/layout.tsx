import type React from "react"
import { SidebarProvider } from "./sidebar-provider"
import { Sidebar } from "./user-sidebar"
import { WalletStateProvider } from "./wallet-state-provider"
import { UserContent } from "./user-content"
import { WalletContextProvider } from "@/components/providers/wallet-provider"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <WalletContextProvider>
    <WalletStateProvider>
      <SidebarProvider>
        <div className="min-h-screen bg-background">
          <Sidebar />
          <div className="lg:pl-72">
            <UserContent>{children}</UserContent>
          </div>
        </div>
      </SidebarProvider>
      </WalletStateProvider>
    </WalletContextProvider>
  )
}

