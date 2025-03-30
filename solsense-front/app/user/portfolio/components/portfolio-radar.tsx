import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts'

interface PortfolioRadarProps {
  data: {
    name: string
    value: number
  }[]
}

export function PortfolioRadar({ data }: PortfolioRadarProps) {
  const chartData = data.map(item => ({
    metric: item.name,
    score: item.value
  }))

  return (
    <div className="w-full h-[200px] flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="60%" data={chartData}>
          <PolarGrid 
            stroke="rgba(255,255,255,0.1)" 
            gridType="polygon"
          />
          <PolarAngleAxis 
            dataKey="metric" 
            tick={{ 
              fill: 'hsl(var(--muted-foreground))', 
              fontSize: 11, 
              fontWeight: 'bold' 
            }}
            axisLine={false}
            tickLine={false}
          />
          <PolarRadiusAxis 
            domain={[0, 100]} 
            hide={true}
            tick={false}
          />
          <Radar
            name="Score"
            dataKey="score"
            stroke="hsl(var(--primary))"
            fill="url(#colorGradient)"
            fillOpacity={0.6}
            dot={false}
          />
          <defs>
            <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.6} />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
            </linearGradient>
          </defs>
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}

