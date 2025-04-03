"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, Copy, UserIcon } from "lucide-react"
import { formatCurrency, formatPercentage, timeAgo } from "@/lib/utils"

interface PortfolioSummaryProps {
  wallet_address: string
  timestamp: string
  netWorth: number
  estimated24hReward: number
  tokenValue: number
  defiValue: number
  onUpdate: () => void
}

export function PortfolioSummary({
  wallet_address,
  timestamp,
  netWorth,
  estimated24hReward,
  tokenValue,
  defiValue,
  onUpdate,
}: PortfolioSummaryProps) {
  const [copied, setCopied] = useState(false)
  const [updating, setUpdating] = useState(false)
  const dailyYieldPercentage = (estimated24hReward / netWorth) * 100
  const isPositiveYield = dailyYieldPercentage >= 0

  const copyToClipboard = () => {
    navigator.clipboard.writeText(wallet_address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleUpdate = async () => {
    setUpdating(true)
    try {
      await onUpdate()
    } finally {
      setUpdating(false)
    }
  }

  return (
    <Card
      className={`col-span-2 bg-gradient-to-b ${isPositiveYield ? "from-green-500/20" : "from-red-500/20"} to-transparent`}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex flex-row items-center gap-2">
          <UserIcon className="h-5 w-5 text-muted-foreground" />
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-medium">
                {wallet_address.slice(0, 4)}...{wallet_address.slice(-4)}
              </CardTitle>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={copyToClipboard}>
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">Last updated: {timeAgo(Number(timestamp))}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <p className="text-4xl font-bold">{formatCurrency(netWorth)}</p>
            <p className="text-sm text-muted-foreground">{formatPercentage(dailyYieldPercentage)} daily yield</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-2xl font-bold">{formatCurrency(tokenValue)}</div>
              <p className="text-sm text-muted-foreground">
                Token Value ({formatPercentage((tokenValue / netWorth) * 100)})
              </p>
            </div>
            <div>
              <div className="text-2xl font-bold">{formatCurrency(defiValue)}</div>
              <p className="text-sm text-muted-foreground">
                DeFi Value ({formatPercentage((defiValue / netWorth) * 100)})
              </p>
            </div>
          </div>

          <div className="pt-4">
            <Button variant="outline" className="w-full" onClick={handleUpdate} disabled={updating}>
              {updating ? "Updating..." : "Update Portfolio"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

