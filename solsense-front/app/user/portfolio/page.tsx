"use client"

import { useEffect, useState, useCallback } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { PortfolioData } from "@/types/portfolio"
import { PortfolioRadar } from "./components/portfolio-radar"
import { DashboardChart } from "./components/dashboard-chart"
import { RecentTransactions } from "./components/recent-transactions"
import { PortfolioSummary } from "./components/wallet-summary"
import { TokenPositions } from "./components/token-positions"
import { LiquidityPositions } from "./components/liquidity-positions"
import { LendingPositions } from "./components/lending-positions"
import { portfolioService } from "@/app/services/portfolio"

export default function DashboardPage() {
  const { connected, publicKey } = useWallet()
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null)

  const fetchPortfolio = useCallback(async () => {
    if (!connected || !publicKey) return

    try {
      const walletAddress = publicKey.toString()
      const data = await portfolioService.fetchPortfolio(walletAddress)
      setPortfolio(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch portfolio data"
      throw new Error(errorMessage)
    }
  }, [connected, publicKey])

  useEffect(() => {
    if (!connected || !publicKey) {
      return
    }

    fetchPortfolio()
  }, [connected, publicKey, fetchPortfolio])

  const updatePortfolio = async () => {
    if (!connected || !publicKey) return

    try {
      const walletAddress = publicKey.toString()
      await portfolioService.updatePortfolio(walletAddress)
      await fetchPortfolio()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update portfolio data"
      throw new Error(errorMessage)
    }
  }

  if (!connected || !publicKey) {
    return null
  }

  if (!portfolio) {
    updatePortfolio()
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-muted-foreground">Updating portfolio data...</p>
        </div>
      </div>
    )
  }

  const { wallet_address, portfolio_data, tx_history, timestamp, transaction_volume, profile_ratings } = portfolio

  if (!portfolio_data || !portfolio_data.summary) {
    const errorMsg = "Invalid portfolio data structure"
    console.error(errorMsg, portfolio_data)
    throw new Error(errorMsg)
  }

  const { summary, positions } = portfolio_data
  const { aggregated } = summary

  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-6">
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <PortfolioSummary
              wallet_address={wallet_address}
              timestamp={timestamp}
              netWorth={aggregated.netWorth}
              estimated24hReward={aggregated.estimated24hReward}
              tokenValue={aggregated.tokenValue}
              defiValue={aggregated.defiValue}
              onUpdate={updatePortfolio}
            />
          </div>

          <div className="lg:col-span-2">
            <PortfolioRadar
              data={[
                {
                  name: "Whale",
                  value: profile_ratings.whale,
                },
                {
                  name: "Hodler",
                  value: profile_ratings.hodler,
                },
                {
                  name: "Flipper",
                  value: profile_ratings.flipper,
                },
                {
                  name: "DeFi",
                  value: profile_ratings.defi_user,
                },
                {
                  name: "Experience",
                  value: profile_ratings.experienced,
                },
              ]}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-9">
        <TokenPositions spot={positions.token.spot} yield={positions.token.yield} />

        <LiquidityPositions clmm={positions.liquidity.clmm} amm={positions.liquidity.amm} />

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

