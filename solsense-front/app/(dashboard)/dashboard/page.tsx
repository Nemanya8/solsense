"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PortfolioData } from "@/types/portfolio"
import { PortfolioRadar } from "@/app/(dashboard)/dashboard/components/portfolio-radar"
import { DashboardChart } from "@/app/(dashboard)/dashboard/components/dashboard-chart"
import { RecentTransactions } from "@/app/(dashboard)/dashboard/components/recent-transactions"
import { WalletSummary } from "@/app/(dashboard)/dashboard/components/wallet-summary"
import { PortfolioValue } from "@/app/(dashboard)/dashboard/components/portfolio-value"
import { TokenPositions } from "@/app/(dashboard)/dashboard/components/token-positions"
import { LiquidityPositions } from "@/app/(dashboard)/dashboard/components/liquidity-positions"
import { LendingPositions } from "@/app/(dashboard)/dashboard/components/lending-positions"

export default function DashboardPage() {
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        setLoading(true)
        console.log('Fetching portfolio data...')
        const response = await fetch(
          "http://localhost:4000/api/portfolios/AkJk6gxnr9uv64NnWm9tUU8q1jeH6wxjEbEHbT2NeUES",
        )

        if (!response.ok) {
          throw new Error(`API error: ${response.status} - ${response.statusText}`)
        }

        const data = await response.json()
        console.log('Portfolio data received:', data)
        
        setPortfolio(data)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch portfolio data'
        console.error('Error details:', err)
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    fetchPortfolio()
  }, [])

  if (loading) {
    console.log('Rendering loading state...')
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading portfolio data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    console.log('Rendering error state:', error)
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md mx-auto">
          <p className="text-red-500 mb-4">Error loading dashboard: {error}</p>
          <p className="text-sm text-muted-foreground mb-4">Please check that the API server is running at http://localhost:4000</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    )
  }

  if (!portfolio) {
    console.log('No portfolio data available')
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-muted-foreground">No portfolio data available</p>
          <Button onClick={() => window.location.reload()} className="mt-4">Reload</Button>
        </div>
      </div>
    )
  }

  const { wallet_address, portfolio_data, tx_history, timestamp, transaction_volume, profile_ratings } = portfolio
  const { summary, positions } = portfolio_data
  const { aggregated } = summary

  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-4">
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <WalletSummary
            wallet_address={wallet_address}
            timestamp={timestamp}
            netWorth={aggregated.netWorth}
            estimated24hReward={aggregated.estimated24hReward}
          />

          <PortfolioValue
            tokenValue={aggregated.tokenValue}
            defiValue={aggregated.defiValue}
            netWorth={aggregated.netWorth}
          />

          <Card>
            <CardContent>
              <PortfolioRadar
                data={[
                  {
                    name: "Whale",
                    value: profile_ratings.whale
                  },
                  {
                    name: "Hodler",
                    value: profile_ratings.hodler
                  },
                  {
                    name: "Flipper",
                    value: profile_ratings.flipper
                  },
                  {
                    name: "DeFi",
                    value: profile_ratings.defi_user
                  },
                  {
                    name: "Experience",
                    value: profile_ratings.experienced
                  }
                ]}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-9">
        <TokenPositions
          spot={positions.token.spot}
          yield={positions.token.yield}
        />

        <LiquidityPositions
          clmm={positions.liquidity.clmm}
          amm={positions.liquidity.amm}
        />

        <LendingPositions
          tokenPosition={positions.lending.tokenPosition}
          leverageFarmPosition={positions.lending.leverageFarmPosition}
        />
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Transaction Volume</CardTitle>
            <CardDescription>Transaction volume YTD</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <DashboardChart data={transaction_volume} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Latest transactions for this wallet</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentTransactions transactions={tx_history.result.slice(0, 5)} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

