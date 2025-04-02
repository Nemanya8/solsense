"use client"

import { useRouter } from "next/navigation"
import { MegaphoneIcon, UserIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Home() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-[#0F0B1A]">
      {/* Animated blurred circles with Solana colors */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Solana Purple */}
        <div className="animate-pulse-slow absolute top-[-10%] left-[-5%] w-[60%] h-[60%] rounded-full bg-[#9945FF]/30 blur-[120px] opacity-70"></div>

        {/* Solana Green */}
        <div className="animate-float absolute bottom-[-15%] right-[-5%] w-[50%] h-[50%] rounded-full bg-[#14F195]/30 blur-[100px] opacity-70"></div>

        {/* Additional Solana Purple - smaller and moving differently */}
        <div className="animate-float-delayed absolute top-[40%] right-[20%] w-[40%] h-[40%] rounded-full bg-[#9945FF]/20 blur-[80px] opacity-60"></div>

        {/* Additional Solana Green - smaller and moving differently */}
        <div className="animate-pulse-slow-delayed absolute bottom-[30%] left-[10%] w-[30%] h-[30%] rounded-full bg-[#14F195]/20 blur-[90px] opacity-60"></div>
      </div>

      {/* Left side - Advertiser */}
      <div className="flex-1 flex items-center justify-center relative z-10 px-4 md:px-8">
        <div className="w-full max-w-md">
          {/* Glass card */}
          <div className="backdrop-blur-md bg-[#1A1A2E]/80 border border-[#14F195]/20 rounded-2xl p-8 shadow-xl transition-all duration-300 hover:shadow-[0_0_25px_rgba(20,241,149,0.3)] hover:bg-[#1A1A2E]/90 hover:border-[#14F195]/30 hover:scale-[1.02]">
            <div className="flex flex-col items-center mb-6">
              <MegaphoneIcon className="h-12 w-12 mb-4 text-white" />
              <h1 className="text-4xl font-bold tracking-tight mb-2 text-white">Join as Advertiser</h1>
              <p className="text-xl text-gray-300 mb-8">Login or register to start advertising</p>
            </div>
            <p className="text-gray-400 mb-8 text-center">
              Reach your target audience through SolSense advertising platform.
            </p>
            <div className="flex justify-center">
              <Button
                size="lg"
                className="text-lg px-8 py-6 bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:opacity-90 text-white border-none"
                onClick={() => router.push("/advertiser/dashboard")}
              >
                Join as Advertiser
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - User */}
      <div className="flex-1 flex items-center justify-center relative z-10 px-4 md:px-8">
        <div className="w-full max-w-md">
          {/* Glass card */}
          <div className="backdrop-blur-md bg-[#1A1A2E]/80 border border-[#14F195]/20 rounded-2xl p-8 shadow-xl transition-all duration-300 hover:shadow-[0_0_25px_rgba(20,241,149,0.3)] hover:bg-[#1A1A2E]/90 hover:border-[#14F195]/30 hover:scale-[1.02]">
            <div className="flex flex-col items-center mb-6">
              <UserIcon className="h-12 w-12 mb-4 text-white" />
              <h1 className="text-4xl font-bold tracking-tight mb-2 text-white">Join as User</h1>
              <p className="text-xl text-gray-300 mb-8">Connect your wallet to view your portfolio</p>
            </div>
            <p className="text-gray-400 mb-8 text-center">Access your portfolio analytics and insights.</p>
            <div className="flex justify-center">
              <Button
                size="lg"
                className="text-lg px-8 py-6 bg-gradient-to-r from-[#14F195] to-[#9945FF] hover:opacity-90 text-white border-none"
                onClick={() => router.push("/user/portfolio")}
              >
                Join as User
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

