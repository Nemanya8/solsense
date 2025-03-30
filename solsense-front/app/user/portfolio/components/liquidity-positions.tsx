import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency, formatPercentage } from "@/lib/utils"
import Image from "next/image"
import { ClmmPosition, AmmPosition } from "@/types/portfolio"

interface LiquidityPositionsProps {
  clmm: ClmmPosition[]
  amm: AmmPosition[]
}

export function LiquidityPositions({ clmm, amm }: LiquidityPositionsProps) {
  return (
    <Card className="lg:col-span-3">
      <CardHeader>
        <CardTitle>Liquidity Positions</CardTitle>
        <CardDescription>All liquidity positions for this wallet</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* CLMM Positions */}
          {clmm.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-3">Concentrated Positions</h3>
              <div className="space-y-4">
                {clmm.map((position, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2">
                        {position.platform.logoURI ? (
                          <Image
                            src={position.platform.logoURI}
                            alt={position.platform.title}
                            width={24}
                            height={24}
                            className="rounded-full"
                          />
                        ) : (
                          <Image
                            src={`/${position.platform.title.toLowerCase()}.png`}
                            alt={position.platform.title}
                            width={24}
                            height={24}
                            className="rounded-full"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><text x="50%" y="50%" font-size="10" text-anchor="middle" dy=".3em">${position.platform.title.slice(0, 2)}</text></svg>`;
                            }}
                          />
                        )}
                        <div>
                          <p className="font-medium">{position.title}</p>
                          <p className="text-sm text-muted-foreground">{position.platform.title}</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(position.valueInUSD)}</p>
                      <p className="text-sm text-green-500">APR: {position.apr ? formatPercentage(position.apr) : 'N/A'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AMM Positions */}
          {amm.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-3">AMM Positions</h3>
              <div className="space-y-4">
                {amm.map((position, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2">
                        {position.platform.logoURI ? (
                          <Image
                            src={position.platform.logoURI}
                            alt={position.platform.title}
                            width={24}
                            height={24}
                            className="rounded-full"
                          />
                        ) : (
                          <Image
                            src={`/${position.platform.title.toLowerCase()}.png`}
                            alt={position.platform.title}
                            width={24}
                            height={24}
                            className="rounded-full"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><text x="50%" y="50%" font-size="10" text-anchor="middle" dy=".3em">${position.platform.title.slice(0, 2)}</text></svg>`;
                            }}
                          />
                        )}
                        <div>
                          <p className="font-medium">{position.asset.symbol}</p>
                          <p className="text-sm text-muted-foreground">{position.platform.title}</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(position.valueInUSD)}</p>
                      <p className="text-sm text-green-500">APR: {position.apr ? formatPercentage(position.apr) : 'N/A'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {amm.length === 0 && clmm.length === 0 && (
            <p className="text-sm text-muted-foreground">No liquidity positions found</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 