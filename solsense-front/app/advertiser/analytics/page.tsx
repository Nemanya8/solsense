"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts'
import api from "@/lib/axios"
import { Button } from "@/components/ui/button"
import { useAuth } from "../auth-provider"
import { useRouter } from "next/navigation"

interface DailyStats {
  date: string
  impressions: number
  interactions: number
}

interface TopAd {
  id: number
  name: string
  impressions: number
  interactions: number
  remaining_balance: number
  total_balance: number
  interaction_rate: number
}

interface ProfileDistribution {
  avg_whale: number
  avg_hodler: number
  avg_flipper: number
  avg_defi_user: number
  avg_experienced: number
}

interface AnalyticsData {
  totalStats: {
    total_impressions: number
    total_interactions: number
    total_remaining_balance: number
    total_balance: number
  }
  dailyStats: DailyStats[]
  topAds: TopAd[]
  profileDistribution: ProfileDistribution
}

export default function AnalyticsPage() {
  const { advertiser, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!authLoading && !advertiser) {
      router.push('/advertiser')
      return
    }

    const fetchAnalytics = async () => {
      if (!advertiser) return

      try {
        setLoading(true)
        setError("")
        const response = await api.get('/ads/analytics')
        setData(response.data)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        console.error('Error fetching analytics:', error)
        setError(error.response?.data?.error || 
          error.message || 
          "Failed to load analytics data. Please try again later."
        )
      } finally {
        setLoading(false)
      }
    }

    if (!authLoading && advertiser) {
      fetchAnalytics()
    }
  }, [advertiser, authLoading, router])

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Show loading state while fetching analytics data
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading analytics data...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-scr  een">
        <div className="text-center max-w-md mx-auto">
          <p className="text-red-500 mb-4">{error || "No data available"}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    )
  }

  const { totalStats, dailyStats, topAds, profileDistribution } = data

  // Format daily stats for the chart
  const formattedDailyStats = dailyStats.map(stat => ({
    ...stat,
    date: new Date(stat.date).toLocaleDateString(),
    impressions: Number(stat.impressions),
    interactions: Number(stat.interactions)
  }));

  const formattedTopAds = topAds.map((ad: TopAd) => ({
    ...ad,
    name: ad.name || 'Unnamed Ad',
    impressions: Number(ad.impressions),
    interactions: Number(ad.interactions)
  }));

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Ad Performance Analytics</h1>
        <p className="text-muted-foreground">Track your ads performance and user engagement</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Impressions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.total_impressions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Interactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.total_interactions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Interaction Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalStats.total_impressions > 0
                ? ((totalStats.total_interactions / totalStats.total_impressions) * 100).toFixed(2)
                : 0}%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalStats.total_remaining_balance.toFixed(2)} / ${totalStats.total_balance.toFixed(2)}
            </div>
            <Progress 
              value={(totalStats.total_remaining_balance / totalStats.total_balance) * 100} 
              className="mt-2"
            />
          </CardContent>
        </Card>
      </div>

      {/* Daily Stats Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Performance (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            {formattedDailyStats.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={formattedDailyStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      border: '1px solid #ccc',
                      borderRadius: '4px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="impressions" 
                    stroke="#8884d8" 
                    name="Impressions"
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="interactions" 
                    stroke="#82ca9d" 
                    name="Interactions"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">No daily data available</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Top Performing Ads */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Ads</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            {formattedTopAds.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={formattedTopAds}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      border: '1px solid #ccc',
                      borderRadius: '4px'
                    }}
                  />
                  <Bar 
                    dataKey="impressions" 
                    fill="#8884d8" 
                    name="Impressions"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar 
                    dataKey="interactions" 
                    fill="#82ca9d" 
                    name="Interactions"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">No ad data available</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* User Profile Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>User Profile Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <h4 className="text-sm font-medium">Whale</h4>
              <Progress 
                value={profileDistribution.avg_whale} 
                className="mt-2"
              />
            </div>
            <div>
              <h4 className="text-sm font-medium">Hodler</h4>
              <Progress 
                value={profileDistribution.avg_hodler} 
                className="mt-2"
              />
            </div>
            <div>
              <h4 className="text-sm font-medium">Flipper</h4>
              <Progress 
                value={profileDistribution.avg_flipper} 
                className="mt-2"
              />
            </div>
            <div>
              <h4 className="text-sm font-medium">DeFi User</h4>
              <Progress 
                value={profileDistribution.avg_defi_user} 
                className="mt-2"
              />
            </div>
            <div>
              <h4 className="text-sm font-medium">Experienced</h4>
              <Progress 
                value={profileDistribution.avg_experienced} 
                className="mt-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
  