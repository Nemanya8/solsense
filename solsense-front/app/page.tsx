"use client"

import { useWallet } from "@solana/wallet-adapter-react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { WalletIcon, AlertCircle } from "lucide-react"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { WalletName } from "@solana/wallet-adapter-base"

export default function Home() {
  const { connected, connecting, select, wallets } = useWallet()
  const router = useRouter()

  useEffect(() => {
    if (connected) {
      router.push("/user/dashboard")
    }
  }, [connected, router])

  const handleWalletSelect = async (walletName: WalletName) => {
    try {
      await select(walletName)
    } catch (error) {
      console.error("Error selecting wallet:", error)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <WalletIcon className="h-6 w-6" />
            Welcome to SolSense
          </CardTitle>
          <CardDescription>Connect your wallet to view your portfolio</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              Connect your Solana wallet to access your portfolio analytics and insights.
            </p>
            <WalletMultiButton 
              className="w-full" 
              disabled={connecting}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

