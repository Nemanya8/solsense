"use client"

import { useState } from "react"
import type { PortfolioData } from "@/types/portfolio"
import { WalletInput } from "@/components/wallet-input"
import { PortfolioSummary } from "@/components/portfolio-summary"
import { TokenHoldings } from "@/components/token-holdings"
import { YieldPositions } from "@/components/yield-positions"
import { LendingPositions } from "@/components/lending-positions"
import { LiquidityPositions } from "@/components/liquidity-positions"
import { TransactionChart } from "@/components/transaction-chart"
import { portfolioService } from "@/lib/portfolio-service"

export default function Home() {
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null)
  const [walletAddress, setWalletAddress] = useState("")
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handlePost = async () => {
    if (!walletAddress) {
      setMessage("Please enter a wallet address")
      return
    }

    setIsLoading(true)
    try {
      const data = await portfolioService.updatePortfolio(walletAddress)
      setPortfolioData(data)
      setMessage("Portfolio data updated successfully!")
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Error updating portfolio data")
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGet = async () => {
    if (!walletAddress) {
      setMessage("Please enter a wallet address")
      return
    }

    setIsLoading(true)
    try {
      const data = await portfolioService.getPortfolio(walletAddress)
      setPortfolioData(data)
      setMessage("Portfolio data retrieved successfully!")
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Error retrieving portfolio data")
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getModuleDistributionData = () => {
    if (!portfolioData?.portfolio_data.summary.positions) return []

    const { token, lending, liquidity } = portfolioData.portfolio_data.summary.positions

    return [
      {
        name: "Spot",
        value: token.spot.totalValue,
        color: "#3B82F6", // blue
      },
      {
        name: "Yield",
        value: token.yield.totalValue,
        color: "#10B981", // green
      },
      {
        name: "Lending",
        value: lending.tokenPosition.totalValue,
        color: "#F59E0B", // amber
      },
      {
        name: "Liquidity",
        value: liquidity.clmm.totalValue,
        color: "#8B5CF6", // purple
      },
    ].filter((item) => item.value > 0)
  }

  return (
    <div className="p-8 bg-gray-900 min-h-screen">
      <h1 className="text-2xl font-bold mb-4 text-white">Solana Portfolio Manager</h1>

      <WalletInput
        walletAddress={walletAddress}
        setWalletAddress={setWalletAddress}
        onUpdate={handlePost}
        onGet={handleGet}
        isLoading={isLoading}
        message={message}
      />

      {portfolioData && (
        <div className="mt-8 space-y-6">
          <PortfolioSummary
            summary={portfolioData.portfolio_data.summary}
            moduleDistribution={getModuleDistributionData()}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TokenHoldings tokens={portfolioData.portfolio_data.positions.token.spot} />
            <YieldPositions positions={portfolioData.portfolio_data.positions.token.yield} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LendingPositions positions={portfolioData.portfolio_data.positions.lending.tokenPosition} />
            <LiquidityPositions positions={portfolioData.portfolio_data.positions.liquidity.clmm} />
          </div>

          <TransactionChart transactions={portfolioData.tx_history.result} />
        </div>
      )}
    </div>
  )
}

