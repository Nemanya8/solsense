"use client"

import { useWalletState } from "./wallet-state-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { WalletIcon } from "lucide-react"

export function UserContent({ children }: { children: React.ReactNode }) {
  const { isConnected } = useWalletState()

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <WalletIcon className="h-6 w-6" />
              Connect Your Wallet
            </CardTitle>
            <CardDescription>
              Please connect your wallet to access the dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Use the connect button in the sidebar to connect your wallet and access your portfolio.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <main className="p-4 md:p-6 lg:p-8">{children}</main>
} 