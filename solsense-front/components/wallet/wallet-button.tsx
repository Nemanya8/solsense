"use client"

import { useState, useRef, useEffect } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { WalletName } from "@solana/wallet-adapter-base"
import { Check, ChevronDown, Copy, LogOut, WalletIcon, Loader2} from "lucide-react"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

const WALLET_ADDRESS_KEY = "solana_wallet_address"

export function CustomWalletButton() {
  const { connected, publicKey, disconnect, select, wallet, wallets, connecting } = useWallet()

  const [menuOpen, setMenuOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showWalletSelector, setShowWalletSelector] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (connected && publicKey) {
      const address = publicKey.toString()
      localStorage.setItem(WALLET_ADDRESS_KEY, address)
      window.dispatchEvent(
        new CustomEvent("customStorageChange", {
          detail: { key: WALLET_ADDRESS_KEY, newValue: address },
        })
      )
    }
  }, [connected, publicKey])

  useEffect(() => {
    if (!connected) {
      localStorage.removeItem(WALLET_ADDRESS_KEY)
      window.dispatchEvent(
        new CustomEvent("customStorageChange", {
          detail: { key: WALLET_ADDRESS_KEY, newValue: null },
        })
      )
    }
  }, [connected])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      setMenuOpen(false)
      setShowWalletSelector(false)
    }
  }, [])

  const copyAddress = async () => {
    if (publicKey) {
      try {
        await navigator.clipboard.writeText(publicKey.toString())
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      } catch (error) {
        console.error("Failed to copy address:", error)
      }
    }
  }

  const openWalletSelector = () => {
    setShowWalletSelector(true)
    setMenuOpen(false)
  }

  const handleWalletSelect = async (walletName: WalletName) => {
    try {
      await select(walletName)
      setShowWalletSelector(false)
    } catch (error) {
      console.error("Error selecting wallet:", error)
    }
  }

  const handleDisconnect = async () => {
    try {
      await disconnect()
      setMenuOpen(false)
      localStorage.removeItem(WALLET_ADDRESS_KEY)
    } catch (error) {
      console.error("Error during disconnect:", error)
      localStorage.removeItem(WALLET_ADDRESS_KEY)
    }
  }

  if (!connected) {
    return (
      <>
        <button
          onClick={openWalletSelector}
          className="flex w-full items-center gap-3 rounded-md px-4 py-3 text-base font-medium hover:bg-accent hover:text-accent-foreground text-muted-foreground"
        >
          {connecting ? (
            <>
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Connecting...</span>
            </>
          ) : (
            <>
              <WalletIcon className="h-6 w-6" />
              <span>Connect Wallet</span>
            </>
          )}
        </button>

        <Dialog open={showWalletSelector} onOpenChange={setShowWalletSelector}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Select Wallet</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {wallets.map((wallet) => (
                <button
                  key={wallet.adapter.name}
                  onClick={() => handleWalletSelect(wallet.adapter.name as WalletName)}
                  className="flex items-center gap-3 rounded-md px-4 py-3 text-base font-medium hover:bg-accent hover:text-accent-foreground text-muted-foreground"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                    {wallet.adapter.icon ? (
                      <img
                        src={wallet.adapter.icon}
                        alt={wallet.adapter.name}
                        className="h-5 w-5 rounded-full"
                      />
                    ) : (
                      <WalletIcon className="h-6 w-6" />
                    )}
                  </div>
                  <span>{wallet.adapter.name}</span>
                </button>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </>
    )
  }

  const shortAddress = publicKey ? `${publicKey.toString().slice(0, 4)}...${publicKey.toString().slice(-4)}` : ""

  return (
    <>
      <div className="relative w-full" ref={menuRef}>
        {/* Dropdown Menu */}
        {menuOpen && (
          <div className="absolute bottom-full left-0 right-0 z-10 mb-1 origin-bottom-right rounded-md border bg-background shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="py-1">
              <button
                onClick={copyAddress}
                className="flex w-full items-center gap-3 px-4 py-3 text-sm hover:bg-accent hover:text-accent-foreground text-muted-foreground"
              >
                {copied ? (
                  <>
                    <Check className="h-6 w-6 text-green-500" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-6 w-6" />
                    <span>Copy Address</span>
                  </>
                )}
              </button>

              <button
                onClick={openWalletSelector}
                className="flex w-full items-center gap-3 px-4 py-3 text-sm hover:bg-accent hover:text-accent-foreground text-muted-foreground"
              >
                <WalletIcon className="h-6 w-6" />
                <span>Change Wallet</span>
              </button>

              <button
                onClick={handleDisconnect}
                className="flex w-full items-center gap-3 px-4 py-3 text-sm hover:bg-accent hover:text-accent-foreground text-red-500"
              >
                <LogOut className="h-6 w-6" />
                <span>Disconnect</span>
              </button>
            </div>
          </div>
        )}

        {/* Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex w-full items-center gap-3 rounded-md px-4 py-3 text-base font-medium hover:bg-accent hover:text-accent-foreground text-muted-foreground"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
              {wallet?.adapter.icon ? (
                <img
                  src={wallet.adapter.icon}
                  alt={wallet.adapter.name}
                  className="h-5 w-5 rounded-full"
                />
              ) : (
                <WalletIcon className="h-6 w-6" />
              )}
            </div>
            <span>{shortAddress}</span>
          </div>
          <ChevronDown className={cn("h-4 w-4 transition-transform ml-auto", menuOpen ? "rotate-180" : "")} />
        </button>
      </div>

      {/* Wallet Selector Dialog */}
      <Dialog open={showWalletSelector} onOpenChange={setShowWalletSelector}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select Wallet</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {wallets.map((wallet) => (
              <button
                key={wallet.adapter.name}
                onClick={() => handleWalletSelect(wallet.adapter.name as WalletName)}
                className="flex items-center gap-3 rounded-md px-4 py-3 text-base font-medium hover:bg-accent hover:text-accent-foreground text-muted-foreground"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                  {wallet.adapter.icon ? (
                    <img
                      src={wallet.adapter.icon}
                      alt={wallet.adapter.name}
                      className="h-5 w-5 rounded-full"
                    />
                  ) : (
                    <WalletIcon className="h-6 w-6" />
                  )}
                </div>
                <span>{wallet.adapter.name}</span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

