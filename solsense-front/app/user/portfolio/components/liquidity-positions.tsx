import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { formatCurrency, formatPercentage } from "@/lib/utils"
import Image from "next/image"
import { ClmmPosition, AmmPosition } from "@/types/portfolio"
import { Info } from "lucide-react"

interface LiquidityPositionsProps {
  clmm: ClmmPosition[]
  amm: AmmPosition[]
}

export function LiquidityPositions({ clmm, amm }: LiquidityPositionsProps) {
  return (
    <Card className="lg:col-span-3">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Liquidity Positions</CardTitle>
          <CardDescription>All liquidity positions for this wallet</CardDescription>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-4 w-4 text-muted-foreground hover:text-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="w-80 bg-zinc-950 border-zinc-800 text-zinc-50">
              <p>Your investments in automated market makers (AMMs) and concentrated liquidity positions (CLMMs).</p>
              <ul className="mt-2 space-y-1 text-sm">
                <li>• AMM: Fixed price range pools</li>
                <li>• CLMM: Custom price range positions</li>
                <li>• APR: Annual returns from fees</li>
                <li>• In Range: Active price range status</li>
              </ul>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* CLMM Positions */}
          {clmm.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-3">Concentrated Positions</h3>
              <div className="space-y-4">
                {clmm.map((position, index) => (
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
                              <p className="font-medium">{position?.title || 'Unknown Position'}</p>
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
                                onError={(e) => {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.src = `/platforms/${(position.platform.title || '').toLowerCase()}.png`;
                                }}
                              />
                            ) : (
                              <Image
                                src={`/platforms/${(position?.platform?.title || '').toLowerCase()}.png`}
                                alt={position?.platform?.title || 'Platform'}
                                width={40}
                                height={40}
                                className="rounded-full"
                                onError={(e) => {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><text x="50%" y="50%" font-size="12" text-anchor="middle" dy=".3em">${(position?.platform?.title || 'P').slice(0, 2)}</text></svg>`;
                                }}
                              />
                            )}
                            <div>
                              <p className="font-semibold text-lg">{position?.title || 'Unknown Position'}</p>
                              <p className="text-sm text-zinc-400">{position?.platform?.title || 'Unknown Platform'}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <p className="text-zinc-400 mb-1">Position Value</p>
                              <p className="font-medium">{formatCurrency(position?.valueInUSD || 0)}</p>
                            </div>
                            <div>
                              <p className="text-zinc-400 mb-1">Annual Yield</p>
                              <p className="font-medium text-green-400">{position?.apr ? formatPercentage(position.apr) : 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-zinc-400 mb-1">Pool Type</p>
                              <p className="font-medium">{position?.curveType || 'Unknown'}</p>
                            </div>
                            <div>
                              <p className="text-zinc-400 mb-1">In Range</p>
                              <p className={`font-medium ${position?.isInRange ? "text-green-400" : "text-red-400"}`}>
                                {position?.isInRange ? "Yes" : "No"}
                              </p>
                            </div>
                            {position?.pendingRewardInUSD && (
                              <div>
                                <p className="text-zinc-400 mb-1">Pending Rewards</p>
                                <p className="font-medium text-green-400">{formatCurrency(position.pendingRewardInUSD)}</p>
                              </div>
                            )}
                          </div>
                          {position?.underlyings && position.underlyings.length > 0 && (
                            <div className="pt-2 border-t border-zinc-800">
                              <p className="text-zinc-400 mb-2">Underlying Tokens</p>
                              <div className="space-y-2">
                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                {position.underlyings.map((token: any, idx) => {
                                  const tokenSymbol = 'symbol' in token ? token.symbol : token.asset?.symbol || 'Unknown Token';
                                  const tokenLogoURI = 'logoURI' in token ? token.logoURI : token.asset?.logoURI;
                                  const tokenBalance = 'balance' in token ? token.balance : token.asset?.balance || 0;

                                  return (
                                    <div key={idx} className="flex justify-between items-center">
                                      <div className="flex items-center gap-2">
                                        {tokenLogoURI ? (
                                          <Image
                                            src={tokenLogoURI as string}
                                            alt={tokenSymbol as string}
                                            width={20}
                                            height={20}
                                            className="rounded-full"
                                          />
                                        ) : tokenSymbol !== 'Unknown Token' ? (
                                          <Image
                                            src={`/tokens/${(tokenSymbol as string).toLowerCase()}.png`}
                                            alt={tokenSymbol as string}
                                            width={20}
                                            height={20}
                                            className="rounded-full"
                                            onError={(e) => {
                                              e.currentTarget.onerror = null;
                                              e.currentTarget.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><text x="50%" y="50%" font-size="8" text-anchor="middle" dy=".3em">${(tokenSymbol as string).slice(0, 2)}</text></svg>`;
                                            }}
                                          />
                                        ) : (
                                          <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center">
                                            <span className="text-xs">T</span>
                                          </div>
                                        )}
                                        <span className="text-sm">{tokenSymbol as string}</span>
                                      </div>
                                      <span className="text-sm">{(tokenBalance as number).toFixed(4)}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
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
                                onError={(e) => {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.src = `/platforms/${(position.platform.title || '').toLowerCase()}.png`;
                                }}
                              />
                            ) : (
                              <Image
                                src={`/platforms/${(position?.platform?.title || '').toLowerCase()}.png`}
                                alt={position?.platform?.title || 'Platform'}
                                width={40}
                                height={40}
                                className="rounded-full"
                                onError={(e) => {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><text x="50%" y="50%" font-size="12" text-anchor="middle" dy=".3em">${(position?.platform?.title || 'P').slice(0, 2)}</text></svg>`;
                                }}
                              />
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
                            <div>
                              <p className="text-zinc-400 mb-1">Annual Yield</p>
                              <p className="font-medium text-green-400">{position?.apr ? formatPercentage(position.apr) : 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-zinc-400 mb-1">Pool Type</p>
                              <p className="font-medium">{position?.curveType || 'Unknown'}</p>
                            </div>
                            <div>
                              <p className="text-zinc-400 mb-1">Token Balance</p>
                              <p className="font-medium">{position?.balance?.toFixed(6) || '0.000000'}</p>
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

          {amm.length === 0 && clmm.length === 0 && (
            <p className="text-sm text-muted-foreground">No liquidity positions found</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 