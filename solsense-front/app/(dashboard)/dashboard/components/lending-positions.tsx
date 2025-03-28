import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency, formatPercentage } from "@/lib/utils"
import Image from "next/image"
import { TokenLendingPosition, LeverageFarmPosition } from "@/types/portfolio"

interface LendingPositionsProps {
  tokenPosition: TokenLendingPosition[]
  leverageFarmPosition: LeverageFarmPosition[]
}

export function LendingPositions({ tokenPosition, leverageFarmPosition }: LendingPositionsProps) {
  return (
    <Card className="lg:col-span-3">
      <CardHeader>
        <CardTitle>Lending Positions</CardTitle>
        <CardDescription>All lending positions for this wallet</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Token Lending Positions */}
          {tokenPosition.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-3">Token Lending</h3>
              <div className="space-y-4">
                {tokenPosition.map((position, index) => (
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

          {/* Leverage Farm Positions */}
          {leverageFarmPosition.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-3">Leverage Farming</h3>
              <div className="space-y-4">
                {leverageFarmPosition.map((position, index) => (
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
                      <p className="text-sm text-red-500">Debt: {position.debtInUSD ? formatCurrency(position.debtInUSD) : 'N/A'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tokenPosition.length === 0 && leverageFarmPosition.length === 0 && (
            <p className="text-sm text-muted-foreground">No lending positions found</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 