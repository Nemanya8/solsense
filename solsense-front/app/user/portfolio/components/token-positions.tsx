import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency, formatPercentage } from "@/lib/utils"
import Image from "next/image"
import { TokenPosition as PortfolioTokenPosition, YieldTokenPosition } from "@/types/portfolio"

interface TokenPositionsProps {
  spot: PortfolioTokenPosition[]
  yield: YieldTokenPosition[]
}

export function TokenPositions({ spot, yield: yieldPositions }: TokenPositionsProps) {
  return (
    <Card className="lg:col-span-3">
      <CardHeader>
        <CardTitle>Token Positions</CardTitle>
        <CardDescription>All token positions for this wallet</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Spot Positions */}
          <div>
            <h3 className="text-sm font-medium mb-3">Spot Tokens</h3>
            <div className="space-y-4">
              {spot.map((token, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    {token.asset.logoURI ? (
                      <Image
                        src={token.asset.logoURI}
                        alt={token.asset.symbol}
                        width={24}
                        height={24}
                        className="rounded-full"
                        unoptimized={token.asset.logoURI.startsWith('data:')}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><text x="50%" y="50%" font-size="10" text-anchor="middle" dy=".3em">${token.asset.symbol.slice(0, 2)}</text></svg>`;
                        }}
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                        <span className="text-xs font-medium">{token.asset.symbol.slice(0, 2)}</span>
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{token.asset.symbol}</p>
                      <p className="text-sm text-muted-foreground">{token.balance.toFixed(4)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{token.priceInUSD ? formatCurrency(token.priceInUSD * token.balance) : 'N/A'}</p>
                    <p className={`text-sm ${token.priceChange24hPct && token.priceChange24hPct >= 0 ? "text-green-500" : "text-red-500"}`}>
                      {token.priceChange24hPct ? formatPercentage(token.priceChange24hPct) : 'N/A'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Yield Positions */}
          {yieldPositions.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-3">Yield Tokens</h3>
              <div className="space-y-4">
                {yieldPositions.map((token, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      {token.asset.logoURI ? (
                        <Image
                          src={token.asset.logoURI}
                          alt={token.asset.symbol}
                          width={24}
                          height={24}
                          className="rounded-full"
                          unoptimized={token.asset.logoURI.startsWith('data:')}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><text x="50%" y="50%" font-size="10" text-anchor="middle" dy=".3em">${token.asset.symbol.slice(0, 2)}</text></svg>`;
                          }}
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                          <span className="text-xs font-medium">{token.asset.symbol.slice(0, 2)}</span>
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{token.asset.symbol}</p>
                        <p className="text-sm text-muted-foreground">{token.balance.toFixed(4)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{token.priceInUSD ? formatCurrency(token.priceInUSD * token.balance) : 'N/A'}</p>
                      <p className="text-sm text-green-500">APR: {token.apr ? formatPercentage(token.apr) : 'N/A'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 