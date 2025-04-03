"use client"

import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, ExternalLink, Users, ArrowUpDown } from "lucide-react"
import type { DetailedTx } from "@/types/portfolio"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import Image from "next/image"

const formatAddress = (address: string) => {
  if (!address) return ""
  return `${address.slice(0, 4)}...${address.slice(-4)}`
}

const formatTimestamp = (timestamp: number) => {
  const date = new Date(timestamp * 1000)
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()

  if (isToday) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
  }
  return date.toLocaleString()
}

const getTokenInfo = (mint: string): { symbol: string; icon?: string } => {
  const knownTokens: { [key: string]: { symbol: string; icon?: string } } = {
    EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v: {
      symbol: "USDC",
      icon: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png",
    },
    So11111111111111111111111111111111111111112: {
      symbol: "SOL",
      icon: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png",
    },
    Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB: {
      symbol: "USDT",
      icon: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB/logo.png",
    },
    DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263: {
      symbol: "BONK",
      icon: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263/logo.png",
    },
    mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So: {
      symbol: "mSOL",
      icon: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So/logo.png",
    },
    "7i5KKsX2weiTkry7jA4ZwSuXGhs5eJBEjY8vVxR4mFNd": {
      symbol: "RAY",
      icon: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/7i5KKsX2weiTkry7jA4ZwSuXGhs5eJBEjY8vVxR4mFNd/logo.png",
    },
    AFbX8oGjGpmVFywbVouvhQSRmiW2aR1mohfahi4Y2AdB: {
      symbol: "GST",
      icon: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/AFbX8oGjGpmVFywbVouvhQSRmiW2aR1mohfahi4Y2AdB/logo.png",
    },
    "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU": {
      symbol: "SAMO",
      icon: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU/logo.png",
    },
    "7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj": {
      symbol: "stSOL",
      icon: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj/logo.png",
    },
    "9n4nbM75x5jWWW7cTXDq4oHMo5xTAeob6skHnRgVtqU8": {
      symbol: "BTC",
      icon: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/9n4nbM75x5jWWW7cTXDq4oHMo5xTAeob6skHnRgVtqU8/logo.png",
    },
    "2FPyTwDZJgcs6YJw3WrXJh5E5XbJa8LhFbQJx5dLhFbQ": {
      symbol: "ETH",
      icon: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/2FPyTwDZJgcs6YJw3WrXJh5E5XbJa8LhFbQJx5dLhFbQ/logo.png",
    },
    J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn: {
      symbol: "J1TO",
      icon: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn/logo.png",
    },
  }
  return knownTokens[mint] || { symbol: formatAddress(mint) }
}

