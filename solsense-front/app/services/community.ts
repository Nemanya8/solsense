import type { PortfolioData } from "@/types/portfolio"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"

export interface Ad {
  id: number
  name: string
  short_description: string
  body: string
  total_balance: number
  remaining_balance: number
  desired_profile: {
    whale: number
    hodler: number
    flipper: number
    defi_user: number
    experienced: number
  }
  impressions: number
  interactions: number
  advertiser_name: string
  created_at: string
}

export const communityService = {
  async fetchMatchingAds(walletAddress: string): Promise<Ad[]> {
    const response = await fetch(`${API_BASE_URL}/api/ads/matching?walletAddress=${walletAddress}`, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch matching ads")
    }

    return response.json()
  },

  async trackImpression(adId: number, walletAddress: string): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/api/ads/${adId}/impression?walletAddress=${walletAddress}`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      }
    )

    if (!response.ok) {
      throw new Error("Failed to track impression")
    }
  },

  async trackInteraction(adId: number, walletAddress: string): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/api/ads/${adId}/interaction?walletAddress=${walletAddress}`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      }
    )

    if (!response.ok) {
      throw new Error("Failed to track interaction")
    }
  },

  async fetchPortfolio(walletAddress: string): Promise<PortfolioData> {
    const response = await fetch(`${API_BASE_URL}/api/portfolio/${walletAddress}`, {
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status} - ${response.statusText}`)
    }

    return response.json()
  }
} 