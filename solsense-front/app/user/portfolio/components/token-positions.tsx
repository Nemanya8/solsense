import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { formatCurrency, formatPercentage } from "@/lib/utils"
import Image from "next/image"
import { TokenPosition as PortfolioTokenPosition, YieldTokenPosition } from "@/types/portfolio"
import { Info } from "lucide-react"

interface TokenPositionsProps {
  spot: PortfolioTokenPosition[]
  yield: YieldTokenPosition[]
}

export function TokenPositions({ spot, yield: yieldPositions }: TokenPositionsProps) {
  return (
    <Card className="lg:col-span-3">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Token Positions</CardTitle>
          <CardDescription>All token positions for this wallet</CardDescription>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-4 w-4 text-muted-foreground hover:text-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="w-80 bg-zinc-950 border-zinc-800 text-zinc-50">
              <p>Your token holdings in spot and yield-generating positions.</p>
              <ul className="mt-2 space-y-1 text-sm">
                <li>• Spot: Regular token holdings</li>
                <li>• Yield: Staked tokens earning rewards</li>
                <li>• APR: Annual returns from staking</li>
                <li>• 24h: Price change in last 24 hours</li>
              </ul>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Spot Positions */}
          <div>
            <h3 className="text-sm font-medium mb-3">Spot Tokens</h3>
            <div className="space-y-4">
              {[...spot].sort((a, b) => {
                const valueA = a.priceInUSD ? a.priceInUSD * a.balance : 0;
                const valueB = b.priceInUSD ? b.priceInUSD * b.balance : 0;
                return valueB - valueA;
              }).map((token, index) => (
                <TooltipProvider key={index}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex justify-between items-center p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors border border-transparent hover:border-muted-foreground/20">
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
                    </TooltipTrigger>
                    <TooltipContent className="w-80 bg-zinc-950 border-zinc-800 text-zinc-50">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 pb-2 border-b border-zinc-800">
                          {token.asset.logoURI ? (
                            <Image
                              src={token.asset.logoURI}
                              alt={token.asset.symbol}
                              width={40}
                              height={40}
                              className="rounded-full"
                              unoptimized={token.asset.logoURI.startsWith('data:')}
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center">
                              <span className="text-sm font-medium">{token.asset.symbol.slice(0, 2)}</span>
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-lg">{token.asset.title}</p>
                            <p className="text-sm text-zinc-400">{token.asset.symbol}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-zinc-400 mb-1">Token Balance</p>
                            <p className="font-medium">{token.balance.toFixed(6)}</p>
                          </div>
                          <div>
                            <p className="text-zinc-400 mb-1">Current Price</p>
                            <p className="font-medium">{token.priceInUSD ? formatCurrency(token.priceInUSD) : 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-zinc-400 mb-1">Total Value</p>
                            <p className="font-medium">{token.priceInUSD ? formatCurrency(token.priceInUSD * token.balance) : 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-zinc-400 mb-1">24h Price Change</p>
                            <p className={`font-medium ${token.priceChange24hPct && token.priceChange24hPct >= 0 ? "text-green-400" : "text-red-400"}`}>
                              {token.priceChange24hPct ? formatPercentage(token.priceChange24hPct) : 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          </div>

          {/* Yield Positions */}
          {yieldPositions.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-3">Yield Tokens</h3>
              <div className="space-y-4">
                {[...yieldPositions].sort((a, b) => {
                  const valueA = a.priceInUSD ? a.priceInUSD * a.balance : 0;
                  const valueB = b.priceInUSD ? b.priceInUSD * b.balance : 0;
                  return valueB - valueA;
                }).map((token, index) => (
                  <TooltipProvider key={index}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex justify-between items-center p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors border border-transparent hover:border-muted-foreground/20">
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
                      </TooltipTrigger>
                      <TooltipContent className="w-80 bg-zinc-950 border-zinc-800 text-zinc-50">
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 pb-2 border-b border-zinc-800">
                            {token.asset.logoURI ? (
                              <Image
                                src={token.asset.logoURI}
                                alt={token.asset.symbol}
                                width={40}
                                height={40}
                                className="rounded-full"
                                unoptimized={token.asset.logoURI.startsWith('data:')}
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center">
                                <span className="text-sm font-medium">{token.asset.symbol.slice(0, 2)}</span>
                              </div>
                            )}
                            <div>
                              <p className="font-semibold text-lg">{token.asset.title}</p>
                              <p className="text-sm text-zinc-400">{token.asset.symbol}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <p className="text-zinc-400 mb-1">Token Balance</p>
                              <p className="font-medium">{token.balance.toFixed(6)}</p>
                            </div>
                            <div>
                              <p className="text-zinc-400 mb-1">Current Price</p>
                              <p className="font-medium">{token.priceInUSD ? formatCurrency(token.priceInUSD) : 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-zinc-400 mb-1">Total Value</p>
                              <p className="font-medium">{token.priceInUSD ? formatCurrency(token.priceInUSD * token.balance) : 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-zinc-400 mb-1">Annual Yield</p>
                              <p className="font-medium text-green-400">{token.apr ? formatPercentage(token.apr) : 'N/A'}</p>
                            </div>
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 