const formatSol = (amount: number) => {
  if (amount > 1_000_000) {
    amount = amount / 1_000_000_000
  }

  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(2)}M SOL`
  } else if (amount >= 1_000) {
    return `${(amount / 1_000).toFixed(2)}K SOL`
  } else {
    return `${amount.toFixed(2)} SOL`
  }
}

const formatTokenAmount = (amount: number, decimals = 9) => {
  const adjustedAmount = amount / Math.pow(10, decimals)
  if (adjustedAmount >= 1_000_000) {
    return `${(adjustedAmount / 1_000_000).toFixed(2)}M`
  } else if (adjustedAmount >= 1_000) {
    return `${(adjustedAmount / 1_000).toFixed(2)}K`
  } else {
    return `${adjustedAmount.toFixed(2)}`
  }
}

const getTransactionDetails = (tx: DetailedTx) => {
  const details: {
    type: string
    from: string[]
    to: string[]
    values: { amount: number; isNative: boolean; decimals?: number; mint?: string }[]
    totalSol: number
    totalTokens: { [mint: string]: number }
    isSuccessful: boolean
  } = {
    type: tx.type || "UNKNOWN",
    from: [],
    to: [],
    values: [],
    totalSol: 0,
    totalTokens: {},
    isSuccessful: !tx.transactionError && tx.transactionError === null,
  }

  if (tx.nativeTransfers && tx.nativeTransfers.length > 0) {
    tx.nativeTransfers.forEach((transfer) => {
      if (!details.from.includes(transfer.fromUserAccount)) {
        details.from.push(transfer.fromUserAccount)
      }
      if (!details.to.includes(transfer.toUserAccount)) {
        details.to.push(transfer.toUserAccount)
      }
      details.values.push({
        amount: transfer.amount,
        isNative: true,
      })
      details.totalSol += transfer.amount
    })
  }

  if (tx.tokenTransfers && tx.tokenTransfers.length > 0) {
    tx.tokenTransfers.forEach((transfer) => {
      if (!details.from.includes(transfer.fromUserAccount)) {
        details.from.push(transfer.fromUserAccount)
      }
      if (!details.to.includes(transfer.toUserAccount)) {
        details.to.push(transfer.toUserAccount)
      }
      details.values.push({
        amount: transfer.tokenAmount,
        isNative: false,
        mint: transfer.mint,
      })
      if (transfer.mint) {
        details.totalTokens[transfer.mint] = (details.totalTokens[transfer.mint] || 0) + transfer.tokenAmount
      }
    })
  }

  if (details.from.length === 0) {
    details.from.push(tx.feePayer)
  }

  return details
}

const AddressList = ({ addresses, label }: { addresses: string[]; label: string }) => {
  if (addresses.length === 0) return null

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="link" className="p-0 h-auto font-medium flex items-center gap-1">
            {addresses.length === 1 ? (
              <>
                {formatAddress(addresses[0])}
                <ExternalLink
                  className="h-3 w-3 ml-1"
                  onClick={(e) => {
                    e.stopPropagation()
                    window.open(`https://solscan.io/account/${addresses[0]}`, "_blank")
                  }}
                />
              </>
            ) : (
              <>
                {label} ({addresses.length})
                <Users className="h-3 w-3 ml-1" />
              </>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-[300px] bg-zinc-900 text-white border-zinc-800">
          <div className="space-y-1">
            {addresses.map((address, index) => (
              <div key={index} className="flex items-center gap-2">
                <span>{formatAddress(address)}</span>
                <ExternalLink
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => window.open(`https://solscan.io/account/${address}`, "_blank")}
                />
              </div>
            ))}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

