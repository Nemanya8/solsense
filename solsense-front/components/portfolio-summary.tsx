"use client"

import type { PortfolioSummary as PortfolioSummaryType } from "@/types/portfolio"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { formatters } from "@/lib/formatters"

interface PortfolioSummaryProps {
  summary: PortfolioSummaryType
  moduleDistribution: Array<{
    name: string
    value: number
    color: string
  }>
}

export function PortfolioSummary({ summary, moduleDistribution }: PortfolioSummaryProps) {
  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Portfolio Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <StatCard title="Total Net Worth" value={formatters.formatUSD(summary.aggregated.netWorth)} />
            <StatCard title="Spot Value" value={formatters.formatUSD(summary.positions.token.spot.totalValue)} />
            <StatCard title="Yield Value" value={formatters.formatUSD(summary.positions.token.yield.totalValue)} />
            <StatCard
              title="Lending Value"
              value={formatters.formatUSD(summary.positions.lending.tokenPosition.totalValue)}
            />
            <StatCard
              title="Liquidity Value"
              value={formatters.formatUSD(summary.positions.liquidity.clmm.totalValue)}
            />
            <StatCard title="Pending Rewards" value={formatters.formatUSD(summary.aggregated.totalPendingReward)} />
          </div>

          {/* Module Distribution Chart */}
          <Card className="bg-gray-700 border-gray-600">
            <CardHeader>
              <CardTitle className="text-white text-center text-lg">Asset Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={moduleDistribution}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                    >
                      {moduleDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: "#1F2937", border: "1px solid #374151", color: "#F3F4F6" }}
                      formatter={(value: number) => formatters.formatUSD(value)}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  )
}

interface StatCardProps {
  title: string
  value: string
}

function StatCard({ title, value }: StatCardProps) {
  return (
    <div className="bg-gray-700 p-4 rounded border border-gray-600">
      <div className="text-sm text-gray-400">{title}</div>
      <div className="text-2xl font-bold text-white">{value}</div>
    </div>
  )
}

