"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useWallet } from "@solana/wallet-adapter-react"
import SolanaTransactionsTable from "./components/tx-table"
import type { DetailedTx } from "@/types/portfolio"
import { transactionsService } from "@/app/services/transactions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Search, Filter, RefreshCw } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

// Transaction types for filtering
const TRANSACTION_TYPES = [
  "ALL",
  "SWAP",
  "TRANSFER",
  "NFT_SALE",
  "NFT_MINT",
  "NFT_TRANSFER",
  "STAKE",
  "UNSTAKE",
  "UNKNOWN",
]

export default function TransactionsPage() {
  const router = useRouter()
  const { connected, publicKey } = useWallet()
  const [transactions, setTransactions] = useState<DetailedTx[]>([])
  const [allTransactions, setAllTransactions] = useState<DetailedTx[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState<number>(1)
  const [totalPages, setTotalPages] = useState<number>(1)

  // Filtering and sorting states
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [typeFilter, setTypeFilter] = useState<string>("ALL")
  const [sortBy, setSortBy] = useState<string>("timestamp")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [isFiltersVisible, setIsFiltersVisible] = useState<boolean>(false)

  useEffect(() => {
    if (!connected || !publicKey) return

    const fetchTransactions = async () => {
      setLoading(true)
      setError(null)

      try {
        const data = await transactionsService.fetchTransactions(publicKey.toString(), page)
        setAllTransactions(data.transactions)
        setTotalPages(data.totalPages)
        console.log("Transactions fetched:", data.transactions)
      } catch (err) {
        console.error("Failed to fetch transactions:", err)
        setError("Failed to fetch transactions. Please try again.")
        setAllTransactions([])
      } finally {
        setLoading(false)
      }
    }

    fetchTransactions()
  }, [connected, publicKey, page, router])

  // Apply filters and sorting
  useEffect(() => {
    let filteredTxs = [...allTransactions]

    // Apply type filter
    if (typeFilter !== "ALL") {
      filteredTxs = filteredTxs.filter((tx) => tx.type === typeFilter)
    }

    // Apply search filter (on signature, from/to addresses)
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filteredTxs = filteredTxs.filter((tx) => {
        // Search in signature
        if (tx.signature.toLowerCase().includes(query)) return true

        // Search in native transfers
        if (
          tx.nativeTransfers?.some(
            (transfer) =>
              transfer.fromUserAccount.toLowerCase().includes(query) ||
              transfer.toUserAccount.toLowerCase().includes(query),
          )
        )
          return true

        // Search in token transfers
        if (
          tx.tokenTransfers?.some(
            (transfer) =>
              transfer.fromUserAccount.toLowerCase().includes(query) ||
              transfer.toUserAccount.toLowerCase().includes(query) ||
              transfer.mint?.toLowerCase().includes(query),
          )
        )
          return true

        return false
      })
    }

    // Apply sorting
    filteredTxs.sort((a, b) => {
      let valueA, valueB

      switch (sortBy) {
        case "timestamp":
          valueA = a.timestamp
          valueB = b.timestamp
          break
        case "type":
          valueA = a.type || "UNKNOWN"
          valueB = b.type || "UNKNOWN"
          break
        case "value":
          // Sort by total SOL value (simplified)
          valueA = a.nativeTransfers?.reduce((sum, transfer) => sum + transfer.amount, 0) || 0
          valueB = b.nativeTransfers?.reduce((sum, transfer) => sum + transfer.amount, 0) || 0
          break
        default:
          valueA = a.timestamp
          valueB = b.timestamp
      }

      if (sortDirection === "asc") {
        return valueA > valueB ? 1 : -1
      } else {
        return valueA < valueB ? 1 : -1
      }
    })

    setTransactions(filteredTxs)
  }, [allTransactions, searchQuery, typeFilter, sortBy, sortDirection])

  const handleRefresh = async () => {
    if (!connected || !publicKey) return
    setPage(1)
    setLoading(true)
    setError(null)

    try {
      const data = await transactionsService.fetchTransactions(publicKey.toString(), 1)
      setAllTransactions(data.transactions)
      setTotalPages(data.totalPages)
    } catch (err) {
      console.error("Failed to refresh transactions:", err)
      setError("Failed to refresh transactions. Please try again.")
      setAllTransactions([])
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const handleSort = (column: string) => {
    if (sortBy === column) {
      // Toggle direction if clicking the same column
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))
    } else {
      // Set new column and default to descending
      setSortBy(column)
      setSortDirection("desc")
    }
  }

  const toggleFilters = () => {
    setIsFiltersVisible((prev) => !prev)
  }

  // Count transactions by type for summary
  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    allTransactions.forEach((tx) => {
      const type = tx.type || "UNKNOWN"
      counts[type] = (counts[type] || 0) + 1
    })
    return counts
  }, [allTransactions])

  if (!connected || !publicKey) {
    return null
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="text-xl">Transaction History</CardTitle>

            <div className="flex items-center gap-2">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by address, signature..."
                  className="pl-8 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <Button variant="outline" size="icon" onClick={toggleFilters} className="relative">
                <Filter className="h-4 w-4" />
                {isFiltersVisible && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-primary" />}
              </Button>

              <Button variant="outline" size="icon" onClick={handleRefresh} disabled={loading}>
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>
        </CardHeader>

        {isFiltersVisible && (
          <CardContent className="pb-3 pt-0 border-b">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type-filter">Transaction Type</Label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger id="type-filter">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    {TRANSACTION_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type} {typeCounts[type] && type !== "ALL" ? `(${typeCounts[type]})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {typeFilter !== "ALL" && (
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge variant="secondary" className="flex items-center gap-1">
                  Type: {typeFilter}
                  <Button variant="ghost" size="icon" className="h-4 w-4 p-0 ml-1" onClick={() => setTypeFilter("ALL")}>
                    ×
                  </Button>
                </Badge>
              </div>
            )}
          </CardContent>
        )}

        <CardContent className="p-0">
          {error && (
            <div className="text-center py-12 text-destructive">
              <p>{error}</p>
            </div>
          )}

          {loading ? (
            <div className="p-4">
              <div className="flex items-center space-x-4 mb-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4 mb-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <SolanaTransactionsTable
              transactions={transactions}
              currentPage={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              isLoading={loading}
              sortBy={sortBy}
              sortDirection={sortDirection}
              onSort={handleSort}
            />
          )}

          {!loading && transactions.length === 0 && !error && (
            <div className="text-center py-12 text-muted-foreground">
              {searchQuery || typeFilter !== "ALL" ? "No transactions match your filters" : "No transactions found"}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

