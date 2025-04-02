import type { PortfolioData } from "@/types/portfolio"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"

export const portfolioService = {
  async fetchPortfolio(walletAddress: string): Promise<PortfolioData> {
    const response = await fetch(`${API_BASE_URL}/api/portfolio/${walletAddress}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status} - ${response.statusText}`)
    }

    const data = await response.json()

    if (!data || !data.portfolio_data) {
      throw new Error("Invalid portfolio data structure received from API")
    }

    return data
  },

  async updatePortfolio(walletAddress: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/portfolio/${walletAddress}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to update portfolio data: ${response.status}`)
    }
  }
} 