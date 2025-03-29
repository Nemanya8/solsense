"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useWallet } from "@solana/wallet-adapter-react"
import SolanaTransactionsTable from "./components/tx-table"
import type { DetailedTx } from "@/types/portfolio"

interface TransactionsResponse {
  transactions: DetailedTx[]
  total: number
  page: number
  totalPages: number
}

export default function TransactionsPage() {
  const router = useRouter()
  const { connected, publicKey } = useWallet()
  const [transactions, setTransactions] = useState<DetailedTx[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState<number>(1)
  const [totalPages, setTotalPages] = useState<number>(1)

  useEffect(() => {
    if (!connected || !publicKey) {
      router.push("/")
      return
    }

    const fetchTransactions = async () => {
      setLoading(true)
      setError(null)

      try {
        const queryParams = new URLSearchParams({
          page: page.toString(),
        })
        const response = await fetch(
          `http://localhost:4000/api/portfolios/${publicKey.toString()}/transactions?${queryParams.toString()}`,
        )

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`)
        }

        const data: TransactionsResponse = await response.json()

        setTransactions(data.transactions)
        setTotalPages(data.totalPages)
      } catch (err) {
        console.error("Failed to fetch transactions:", err)
        setError("Failed to fetch transactions. Please try again.")
        setTransactions([])
      } finally {
        setLoading(false)
      }
    }

    fetchTransactions()
  }, [connected, publicKey, page, router])

  if (!connected || !publicKey) {
    return null
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="text-center py-12 text-destructive">
          <p>{error}</p>
        </div>
      )}

      <SolanaTransactionsTable
        transactions={transactions}
        currentPage={page}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        isLoading={loading}
      />

      {!loading && transactions.length === 0 && !error && (
        <div className="text-center py-12 text-muted-foreground">No transactions found</div>
      )}
    </div>
  )
}

