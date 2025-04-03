"use client"

import { createContext, useContext, ReactNode } from "react"
import { useWallet } from "@solana/wallet-adapter-react"

type WalletStateContextType = {
  isConnected: boolean
  publicKey: string | null
}

const WalletStateContext = createContext<WalletStateContextType | undefined>(undefined)

export function WalletStateProvider({ children }: { children: ReactNode }) {
  const { connected, publicKey } = useWallet()

  return (
    <WalletStateContext.Provider
      value={{
        isConnected: connected,
        publicKey: publicKey?.toString() || null,
      }}
    >
      {children}
    </WalletStateContext.Provider>
  )
}

export function useWalletState() {
  const context = useContext(WalletStateContext)
  if (context === undefined) {
    throw new Error("useWalletState must be used within a WalletStateProvider")
  }
  return context
} 