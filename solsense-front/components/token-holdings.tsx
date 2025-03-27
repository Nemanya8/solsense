"use client"

import type { TokenPosition } from "@/types/portfolio"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatters } from "@/lib/formatters"

interface TokenHoldingsProps {
  tokens: TokenPosition[]
}

export function TokenHoldings({ tokens }: TokenHoldingsProps) {
  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Token Holdings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tokens.map((token, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-gray-700 rounded border border-gray-600"
            >
              <div className="flex items-center">
                <img
                  src={token.asset.logoURI || "/placeholder.svg"}
                  alt={token.asset.symbol}
                  className="w-8 h-8 rounded-full mr-3"
                />
                <div>
                  <div className="font-medium text-white">{token.asset.symbol}</div>
                  <div className="text-sm text-gray-400">{token.asset.title}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium text-white">{formatters.formatUSD(token.valueInUSD)}</div>
                <div className={`text-sm ${token.priceChange24hPct >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {formatters.formatPercentage(token.priceChange24hPct)} 24h
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

