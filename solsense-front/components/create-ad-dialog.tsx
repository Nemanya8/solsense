"use client"

import type React from "react"

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
import { Plus, ArrowRight, ArrowLeft, ChevronDown, ChevronUp } from "lucide-react"
import { useRouter } from "next/navigation"
import { useWallet } from "@solana/wallet-adapter-react"
import { PublicKey, Transaction, Connection } from "@solana/web3.js"
import {
  getAssociatedTokenAddress,
  createTransferCheckedInstruction,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
} from "@solana/spl-token"
import { CustomWalletButton } from "./wallet/wallet-button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import api from "@/lib/axios"

interface ProfileRatings {
  whale: number
  hodler: number
  flipper: number
  defi_user: number
  experienced: number
}

interface UserPreset {
  name: string
  description: string
  ratings: ProfileRatings
}

export function CreateAdDialog() {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [currentStep, setCurrentStep] = useState("details")
  const [contentType, setContentType] = useState<"text" | "html">("text")
  const [previewVisible, setPreviewVisible] = useState(false)
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [adData, setAdData] = useState<{
    name: string
    short_description: string
    body: string
    content_type: "text" | "html"
    total_balance: number
    desired_profile: ProfileRatings
  } | null>(null)
  const { publicKey, signTransaction } = useWallet()
  const connection = new Connection(
    `https://mainnet.helius-rpc.com/?api-key=${process.env.NEXT_PUBLIC_HELIUS_API_KEY || "613fcffa-dfbc-40b5-bfb6-4c0ad3d400cd"}`,
    {
      commitment: "confirmed",
      confirmTransactionInitialTimeout: 60000,
    },
  )

  const userPresets: UserPreset[] = [
    {
      name: "Whale Investors",
      description: "High-value investors with large holdings",
      ratings: {
        whale: 90,
        hodler: 70,
        flipper: 30,
        defi_user: 50,
        experienced: 80,
      },
    },
    {
      name: "Long-term Hodlers",
      description: "Patient investors who hold through market cycles",
      ratings: {
        whale: 40,
        hodler: 95,
        flipper: 10,
        defi_user: 30,
        experienced: 60,
      },
    },
    {
      name: "Active Traders",
      description: "Frequent traders looking for short-term gains",
      ratings: {
        whale: 30,
        hodler: 20,
        flipper: 90,
        defi_user: 40,
        experienced: 70,
      },
    },
    {
      name: "DeFi Enthusiasts",
      description: "Users actively participating in DeFi protocols",
      ratings: {
        whale: 50,
        hodler: 40,
        flipper: 50,
        defi_user: 95,
        experienced: 75,
      },
    },
    {
      name: "Crypto Newcomers",
      description: "Recent entrants to the crypto space",
      ratings: {
        whale: 10,
        hodler: 60,
        flipper: 30,
        defi_user: 20,
        experienced: 15,
      },
    },
  ]

  const handleDetailsSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const name = formData.get("name") as string
    const shortDescription = formData.get("shortDescription") as string
    const body = formData.get("body") as string
    const totalBalance = Number.parseFloat(formData.get("totalBalance") as string)

    setAdData({
      name,
      short_description: shortDescription,
      body,
      content_type: contentType,
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
      whale: Number.parseFloat(formData.get("whale") as string) || adData.desired_profile.whale,
      hodler: Number.parseFloat(formData.get("hodler") as string) || adData.desired_profile.hodler,
      flipper: Number.parseFloat(formData.get("flipper") as string) || adData.desired_profile.flipper,
      defi_user: Number.parseFloat(formData.get("defi_user") as string) || adData.desired_profile.defi_user,
      experienced: Number.parseFloat(formData.get("experienced") as string) || adData.desired_profile.experienced,
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
      const destinationTokenAccount = await getAssociatedTokenAddress(usdcMint, new PublicKey(platformUsdcAccount))

      // Check if the token account exists and get balance
      try {
        const balance = await connection.getTokenAccountBalance(userTokenAccount)
        const userUsdcBalance = Number(balance.value.amount) / Math.pow(10, 6)

        if (userUsdcBalance < adData.total_balance) {
          throw new Error(
            `Insufficient USDC balance. You have ${userUsdcBalance} USDC but need ${adData.total_balance} USDC`,
          )
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
              ASSOCIATED_TOKEN_PROGRAM_ID,
            ),
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
            TOKEN_PROGRAM_ID, // programId
          ),
        )

        // Sign and send transaction
        const signedTx = await signTransaction(transaction)
        const signature = await connection.sendRawTransaction(signedTx.serialize())

        // Wait for confirmation with specific commitment and timeout
        const confirmation = await connection.confirmTransaction({
          signature,
          blockhash,
          lastValidBlockHeight,
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

  const applyPreset = (preset: UserPreset) => {
    if (!adData) return

    // Update the adData state with the preset values
    setAdData({
      ...adData,
      desired_profile: preset.ratings,
    })

    // Directly update the form input values
    const whaleInput = document.getElementById("whale") as HTMLInputElement
    const hodlerInput = document.getElementById("hodler") as HTMLInputElement
    const flipperInput = document.getElementById("flipper") as HTMLInputElement
    const defiUserInput = document.getElementById("defi_user") as HTMLInputElement
    const experiencedInput = document.getElementById("experienced") as HTMLInputElement

    if (whaleInput) whaleInput.value = preset.ratings.whale.toString()
    if (hodlerInput) hodlerInput.value = preset.ratings.hodler.toString()
    if (flipperInput) flipperInput.value = preset.ratings.flipper.toString()
    if (defiUserInput) defiUserInput.value = preset.ratings.defi_user.toString()
    if (experiencedInput) experiencedInput.value = preset.ratings.experienced.toString()
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
          <DialogDescription>Create a new advertising campaign with your desired target audience.</DialogDescription>
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
                <div className="flex justify-between items-center mb-2">
                  <Label htmlFor="body">Ad Content</Label>
                  <div className="flex items-center space-x-2">
                    <Button
                      type="button"
                      variant={contentType === "text" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setContentType("text")}
                    >
                      Plain Text
                    </Button>
                    <Button
                      type="button"
                      variant={contentType === "html" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setContentType("html")}
                    >
                      HTML
                    </Button>
                  </div>
                </div>
                <Textarea
                  id="body"
                  name="body"
                  required
                  className="min-h-[200px] font-mono"
                  placeholder={
                    contentType === "html"
                      ? "<div style='color: blue;'>Your HTML content here. You can use styling similar to emails.</div>"
                      : "Your plain text content here. Use markdown for basic formatting."
                  }
                  onChange={(e) => {
                    if (contentType === "html") {
                      setAdData((prev) =>
                        prev
                          ? {
                              ...prev,
                              body: e.target.value,
                            }
                          : null,
                      )
                    }
                  }}
                />
                {contentType === "html" && (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">
                      You can use HTML tags and CSS styling for a rich email-like experience.
                    </p>
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setPreviewVisible(!previewVisible)}
                      >
                        {previewVisible ? "Hide Preview" : "Show Preview"}
                      </Button>
                    </div>
                    {previewVisible && adData?.body && (
                      <div className="mt-4 border rounded-md p-4">
                        <p className="text-sm font-medium mb-2">Preview:</p>
                        <div
                          className="prose prose-sm dark:prose-invert max-h-[300px] overflow-auto"
                          dangerouslySetInnerHTML={{ __html: adData.body }}
                        />
                      </div>
                    )}
                  </div>
                )}
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
                <div>
                  <Label className="text-base font-medium">Target Audience</Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Select a preset audience profile for your ad campaign:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
                    {userPresets.map((preset) => (
                      <Button
                        key={preset.name}
                        type="button"
                        variant="outline"
                        className="h-auto py-3 justify-start"
                        onClick={() => {
                          applyPreset(preset)
                          // Open advanced section if it's closed
                          if (!advancedOpen) {
                            setAdvancedOpen(true)
                          }
                        }}
                      >
                        <div className="text-left">
                          <div className="font-medium">{preset.name}</div>
                          <div className="text-xs text-muted-foreground">{preset.description}</div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>

                <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen} className="border rounded-md p-3">
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="flex w-full justify-between p-2">
                      <span className="font-medium">Advanced Rating Settings</span>
                      {advancedOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="whale">Whale Rating (0-100)</Label>
                        <Input
                          id="whale"
                          name="whale"
                          type="number"
                          min="0"
                          max="100"
                          step="1"
                          defaultValue={adData?.desired_profile.whale.toString()}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="hodler">Hodler Rating (0-100)</Label>
                        <Input
                          id="hodler"
                          name="hodler"
                          type="number"
                          min="0"
                          max="100"
                          step="1"
                          defaultValue={adData?.desired_profile.hodler.toString()}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="flipper">Flipper Rating (0-100)</Label>
                        <Input
                          id="flipper"
                          name="flipper"
                          type="number"
                          min="0"
                          max="100"
                          step="1"
                          defaultValue={adData?.desired_profile.flipper.toString()}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="defi_user">DeFi User Rating (0-100)</Label>
                        <Input
                          id="defi_user"
                          name="defi_user"
                          type="number"
                          min="0"
                          max="100"
                          step="1"
                          defaultValue={adData?.desired_profile.defi_user.toString()}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="experienced">Experienced Rating (0-100)</Label>
                        <Input
                          id="experienced"
                          name="experienced"
                          type="number"
                          min="0"
                          max="100"
                          step="1"
                          defaultValue={adData?.desired_profile.experienced.toString()}
                          required
                        />
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>

              <div className="flex justify-between mt-6">
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
                <Button onClick={handlePayment} className="w-full" disabled={isLoading}>
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

