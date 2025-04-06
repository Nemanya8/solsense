"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, ArrowRight, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { useWallet } from "@solana/wallet-adapter-react"
import { PublicKey, Transaction, Connection } from "@solana/web3.js"
import { 
  getAssociatedTokenAddress, 
  createTransferCheckedInstruction, 
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction
} from "@solana/spl-token"
import { CustomWalletButton } from "./wallet/wallet-button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import api from "@/lib/axios"

interface ProfileRatings {
  whale: number;
  hodler: number;
  flipper: number;
  defi_user: number;
  experienced: number;
}

export function CreateAdDialog() {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [currentStep, setCurrentStep] = useState("details")
  const [adData, setAdData] = useState<{
    name: string;
    short_description: string;
    body: string;
    total_balance: number;
    desired_profile: ProfileRatings;
  } | null>(null)
  const { publicKey, signTransaction } = useWallet()
  const connection = new Connection(
    `https://mainnet.helius-rpc.com/?api-key=${process.env.NEXT_PUBLIC_HELIUS_API_KEY || "613fcffa-dfbc-40b5-bfb6-4c0ad3d400cd"}`,
    {
      commitment: "confirmed",
      confirmTransactionInitialTimeout: 60000
    }
  )

  const handleDetailsSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const name = formData.get("name") as string
    const shortDescription = formData.get("shortDescription") as string
    const body = formData.get("body") as string
    const totalBalance = parseFloat(formData.get("totalBalance") as string)

    setAdData({
      name,
      short_description: shortDescription,
      body,
      total_balance: totalBalance,
      desired_profile: {
        whale: 0,
        hodler: 0,
        flipper: 0,
        defi_user: 0,
        experienced: 0,
      },
    })
    setCurrentStep("audience")
  }

  const handleAudienceSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!adData) return

    const formData = new FormData(e.currentTarget)
    const desiredProfile: ProfileRatings = {
      whale: parseFloat(formData.get("whale") as string),
      hodler: parseFloat(formData.get("hodler") as string),
      flipper: parseFloat(formData.get("flipper") as string),
      defi_user: parseFloat(formData.get("defi_user") as string),
      experienced: parseFloat(formData.get("experienced") as string),
    }

    setAdData({
      ...adData,
      desired_profile: desiredProfile,
    })
    setCurrentStep("payment")
  }

  const handlePayment = async () => {
    if (!publicKey || !adData || !signTransaction) {
      setError("Wallet connection required")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      // Validate platform USDC account address
      const platformUsdcAccount = process.env.NEXT_PUBLIC_PLATFORM_USDC_ACCOUNT
      if (!platformUsdcAccount) {
        throw new Error("Platform USDC account address not configured")
      }

      try {
        new PublicKey(platformUsdcAccount)
      } catch (e) {
        console.error(e)
        throw new Error("Invalid platform USDC account address format")
      }

      // Get USDC token account
      const usdcMint = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v") // USDC mint address
      const userTokenAccount = await getAssociatedTokenAddress(usdcMint, publicKey)
      const destinationTokenAccount = await getAssociatedTokenAddress(
        usdcMint,
        new PublicKey(platformUsdcAccount)
      )

      // Check if the token account exists and get balance
      try {
        const balance = await connection.getTokenAccountBalance(userTokenAccount)
        const userUsdcBalance = Number(balance.value.amount) / Math.pow(10, 6)
        
        if (userUsdcBalance < adData.total_balance) {
          throw new Error(`Insufficient USDC balance. You have ${userUsdcBalance} USDC but need ${adData.total_balance} USDC`)
        }
      } catch (e) {
        console.error(e)
        throw new Error("Unable to find USDC in your wallet. Please make sure you have USDC tokens.")
      }

      // Create payment transaction
      const paymentAmount = BigInt(Math.floor(adData.total_balance * 1000000)) // Convert to USDC decimals (6)
      const transaction = new Transaction()

      try {
        // Get the latest blockhash
        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash()
        
        // Set up transaction
        transaction.feePayer = publicKey
        transaction.recentBlockhash = blockhash

        // Check if destination token account exists
        const destinationAccountInfo = await connection.getAccountInfo(destinationTokenAccount)
        
        // If destination account doesn't exist, create it
        if (!destinationAccountInfo) {
          transaction.add(
            createAssociatedTokenAccountInstruction(
              publicKey, // payer
              destinationTokenAccount, // ata
              new PublicKey(platformUsdcAccount), // owner
              usdcMint, // mint
              TOKEN_PROGRAM_ID,
              ASSOCIATED_TOKEN_PROGRAM_ID
            )
          )
        }
        
        // Add the transfer instruction
        transaction.add(
          createTransferCheckedInstruction(
            userTokenAccount, // source
            usdcMint, // mint (token address)
            destinationTokenAccount, // destination
            publicKey, // owner of source account
            paymentAmount, // amount to transfer (in base units)
            6, // decimals
            [], // multisigners
            TOKEN_PROGRAM_ID // programId
          )
        )

        // Sign and send transaction
        const signedTx = await signTransaction(transaction)
        const signature = await connection.sendRawTransaction(signedTx.serialize())
        
        // Wait for confirmation with specific commitment and timeout
        const confirmation = await connection.confirmTransaction({
          signature,
          blockhash,
          lastValidBlockHeight
        })

        if (confirmation.value.err) {
          throw new Error("Transaction failed to confirm")
        }

        // Create ad after successful payment
        const response = await api.post("/ads", adData)

        if (response.data) {
          setOpen(false)
          router.refresh()
        }
      //eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (rpcError: any) {
        if (rpcError.message?.includes("403")) {
          setError("Failed to connect to Solana network. Please try again later.")
        } else {
          throw rpcError
        }
      }
      //eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      setError(error.message || "Failed to process payment")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create New Ad
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Ad</DialogTitle>
          <DialogDescription>
            Create a new advertising campaign with your desired target audience.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={currentStep} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Ad Details</TabsTrigger>
            <TabsTrigger value="audience">Target Audience</TabsTrigger>
            <TabsTrigger value="payment">Payment</TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <form onSubmit={handleDetailsSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Ad Name</Label>
                <Input id="name" name="name" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="shortDescription">Short Description</Label>
                <Input id="shortDescription" name="shortDescription" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="body">Ad Content (Markdown)</Label>
                <Textarea id="body" name="body" required className="min-h-[200px]" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="totalBalance">Total Balance (USDC)</Label>
                <Input id="totalBalance" name="totalBalance" type="number" step="0.01" required />
              </div>

              <Button type="submit" className="w-full">
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="audience">
            <form onSubmit={handleAudienceSubmit} className="space-y-4">
              <div className="space-y-4">
                <Label>Desired User Profile Ratings</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="whale">Whale Rating (0-100)</Label>
                    <Input id="whale" name="whale" type="number" min="0" max="100" step="1" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hodler">Hodler Rating (0-100)</Label>
                    <Input id="hodler" name="hodler" type="number" min="0" max="100" step="1" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="flipper">Flipper Rating (0-100)</Label>
                    <Input id="flipper" name="flipper" type="number" min="0" max="100" step="1" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="defi_user">DeFi User Rating (0-100)</Label>
                    <Input id="defi_user" name="defi_user" type="number" min="0" max="100" step="1" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="experienced">Experienced Rating (0-100)</Label>
                    <Input id="experienced" name="experienced" type="number" min="0" max="100" step="1" required />
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => setCurrentStep("details")}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button type="submit">
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="payment">
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Confirm Payment</h3>
                <p className="text-muted-foreground">
                  Please confirm the payment of {adData?.total_balance} USDC to create your ad.
                </p>
              </div>

              {!publicKey ? (
                <div className="flex justify-center">
                  <CustomWalletButton />
                </div>
              ) : (
                <Button 
                  onClick={handlePayment} 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? "Processing Payment..." : "Pay with USDC"}
                </Button>
              )}

              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => setCurrentStep("audience")}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
} 