const ValueDisplay = ({
  values,
  totalSol,
  totalTokens,
}: {
  values: { amount: number; isNative: boolean; decimals?: number; mint?: string }[]
  totalSol: number
  totalTokens: { [mint: string]: number }
}) => {
  if (values.length === 0) return null

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="font-medium">
            {totalSol > 0 && (
              <div className="flex items-center gap-1">
                {formatSol(totalSol)}
                <Image
                  src="https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png"
                  alt="SOL"
                  width={16}
                  height={16}
                  className="rounded-full"
                />
              </div>
            )}
            {Object.entries(totalTokens).map(([mint, amount]) => {
              const tokenInfo = getTokenInfo(mint)
              return (
                <div key={mint} className="flex items-center gap-1">
                  {formatTokenAmount(amount)} {tokenInfo.symbol}
                  {tokenInfo.icon && (
                    <Image
                      src={tokenInfo.icon}
                      alt={tokenInfo.symbol}
                      width={16}
                      height={16}
                      className="rounded-full"
                    />
                  )}
                </div>
              )
            })}
          </div>
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-[300px] bg-zinc-900 text-white border-zinc-800">
          <div className="space-y-1">
            {values.map((value, index) => {
              if (value.isNative) {
                return (
                  <div key={index} className="flex items-center gap-2">
                    <span>{formatSol(value.amount)}</span>
                    <Image
                      src="https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png"
                      alt="SOL"
                      width={16}
                      height={16}
                      className="rounded-full"
                    />
                  </div>
                )
              } else {
                const tokenInfo = getTokenInfo(value.mint || "")
                return (
                  <div key={index} className="flex items-center gap-2">
                    <span>{formatTokenAmount(value.amount, value.decimals)} {tokenInfo.symbol}</span>
                    {tokenInfo.icon && (
                      <Image
                        src={tokenInfo.icon}
                        alt={tokenInfo.symbol}
                        width={16}
                        height={16}
                        className="rounded-full"
                      />
                    )}
                  </div>
                )
              }
            })}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

interface SolanaTransactionsTableProps {
  transactions: DetailedTx[]
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  isLoading?: boolean
  sortBy: string
  sortDirection: "asc" | "desc"
  onSort: (column: string) => void
}

export default function SolanaTransactionsTable({
  transactions,
  currentPage,
  totalPages,
  onPageChange,
  isLoading = false,
  sortBy = "timestamp",
  sortDirection = "desc",
  onSort,
}: SolanaTransactionsTableProps) {
  if (isLoading) {
    return <TransactionsTableSkeleton />
  }

  return (
    <TooltipProvider>
      <div className="w-full">
        <Table>
          <TableCaption>
            {transactions.length > 0
              ? `Showing ${transactions.length} transaction${transactions.length !== 1 ? "s" : ""}`
              : "No transactions found"}
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px] cursor-pointer" onClick={() => onSort("timestamp")}>
                <div className="flex items-center">
                  Time
                  {sortBy === "timestamp" && (
                    <ArrowUpDown className={`ml-1 h-4 w-4 ${sortDirection === "asc" ? "rotate-180" : ""}`} />
                  )}
                </div>
              </TableHead>
              <TableHead className="w-[100px] cursor-pointer" onClick={() => onSort("type")}>
                <div className="flex items-center">
                  Type
                  {sortBy === "type" && (
                    <ArrowUpDown className={`ml-1 h-4 w-4 ${sortDirection === "asc" ? "rotate-180" : ""}`} />
                  )}
                </div>
              </TableHead>
              <TableHead>From</TableHead>
              <TableHead>To</TableHead>
              <TableHead className="cursor-pointer" onClick={() => onSort("value")}>
                <div className="flex items-center">
                  Value
                  {sortBy === "value" && (
                    <ArrowUpDown className={`ml-1 h-4 w-4 ${sortDirection === "asc" ? "rotate-180" : ""}`} />
                  )}
                </div>
              </TableHead>
              <TableHead className="text-right">Signature</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((tx) => {
              const details = getTransactionDetails(tx)
              return (
                <TableRow key={tx.signature} className="group hover:bg-muted/50">
                  <TableCell>
                    <div className="text-sm">{formatTimestamp(tx.timestamp)}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={details.isSuccessful ? "" : "border-red-500/20 text-red-500"}>
                      {details.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <AddressList addresses={details.from} label="From" />
                  </TableCell>
                  <TableCell>
                    <AddressList addresses={details.to} label="To" />
                  </TableCell>
                  <TableCell>
                    <ValueDisplay
                      values={details.values}
                      totalSol={details.totalSol}
                      totalTokens={details.totalTokens}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-1"
                        onClick={() => window.open(`https://explorer.solana.com/tx/${tx.signature}`, "_blank")}
                      >
                        <span className="text-xs">{formatAddress(tx.signature)}</span>
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>

        {totalPages > 1 && (
          <div className="flex items-center justify-between space-x-2 py-4 px-4">
            <div className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}

function TransactionsTableSkeleton() {
  return (
    <div className="w-full">
      <Table>
        <TableCaption>Loading transactions...</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Time</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>From</TableHead>
            <TableHead>To</TableHead>
            <TableHead>Value</TableHead>
            <TableHead className="text-right">Signature</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, index) => (
            <TableRow key={index}>
              <TableCell>
                <div className="h-6 w-16 bg-muted animate-pulse rounded-full" />
              </TableCell>
              <TableCell>
                <div className="h-5 w-24 bg-muted animate-pulse rounded" />
              </TableCell>
              <TableCell>
                <div className="h-5 w-24 bg-muted animate-pulse rounded" />
              </TableCell>
              <TableCell>
                <div className="h-5 w-24 bg-muted animate-pulse rounded" />
              </TableCell>
              <TableCell>
                <div className="h-5 w-20 bg-muted animate-pulse rounded" />
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end">
                  <div className="h-5 w-28 bg-muted animate-pulse rounded" />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="h-8 w-8 bg-muted animate-pulse rounded" />
        <div className="h-5 w-32 bg-muted animate-pulse rounded" />
        <div className="h-8 w-8 bg-muted animate-pulse rounded" />
      </div>
    </div>
  )
}

