export interface Asset {
  symbol: string
  title: string
  logoURI: string
  balance?: number
}

export interface Platform {
  title: string
}

export interface TokenPosition {
  asset: Asset
  valueInUSD: number
  priceChange24hPct: number
}

export interface YieldPosition {
  asset: Asset
  valueInUSD: number
  apr: number
}

export interface LendingPosition {
  asset: Asset
  platform: Platform
  valueInUSD: number
  apr: number
}

export interface LiquidityPosition {
  title: string
  platform: Platform
  valueInUSD: number
  apr: number
  pendingRewardInUSD: number
  currentPrice: number
  underlyings: Asset[]
}

export interface PortfolioSummary {
  aggregated: {
    netWorth: number
    totalPendingReward: number
  }
  positions: {
    token: {
      spot: {
        totalValue: number
      }
      yield: {
        totalValue: number
      }
    }
    lending: {
      tokenPosition: {
        totalValue: number
      }
    }
    liquidity: {
      clmm: {
        totalValue: number
      }
    }
  }
}

export interface PortfolioPositions {
  token: {
    spot: TokenPosition[]
    yield: YieldPosition[]
  }
  lending: {
    tokenPosition: LendingPosition[]
  }
  liquidity: {
    clmm: LiquidityPosition[]
  }
}

export interface Transaction {
  blockTime: number
  signature: string
  err: any
}

export interface TransactionHistory {
  result: Transaction[]
}

export interface PortfolioData {
  portfolio_data: {
    summary: PortfolioSummary
    positions: PortfolioPositions
  }
  tx_history: TransactionHistory
}

