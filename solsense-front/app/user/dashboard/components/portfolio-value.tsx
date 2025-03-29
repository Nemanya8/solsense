import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { WalletIcon } from "lucide-react"
import { formatCurrency, formatPercentage } from "@/lib/utils"

interface PortfolioValueProps {
  tokenValue: number
  defiValue: number
  netWorth: number
}

export function PortfolioValue({ tokenValue, defiValue, netWorth }: PortfolioValueProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">Portfolio Value</CardTitle>
        <WalletIcon className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <div className="text-3xl font-bold">{formatCurrency(tokenValue)}</div>
            <p className="text-sm text-muted-foreground">
              Token Value ({formatPercentage((tokenValue / netWorth) * 100)})
            </p>
          </div>
          <div>
            <div className="text-3xl font-bold">{formatCurrency(defiValue)}</div>
            <p className="text-sm text-muted-foreground">
              DeFi Value ({formatPercentage((defiValue / netWorth) * 100)})
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 