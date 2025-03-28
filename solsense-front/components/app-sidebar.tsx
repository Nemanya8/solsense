"use client"

import { useState } from "react"
import Link from "next/link"
import { BarChart3, Coins, Users, Wallet } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"

export function AppSidebar() {
  const [connected, setConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState("")

  const connectWallet = () => {
    if (connected) {
      setConnected(false)
      setWalletAddress("")
    } else {
      // Mock wallet connection
      setConnected(true)
      setWalletAddress("sol1...4x9z")
    }
  }

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Coins className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold">Solsense</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/portfolio">
                <BarChart3 className="h-5 w-5" />
                <span>Portfolio</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/transactions">
                <Coins className="h-5 w-5" />
                <span>Transactions</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/community">
                <Users className="h-5 w-5" />
                <span>Community</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <Button
          onClick={connectWallet}
          className="w-full flex items-center gap-2"
          variant={connected ? "outline" : "default"}
        >
          <Wallet className="h-5 w-5" />
          {connected ? walletAddress : "Connect Wallet"}
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}

