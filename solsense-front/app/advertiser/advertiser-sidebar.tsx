"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAdvertiserSidebar } from "@/components/ui/advertiser-sidebar"
import { useAuth } from "./auth-provider"
import { cn } from "@/lib/utils"
import { LayoutDashboard, HelpCircle, LogOut, Menu, FileSpreadsheet, ChartLine } from "lucide-react"

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { isOpen, toggle } = useAdvertiserSidebar()
  const { logout } = useAuth()

  const handleLogout = async () => {
    await logout()
    router.push("/advertiser")
  }

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-background border-r transition-transform duration-200 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center border-b px-4">
          <button
            onClick={toggle}
            className="p-2 hover:bg-accent rounded-md"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="ml-2 text-lg font-semibold">SolSense</span>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          <Link
            href="/advertiser/dashboard"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent",
              pathname === "/advertiser/dashboard" ? "bg-accent" : "transparent"
            )}
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>
          <Link
            href="/advertiser/ads"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent",
              pathname === "/advertiser/ads" ? "bg-accent" : "transparent"
            )}
          >
            <FileSpreadsheet className="h-4 w-4" />
            Ads
          </Link>
          <Link
            href="/advertiser/analytics"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent",
              pathname === "/advertiser/analytics" ? "bg-accent" : "transparent"
            )}
          >
            <ChartLine className="h-4 w-4" />
            Analytics
          </Link>
          <Link
            href="/advertiser/help"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent",
              pathname === "/advertiser/help" ? "bg-accent" : "transparent"
            )}
          >
            <HelpCircle className="h-4 w-4" />
            Help
          </Link>
        </nav>
        <div className="border-t p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>
    </aside>
  )
}