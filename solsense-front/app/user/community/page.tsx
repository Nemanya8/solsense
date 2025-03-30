"use client"

import { useEffect, useState, useRef } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import ReactMarkdown from "react-markdown"
import { Eye, Info, BarChart3, User } from "lucide-react"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

interface ProfileRatings {
  whale: number
  hodler: number
  flipper: number
  defi_user: number
  experienced: number
}

interface Ad {
  id: number
  name: string
  short_description: string
  body: string
  total_balance: number
  remaining_balance: number
  desired_profile: ProfileRatings
  impressions: number
  interactions: number
  advertiser_name: string
  created_at: string
}

export default function MatchingAdsPage() {
  const [ads, setAds] = useState<Ad[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const { publicKey } = useWallet()
  const viewedAds = useRef<Set<number>>(new Set())

  const trackImpression = async (adId: number) => {
    if (!viewedAds.current.has(adId) && publicKey) {
      try {
        await fetch(`http://localhost:4000/api/ads/${adId}/impression?walletAddress=${publicKey.toString()}`, {
          method: "POST",
          credentials: "include",
        })
        viewedAds.current.add(adId)
        setAds((prevAds) => prevAds.map((ad) => (ad.id === adId ? { ...ad, impressions: ad.impressions + 1 } : ad)))
      } catch (error) {
        console.error("Error tracking impression:", error)
      }
    }
  }

  const trackInteraction = async (adId: number) => {
    if (!publicKey) return

    try {
      await fetch(`http://localhost:4000/api/ads/${adId}/interaction?walletAddress=${publicKey.toString()}`, {
        method: "POST",
        credentials: "include",
      })
      setAds((prevAds) => prevAds.map((ad) => (ad.id === adId ? { ...ad, interactions: ad.interactions + 1 } : ad)))
    } catch (error) {
      console.error("Error tracking interaction:", error)
    }
  }

  useEffect(() => {
    const fetchMatchingAds = async () => {
      if (!publicKey) {
        setError("Please connect your wallet")
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`http://localhost:4000/api/ads/matching?walletAddress=${publicKey.toString()}`, {
          credentials: "include",
        })

        if (!response.ok) {
          throw new Error("Failed to fetch matching ads")
        }

        const data = await response.json()
        setAds(data)
        data.forEach((ad: Ad) => trackImpression(ad.id))
      } catch (error) {
        console.error("Error fetching matching ads:", error)
        setError("Failed to load matching ads")
      } finally {
        setLoading(false)
      }
    }

    fetchMatchingAds()
  }, [publicKey])

  if (loading) {
    return <LoadingState />
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-destructive">{error}</p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Matching Ads</h1>
        <p className="text-muted-foreground mt-1">Personalized content based on your on-chain profile</p>
      </div>

      {ads.length > 0 ? (
        <div className="grid gap-6">
          {ads.map((ad) => (
            <AdCard key={ad.id} ad={ad} onInteraction={() => trackInteraction(ad.id)} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <p className="text-muted-foreground text-center">No matching ads found for your profile</p>
            <Button variant="outline" className="mt-4">
              Refresh
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function AdCard({ ad, onInteraction }: { ad: Ad; onInteraction: () => void }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{ad.name}</CardTitle>
            <CardDescription className="mt-1">{ad.short_description}</CardDescription>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="text-right">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <BarChart3 className="h-3 w-3" />
                    <span>{ad.impressions} views</span>
                  </Badge>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Impressions: {ad.impressions}</p>
                <p>Interactions: {ad.interactions}</p>
                <p>Rate: {ad.impressions > 0 ? ((ad.interactions / ad.impressions) * 100).toFixed(1) : 0}%</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center text-sm text-muted-foreground">
            <User className="h-3 w-3 mr-1" />
            <span>{ad.advertiser_name}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {ad.remaining_balance.toFixed(2)} / {ad.total_balance.toFixed(2)} USDC
            </span>
            <Progress value={(ad.remaining_balance / ad.total_balance) * 100} className="w-[60px] h-2" />
          </div>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="pt-4">
        <Dialog>
          <DialogTrigger asChild>
            <div className="cursor-pointer" onClick={onInteraction}>
              <div className="prose prose-sm dark:prose-invert max-h-[200px] overflow-hidden relative">
                <ReactMarkdown>{ad.body}</ReactMarkdown>
                <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent" />
              </div>
              <Button variant="ghost" className="w-full mt-2 text-primary">
                <Eye className="h-4 w-4 mr-2" />
                View Full Content
              </Button>
            </div>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{ad.name}</DialogTitle>
            </DialogHeader>

            <Tabs defaultValue="content" className="mt-4">
              <TabsList className="grid w-full grid-cols2">
                <TabsTrigger value="content">Content</TabsTrigger>
              </TabsList>

              <TabsContent value="content" className="mt-4">
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown>{ad.body}</ReactMarkdown>
                </div>
              </TabsContent>

              <TabsContent value="metrics" className="mt-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Budget</h4>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Remaining Balance</span>
                      <span className="font-medium">${ad.remaining_balance.toFixed(2)} USDC</span>
                    </div>
                    <Progress value={(ad.remaining_balance / ad.total_balance) * 100} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {((ad.remaining_balance / ad.total_balance) * 100).toFixed(1)}% of ${ad.total_balance.toFixed(2)}{" "}
                      USDC total budget
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="mt-4 flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                <span>Created: {new Date(ad.created_at).toLocaleDateString()}</span>
              </div>
              <Button variant="outline" size="sm">
                <Info className="h-4 w-4 mr-2" />
                Report Ad
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}

function LoadingState() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <Skeleton className="h-10 w-[250px]" />
        <Skeleton className="h-5 w-[350px] mt-2" />
      </div>

      <div className="grid gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <Skeleton className="h-6 w-[200px]" />
                  <Skeleton className="h-4 w-[300px] mt-2" />
                </div>
                <Skeleton className="h-6 w-[80px]" />
              </div>
              <div className="flex items-center justify-between mt-4">
                <Skeleton className="h-4 w-[120px]" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-[80px]" />
                  <Skeleton className="h-2 w-[60px]" />
                </div>
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="pt-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
              <Skeleton className="h-9 w-full mt-4" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

