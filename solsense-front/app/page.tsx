"use client"

import { useWallet } from "@solana/wallet-adapter-react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { WalletIcon, MegaphoneIcon, UserIcon } from "lucide-react"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { WalletName } from "@solana/wallet-adapter-base"
import { AdvertiserAuthDialog } from "@/components/advertiser-auth-dialog"

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
    <div className="min-h-screen flex bg-background">
      {/* Left side - Advertiser */}
      <div className="flex-1 flex items-center justify-center border-r">
        <Card className="w-full max-w-md mx-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MegaphoneIcon className="h-6 w-6" />
              Join as Advertiser
            </CardTitle>
            <CardDescription>Login or register to start advertising</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                Reach your target audience through SolSense's advertising platform.
              </p>
              <AdvertiserAuthDialog />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right side - User */}
      <div className="flex-1 flex items-center justify-center">
        <Card className="w-full max-w-md mx-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="h-6 w-6" />
              Join as User
            </CardTitle>
            <CardDescription>Connect your wallet to view your portfolio</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                Access your portfolio analytics and insights.
              </p>
              <WalletMultiButton 
                className="w-full" 
                disabled={connecting}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

