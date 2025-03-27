"use client"

import type { LendingPosition } from "@/types/portfolio"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatters } from "@/lib/formatters"

interface LendingPositionsProps {
  positions: LendingPosition[]
}

export function LendingPositions({ positions }: LendingPositionsProps) {
  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Lending Positions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {positions.map((position, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-gray-700 rounded border border-gray-600"
            >
              <div className="flex items-center">
                <img
                  src={position.asset.logoURI || "/placeholder.svg"}
                  alt={position.asset.symbol}
                  className="w-8 h-8 rounded-full mr-3"
                />
                <div>
                  <div className="font-medium text-white">{position.asset.symbol}</div>
                  <div className="text-sm text-gray-400">{position.platform.title}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium text-white">{formatters.formatUSD(position.valueInUSD)}</div>
                <div className="text-sm text-green-400">{formatters.formatPercentage(position.apr)} APR</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

