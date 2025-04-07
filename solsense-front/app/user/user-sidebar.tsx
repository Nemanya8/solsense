"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSidebar } from "./sidebar-provider"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Users, Wallet, HelpCircle, Menu, Images } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CustomWalletButton } from "@/components/wallet/wallet-button"

export function Sidebar() {
  const pathname = usePathname()
  const { isOpen, toggle } = useSidebar()

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
        <div className="flex h-full flex-col">
          <div className="flex h-14 items-center justify-center border-b px-4">
            <Button variant="ghost" size="icon" className="absolute left-4 lg:hidden" onClick={toggle}>
              <Menu className="h-6 w-6" />
            </Button>
            <Link href="/" className="flex items-center gap-2 font-bold">
              <span className="text-2xl font-orbitron bg-gradient-to-r from-[#14F195] to-[#9945FF] bg-clip-text text-transparent">SolSense</span>
            </Link>
          </div>

          <div className="flex-1 overflow-y-auto py-4">
            <nav className="grid gap-2 px-3">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-4 py-3 text-base font-medium hover:bg-accent hover:text-accent-foreground",
                    pathname === item.href ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                  )}
                >
                  <item.icon className="h-6 w-6" />
                  <span>{item.name}</span>
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
              </Link>
              <CustomWalletButton />
            </nav>
          </div>
        </div>
      </div> 
    </>
  )
}

const navItems = [
  { name: "Portfolio", href: "/user/portfolio", icon: LayoutDashboard },
  { name: "Transactions", href: "/user/transactions", icon: Wallet },
  { name: "NFTs", href: "/user/nfts", icon: Images },
  { name: "Community", href: "/user/community", icon: Users},
]