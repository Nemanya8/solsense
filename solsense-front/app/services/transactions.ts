import type { DetailedTx } from "@/types/portfolio"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"

interface TransactionsResponse {
  transactions: DetailedTx[]
  total: number
  page: number
  totalPages: number
}

export const transactionsService = {
  async fetchTransactions(walletAddress: string, page: number): Promise<TransactionsResponse> {
    const queryParams = new URLSearchParams({
      page: page.toString(),
    })
    
    const response = await fetch(
      `${API_BASE_URL}/api/portfolio/${walletAddress}/transactions?${queryParams.toString()}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`)
    }

    return response.json()
  }
} 