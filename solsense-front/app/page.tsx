"use client"

import { useWallet } from "@solana/wallet-adapter-react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { WalletIcon } from "lucide-react"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"

export default function Home() {
  const { connected } = useWallet()
  const router = useRouter()

  useEffect(() => {
    if (connected) {
      router.push("/user/dashboard")
    }
  }, [connected, router])

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
            <WalletMultiButton className="w-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

