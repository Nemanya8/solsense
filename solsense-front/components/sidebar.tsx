"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useSidebar } from "./sidebar-provider"
import { useWallet } from "@solana/wallet-adapter-react"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Users, Wallet, HelpCircle, LogOut, Menu, Images } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { isOpen, toggle } = useSidebar()
  const { disconnect } = useWallet()

  const handleLogout = async () => {
    try {
      await disconnect()
      router.push("/")
    } catch (error) {
      console.error("Error during logout:", error)
      router.push("/")
    }
  }

  return (
    <>
      <div
        className={cn("fixed inset-0 z-50 bg-background/80 backdrop-blur-sm lg:hidden", isOpen ? "block" : "hidden")}
        onClick={toggle}
      />
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-background",
          "transition-transform duration-300 ease-in-out",
          "border-r",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0",
        )}
      >
        <div className="flex h-16 items-center border-b px-4">
          <span className="text-xl font-semibold">SolSense</span>
          <Button variant="ghost" size="icon" className="ml-auto lg:hidden" onClick={toggle}>
            <Menu className="h-6 w-6" />
          </Button>
        </div>
        <div className="flex flex-col h-[calc(100vh-4rem)]">
          <div className="flex-1 overflow-auto py-3">
            <nav className="grid gap-2 px-3">
              {navItems.map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-4 py-3 text-base font-medium hover:bg-accent hover:text-accent-foreground",
                    pathname === item.href ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                  )}
                >
                  <item.icon className="h-6 w-6" />
                  <span>{item.name}</span>
                  {item.badge && (
                    <span className="ml-auto flex h-6 w-6 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </nav>
          </div>
          <div className="border-t p-3">
            <nav className="grid gap-2">
              <Link
                href={"/help"}
                className={cn(
                  "flex items-center gap-3 rounded-md px-4 py-3 text-base font-medium hover:bg-accent hover:text-accent-foreground",
                  pathname === "/help" ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                )}
              >
                <HelpCircle className="h-6 w-6" />
                <span>Help</span>
                <span className="ml-auto text-sm text-muted-foreground">Get support</span>
              </Link>
              <button
                onClick={handleLogout}
                className={cn(
                  "flex items-center gap-3 rounded-md px-4 py-3 text-base font-medium hover:bg-accent hover:text-accent-foreground w-full",
                  "text-muted-foreground"
                )}
              >
                <LogOut className="h-6 w-6" />
                <span>Logout</span>
                <span className="ml-auto text-sm text-muted-foreground">Disconnect wallet</span>
              </button>
            </nav>
          </div>
        </div>
      </div> 
    </>
  )
}

const navItems = [
  { name: "Dashboard", href: "/user/dashboard", icon: LayoutDashboard },
  { name: "Transactions", href: "/user/transactions", icon: Wallet },
  { name: "NFTs", href: "/user/nfts", icon: Images },
  { name: "Community", href: "/user/community", icon: Users, badge: "8" },
]