export interface AssetInfo {
  title: string;
  symbol: string;
  mint: string;
  logoURI?: string;
  underlyings?: AssetInfo[];
}

export interface LiquidityAssetInfo extends AssetInfo {
  underlyings?: AssetInfo[];
}

export interface AssetWithBalance {
  asset: AssetInfo;
  balance: number;
}

export interface BasePosition {
  title: string;
  platform: {
    address: string;
    title: string;
    logoURI?: string;
  };
  valueInUSD: number;
}

export type CurveType = "CONSTANT_PRODUCT" | "STABLE" | "PMM";

export interface AmmPosition extends Omit<BasePosition, "title"> {
  asset: LiquidityAssetInfo;
  curveType: CurveType;
  apr: number | null;
  balance: number;
}

export interface ClmmPosition extends BasePosition {
  poolInfoPda: string;
  underlyings: AssetWithBalance[];
  curveType: CurveType;
  apr: number | null;
  isInRange: boolean;
  rewardAssets: AssetWithBalance[];
  pendingRewardInUSD: number | null;
}

export interface TokenLendingPosition extends Omit<BasePosition, "title"> {
  asset: AssetInfo;
  balance: number;
  apr: number | null;
}

export interface LeverageFarmPosition extends BasePosition {
  asset: AssetInfo;
  debtInUSD: number | null;
}

export interface NFTLendingPosition extends Omit<BasePosition, "title"> {
  mint: string | null;
  nftName: string | null;
  collectionName: string;
  logoURI?: string;
  loanAmount: number;
  loanEndTs: number | null;
  interestAmountInSol: number;
  status: "borrowed" | "offered" | "lending";
}

export interface YieldTokenPosition extends Omit<BasePosition, "title" | "platform"> {
  balance: number;
  decimals: number;
  programId: string;
  priceInUSD: number | null;
  priceChange24hPct: number | null;
  asset: LiquidityAssetInfo;
  apr: number | null;
}

export interface TokenPosition extends Omit<BasePosition, "title" | "platform"> {
  asset: AssetInfo;
  balance: number;
  decimals: number;
  programId: string;
  priceInUSD: number | null;
  priceChange24hPct: number | null;
}

export interface LiquidityResult {
  amm: AmmPosition[];
  clmm: ClmmPosition[];
}

export interface LendingResult {
  tokenPosition: TokenLendingPosition[];
  leverageFarmPosition: LeverageFarmPosition[];
  nftPosition: NFTLendingPosition[];
}

export interface ProfileRatings {
  whale: number
  hodler: number
  flipper: number
  defi_user: number
  experienced: number
}

export interface DetailedTx {
  description: string;
  type: string;
  source: string;
  fee: number;
  feePayer: string;
  signature: string;
  slot: number;
  timestamp: number;
  nativeTransfers: {
    fromUserAccount: string;
    toUserAccount: string;
    amount: number;
  }[];
  tokenTransfers: {
    fromUserAccount: string;
    toUserAccount: string;
    fromTokenAccount: string;
    toTokenAccount: string;
    tokenAmount: number;
    mint: string;
  }[];
  accountData: {
    account: string;
    nativeBalanceChange: number;
    tokenBalanceChanges: {
      userAccount: string;
      tokenAccount: string;
      mint: string;
      rawTokenAmount: {
        tokenAmount: string;
        decimals: number;
      };
    }[];
  }[];
  transactionError?: {
    error: string;
  };
  instructions: {
    accounts: string[];
    data: string;
    programId: string;
    innerInstructions: {
      accounts: string[];
      data: string;
      programId: string;
    }[];
  }[];
  events?: {
    nft?: {
      description: string;
      type: string;
      source: string;
      amount: number;
      fee: number;
      feePayer: string;
      signature: string;
      slot: number;
      timestamp: number;
      saleType?: string;
      buyer?: string;
      seller?: string;
      staker?: string;
      nfts: {
        mint: string;
        tokenStandard: string;
      }[];
    };
    swap?: {
      nativeInput: {
        account: string;
        amount: string;
      };
      nativeOutput: {
        account: string;
        amount: string;
      };
      tokenInputs: {
        userAccount: string;
        tokenAccount: string;
        mint: string;
        rawTokenAmount: {
          tokenAmount: string;
          decimals: number;
        };
      }[];
      tokenOutputs: {
        userAccount: string;
        tokenAccount: string;
        mint: string;
        rawTokenAmount: {
          tokenAmount: string;
          decimals: number;
        };
      }[];
      tokenFees: {
        userAccount: string;
        tokenAccount: string;
        mint: string;
        rawTokenAmount: {
          tokenAmount: string;
          decimals: number;
        };
      }[];
      nativeFees: {
        account: string;
        amount: string;
      }[];
      innerSwaps: {
        tokenInputs: {
          fromUserAccount: string;
          toUserAccount: string;
          fromTokenAccount: string;
          toTokenAccount: string;
          tokenAmount: number;
          mint: string;
        }[];
        tokenOutputs: {
          fromUserAccount: string;
          toUserAccount: string;
          fromTokenAccount: string;
          toTokenAccount: string;
          tokenAmount: number;
          mint: string;
        }[];
        tokenFees: {
          fromUserAccount: string;
          toUserAccount: string;
          fromTokenAccount: string;
          toTokenAccount: string;
          tokenAmount: number;
          mint: string;
        }[];
        nativeFees: {
          fromUserAccount: string;
          toUserAccount: string;
          amount: number;
        }[];
        programInfo: {
          source: string;
          account: string;
          programName: string;
          instructionName: string;
        };
      }[];
    };
  };
}

export interface PortfolioData {
  id: number
  wallet_address: string
  timestamp: string
  earned_rewards: number
  portfolio_data: {
    status: string
    wallet: string
    summary: {
      statuses: {
        [key: string]: {
          [key: string]: {
            asOf: number
            error: string | null
            duration: number
          }
        }
      }
      positions: {
        farm: {
          totalValue: number
          estimated24hReward: number
          totalPendingReward: number
        }
        token: {
          spot: {
            totalValue: number
          }
          yield: {
            totalValue: number
            estimated24hReward: number
          }
        }
        lending: {
          nftPosition: {
            totalValue: number
          }
          tokenPosition: {
            totalValue: number
            estimated24hReward: number
          }
          leverageFarmPosition: {
            totalValue: number
          }
        }
        liquidity: {
          amm: {
            totalValue: number
            estimated24hReward: number
          }
          clmm: {
            totalValue: number
            estimated24hReward: number
            totalPendingReward: number
          }
        }
      }
      staleJobs: string[]
      aggregated: {
        netWorth: number
        nftValue: number
        defiValue: number
        tokenValue: number
        nftDefiValue: number
        estimated24hReward: number
        totalPendingReward: number
      }
    }
    positions: {
      farm: any[]
      token: {
        spot: TokenPosition[]
        yield: YieldTokenPosition[]
      }
      lending: {
        nftPosition: NFTLendingPosition[]
        tokenPosition: TokenLendingPosition[]
        leverageFarmPosition: LeverageFarmPosition[]
      }
      liquidity: {
        amm: AmmPosition[]
        clmm: ClmmPosition[]
      }
    }
  }
  tx_history: {
    id: string
    result: {
      err: any
      memo: string | null
      slot: number
      blockTime: number
      signature: string
      confirmationStatus: string
    }[]
    jsonrpc: string
  }
  transaction_volume: number[]
  profile_ratings: ProfileRatings
  created_at: string
} 