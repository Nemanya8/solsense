"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MegaphoneIcon, UserIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Home() {
  const router = useRouter()


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
              <Button onClick={() => router.push("/advertiser/dashboard")}>Join as Advertiser</Button>
            </div>
          </CardContent>
        </Card>
      </div>

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
              <Button onClick={() => router.push("/user/portfolio")}>Join as User</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

