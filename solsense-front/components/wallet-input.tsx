"use client"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface WalletInputProps {
  walletAddress: string
  setWalletAddress: (address: string) => void
  onUpdate: () => Promise<void>
  onGet: () => Promise<void>
  isLoading: boolean
  message: string
}

export function WalletInput({
  walletAddress,
  setWalletAddress,
  onUpdate,
  onGet,
  isLoading,
  message,
}: WalletInputProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          type="text"
          value={walletAddress}
          onChange={(e) => setWalletAddress(e.target.value)}
          placeholder="Enter Solana wallet address"
          className="border border-gray-700 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <div className="flex gap-2">
          <Button
            onClick={onUpdate}
            disabled={isLoading}
            variant="default"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isLoading ? "Updating..." : "Update Portfolio"}
          </Button>
          <Button
            onClick={onGet}
            disabled={isLoading}
            variant="secondary"
            className="bg-green-600 text-white hover:bg-green-700 disabled:bg-green-800"
          >
            {isLoading ? "Loading..." : "Get Portfolio"}
          </Button>
        </div>
      </div>

      {message && (
        <div className={`text-sm ${message.includes("Error") ? "text-red-400" : "text-green-400"}`}>{message}</div>
      )}
    </div>
  )
}

