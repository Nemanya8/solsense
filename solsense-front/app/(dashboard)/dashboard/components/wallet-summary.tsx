import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UserIcon } from "lucide-react"
import { formatCurrency, formatPercentage, timeAgo } from "@/lib/utils"

interface WalletSummaryProps {
  wallet_address: string
  timestamp: string
  netWorth: number
  estimated24hReward: number
}

export function WalletSummary({ wallet_address, timestamp, netWorth, estimated24hReward }: WalletSummaryProps) {
  return (
    <Card className={`bg-gradient-to-b ${(estimated24hReward / netWorth) * 100 >= 0 ? "from-green-500/20" : "from-red-500/20"} to-transparent`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-base font-medium">
            {wallet_address.slice(0, 4)}...{wallet_address.slice(-4)}
          </CardTitle>
          <p className="text-sm text-muted-foreground">Last updated: {timeAgo(Number(timestamp))}</p>
        </div>
        <UserIcon className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-3xl font-bold">{formatCurrency(netWorth)}</p>
            <p className="text-sm text-muted-foreground">
              {formatPercentage((estimated24hReward / netWorth) * 100)} daily yield
            </p>
          </div>
          <Button variant="outline" className="w-full">Update Portfolio</Button>
        </div>
      </CardContent>
    </Card>
  )
} 