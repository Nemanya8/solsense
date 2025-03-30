import type React from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { SidebarProvider } from "./sidebar-provider"
import { Sidebar } from "./user-sidebar"
import { WalletStateProvider } from "./wallet-state-provider"
import { UserContent } from "./user-content"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
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
    </ThemeProvider>
  )
}

