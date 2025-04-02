import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { formatCurrency, formatPercentage } from "@/lib/utils"
import Image from "next/image"
import { TokenLendingPosition, LeverageFarmPosition } from "@/types/portfolio"
import { Info } from "lucide-react"

interface LendingPositionsProps {
  tokenPosition: TokenLendingPosition[]
  leverageFarmPosition: LeverageFarmPosition[]
}

export function LendingPositions({ tokenPosition, leverageFarmPosition }: LendingPositionsProps) {
  return (
    <Card className="lg:col-span-3">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Lending Positions</CardTitle>
          <CardDescription>All lending positions for this wallet</CardDescription>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-4 w-4 text-muted-foreground hover:text-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="w-80 bg-zinc-950 border-zinc-800 text-zinc-50">
              <p>Your assets in lending protocols and leverage farming.</p>
              <ul className="mt-2 space-y-1 text-sm">
                <li>• Lending: Assets earning interest</li>
                <li>• Leverage: Borrowed assets for yield</li>
                <li>• APR: Annual returns from lending</li>
                <li>• Debt: Value of borrowed assets</li>
              </ul>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Token Lending Positions */}
          {tokenPosition.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-3">Token Lending</h3>
              <div className="space-y-4">
                {[...tokenPosition].sort((a, b) => (b.valueInUSD || 0) - (a.valueInUSD || 0)).map((position, index) => (
                  <TooltipProvider key={index}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex justify-between items-center p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors border border-transparent hover:border-muted-foreground/20">
                          <div className="flex items-center gap-2">
                            {position?.platform?.logoURI ? (
                              <Image
                                src={position.platform.logoURI}
                                alt={position.platform.title || 'Platform'}
                                width={24}
                                height={24}
                                className="rounded-full"
                                onError={(e) => {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.src = `/platforms/${(position.platform.title || '').toLowerCase()}.png`;
                                }}
                              />
                            ) : (
                              <Image
                                src={`/platforms/${(position?.platform?.title || '').toLowerCase()}.png`}
                                alt={position?.platform?.title || 'Platform'}
                                width={24}
                                height={24}
                                className="rounded-full"
                                onError={(e) => {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><text x="50%" y="50%" font-size="10" text-anchor="middle" dy=".3em">${(position?.platform?.title || 'P').slice(0, 2)}</text></svg>`;
                                }}
                              />
                            )}
                            <div>
                              <p className="font-medium">{position?.asset?.symbol || 'Unknown Token'}</p>
                              <p className="text-sm text-muted-foreground">{position?.platform?.title || 'Unknown Platform'}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{formatCurrency(position?.valueInUSD || 0)}</p>
                            <p className="text-sm text-green-500">APR: {position?.apr ? formatPercentage(position.apr) : 'N/A'}</p>
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="w-80 bg-zinc-950 border-zinc-800 text-zinc-50">
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 pb-2 border-b border-zinc-800">
                            {position?.platform?.logoURI ? (
                              <Image
                                src={position.platform.logoURI}
                                alt={position.platform.title || 'Platform'}
                                width={40}
                                height={40}
                                className="rounded-full"
                              />
                            ) : position?.platform?.title ? (
                              <Image
                                src={`/platforms/${position.platform.title.toLowerCase()}.png`}
                                alt={position.platform.title}
                                width={40}
                                height={40}
                                className="rounded-full"
                                onError={(e) => {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><text x="50%" y="50%" font-size="12" text-anchor="middle" dy=".3em">${position.platform.title.slice(0, 2)}</text></svg>`;
                                }}
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                                <span className="text-sm">P</span>
                              </div>
                            )}
                            <div>
                              <p className="font-semibold text-lg">{position?.asset?.title || 'Unknown Token'}</p>
                              <p className="text-sm text-zinc-400">{position?.platform?.title || 'Unknown Platform'}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <p className="text-zinc-400 mb-1">Token Balance</p>
                              <p className="font-medium">{position?.balance?.toFixed(6) || '0.000000'}</p>
                            </div>
                            <div>
                              <p className="text-zinc-400 mb-1">Position Value</p>
                              <p className="font-medium">{formatCurrency(position?.valueInUSD || 0)}</p>
                            </div>
                            <div>
                              <p className="text-zinc-400 mb-1">Annual Yield</p>
                              <p className="font-medium text-green-400">{position?.apr ? formatPercentage(position.apr) : 'N/A'}</p>
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

          {/* Leverage Farm Positions */}
          {leverageFarmPosition.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-3">Leverage Farming</h3>
              <div className="space-y-4">
                {[...leverageFarmPosition].sort((a, b) => (b.valueInUSD || 0) - (a.valueInUSD || 0)).map((position, index) => (
                  <TooltipProvider key={index}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex justify-between items-center p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors border border-transparent hover:border-muted-foreground/20">
                          <div className="flex items-center gap-2">
                            {position?.platform?.logoURI ? (
                              <Image
                                src={position.platform.logoURI}
                                alt={position.platform.title || 'Platform'}
                                width={24}
                                height={24}
                                className="rounded-full"
                                onError={(e) => {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.src = `/platforms/${(position.platform.title || '').toLowerCase()}.png`;
                                }}
                              />
                            ) : (
                              <Image
                                src={`/platforms/${(position?.platform?.title || '').toLowerCase()}.png`}
                                alt={position?.platform?.title || 'Platform'}
                                width={24}
                                height={24}
                                className="rounded-full"
                                onError={(e) => {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><text x="50%" y="50%" font-size="10" text-anchor="middle" dy=".3em">${(position?.platform?.title || 'P').slice(0, 2)}</text></svg>`;
                                }}
                              />
                            )}
                            <div>
                              <p className="font-medium">{position?.asset?.symbol || 'Unknown Token'}</p>
                              <p className="text-sm text-muted-foreground">{position?.platform?.title || 'Unknown Platform'}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{formatCurrency(position?.valueInUSD || 0)}</p>
                            {position?.debtInUSD && (
                              <p className="text-sm text-red-500">Debt: {formatCurrency(position.debtInUSD)}</p>
                            )}
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="w-80 bg-zinc-950 border-zinc-800 text-zinc-50">
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 pb-2 border-b border-zinc-800">
                            {position?.platform?.logoURI ? (
                              <Image
                                src={position.platform.logoURI}
                                alt={position.platform.title || 'Platform'}
                                width={40}
                                height={40}
                                className="rounded-full"
                              />
                            ) : position?.platform?.title ? (
                              <Image
                                src={`/platforms/${position.platform.title.toLowerCase()}.png`}
                                alt={position.platform.title}
                                width={40}
                                height={40}
                                className="rounded-full"
                                onError={(e) => {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><text x="50%" y="50%" font-size="12" text-anchor="middle" dy=".3em">${position.platform.title.slice(0, 2)}</text></svg>`;
                                }}
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                                <span className="text-sm">P</span>
                              </div>
                            )}
                            <div>
                              <p className="font-semibold text-lg">{position?.asset?.title || 'Unknown Token'}</p>
                              <p className="text-sm text-zinc-400">{position?.platform?.title || 'Unknown Platform'}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <p className="text-zinc-400 mb-1">Position Value</p>
                              <p className="font-medium">{formatCurrency(position?.valueInUSD || 0)}</p>
                            </div>
                            {position?.debtInUSD && (
                              <div>
                                <p className="text-zinc-400 mb-1">Debt Value</p>
                                <p className="font-medium text-red-400">{formatCurrency(position.debtInUSD)}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
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