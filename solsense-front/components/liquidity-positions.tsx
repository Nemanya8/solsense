"use client"

import type { LiquidityPosition } from "@/types/portfolio"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatters } from "@/lib/formatters"

interface LiquidityPositionsProps {
  positions: LiquidityPosition[]
}

export function LiquidityPositions({ positions }: LiquidityPositionsProps) {
  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Liquidity Positions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {positions.map((position, index) => (
            <div key={index} className="p-4 bg-gray-700 rounded border border-gray-600">
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium text-white">{position.title}</div>
                <div className="text-sm text-gray-400">{position.platform.title}</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-400">Value</div>
                  <div className="font-medium text-white">{formatters.formatUSD(position.valueInUSD)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">APR</div>
                  <div className="font-medium text-green-400">{formatters.formatPercentage(position.apr)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Pending Rewards</div>
                  <div className="font-medium text-white">{formatters.formatUSD(position.pendingRewardInUSD)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Current Price</div>
                  <div className="font-medium text-white">{formatters.formatUSD(position.currentPrice)}</div>
                </div>
              </div>
              <div className="mt-2">
                <div className="text-sm text-gray-400">Underlying Assets:</div>
                <div className="flex flex-wrap gap-2 mt-1">
                  {position.underlyings.map((asset, idx) => (
                    <div key={idx} className="flex items-center bg-gray-800 p-2 rounded border border-gray-600">
                      <img
                        src={asset.logoURI || "/placeholder.svg"}
                        alt={asset.symbol}
                        className="w-4 h-4 rounded-full mr-2"
                      />
                      <span className="text-sm text-white">
                        {asset.symbol}: {asset.balance}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

