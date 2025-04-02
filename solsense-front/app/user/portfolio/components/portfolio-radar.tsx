import { Card, CardContent } from "@/components/ui/card"
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, Tooltip } from "recharts"

interface PortfolioRadarProps {
  data: {
    name: string
    value: number
  }[]
}

const categoryDescriptions: { [key: string]: string } = {
  Whale: "Your portfolio size and value",
  Hodler: "Your long-term holding behavior",
  Flipper: "Your trading frequency and yield",
  DeFi: "Your DeFi protocol participation",
  Experience: "Your overall trading experience"
}

export function PortfolioRadar({ data }: PortfolioRadarProps) {
  const chartData = data.map((item) => ({
    metric: item.name,
    score: item.value,
  }))

  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const metric = payload[0].payload.metric
      return (
        <div className="bg-background border rounded-lg shadow-lg p-3">
          <p className="font-medium">{metric}</p>
          <p className="text-sm text-muted-foreground">
            Score: {payload[0].value.toFixed(1)}
          </p>
          <p className="text-xs text-muted-foreground/80 mt-1">
            {categoryDescriptions[metric]}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <Card className="h-full">
      <CardContent>
        <div className="w-full h-[250px] flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" gridType="polygon" />
              <PolarAngleAxis
                dataKey="metric"
                tick={{
                  fill: "hsl(var(--muted-foreground))",
                  fontSize: 11,
                  fontWeight: "bold",
                }}
                axisLine={false}
                tickLine={false}
              />
              <Radar
                name="Score"
                dataKey="score"
                stroke="hsl(var(--primary))"
                fill="url(#colorGradient)"
                fillOpacity={0.6}
                dot={true}
              />
              <Tooltip content={<CustomTooltip />} />
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
                </linearGradient>
              </defs>
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

