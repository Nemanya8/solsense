"use client"

import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react"
import type { DetailedTx } from "@/types/portfolio"

// Helper function to format addresses (truncate for display)
const formatAddress = (address: string) => {
  if (!address) return ""
  return `${address.slice(0, 4)}...${address.slice(-4)}`
}

// Helper function to format SOL amount with appropriate scaling
const formatSol = (amount: number) => {
  // Convert to SOL from lamports if needed (if value is very large)
  if (amount > 1_000_000) {
    amount = amount / 1_000_000_000
  }

  // Format based on size
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(2)}M SOL`
  } else if (amount >= 1_000) {
    return `${(amount / 1_000).toFixed(2)}K SOL`
  } else if (amount < 0.001) {
    return `${amount.toFixed(6)} SOL`
  } else {
    return `${amount.toFixed(4)} SOL`
  }
}

// Helper function to get transaction details
const getTransactionDetails = (tx: DetailedTx) => {
  // For native transfers
  if (tx.nativeTransfers && tx.nativeTransfers.length > 0) {
    return {
      from: tx.nativeTransfers[0].fromUserAccount,
      to: tx.nativeTransfers[0].toUserAccount,
      value: tx.nativeTransfers[0].amount,
    }
  }

  // For token transfers
  if (tx.tokenTransfers && tx.tokenTransfers.length > 0) {
    return {
      from: tx.tokenTransfers[0].fromUserAccount,
      to: tx.tokenTransfers[0].toUserAccount,
      value: tx.tokenTransfers[0].tokenAmount,
    }
  }

  // Default case
  return {
    from: tx.feePayer,
    to: "",
    value: 0,
  }
}

interface SolanaTransactionsTableProps {
  transactions: DetailedTx[]
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  isLoading?: boolean
}

export default function SolanaTransactionsTable({
  transactions,
  currentPage,
  totalPages,
  onPageChange,
  isLoading = false,
}: SolanaTransactionsTableProps) {
  if (isLoading) {
    return <TransactionsTableSkeleton />
  }

  return (
    <div className="w-full">
      <Table>
        <TableCaption>Solana transactions</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Status</TableHead>
            <TableHead>From</TableHead>
            <TableHead>To</TableHead>
            <TableHead>Value</TableHead>
            <TableHead className="text-right">Signature</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((tx) => {
            const { from, to, value } = getTransactionDetails(tx)
            const isSuccessful = !tx.transactionError

            return (
              <TableRow key={tx.signature} className="group hover:bg-muted/50">
                <TableCell>
                  <Badge className={isSuccessful ? "bg-green-500 text-white" : "bg-red-500 text-white"}>
                    {isSuccessful ? "Success" : "Failed"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button
                    variant="link"
                    className="p-0 h-auto font-medium"
                    onClick={() => window.open(`https://solscan.io/account/${from}`, "_blank")}
                  >
                    {formatAddress(from)}
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </Button>
                </TableCell>
                <TableCell>
                  <Button
                    variant="link"
                    className="p-0 h-auto font-medium"
                    onClick={() => window.open(`https://solscan.io/account/${to}`, "_blank")}
                  >
                    {formatAddress(to)}
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </Button>
                </TableCell>
                <TableCell>
                  <div className="font-medium">{formatSol(value)}</div>
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
        <div className="flex items-center justify-end space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous Page</span>
          </Button>
          <div className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next Page</span>
          </Button>
        </div>
      )}
    </div>
  )
}

function TransactionsTableSkeleton() {
  return (
    <div className="w-full">
      <Table>
        <TableCaption>Loading transactions...</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Status</TableHead>
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

