"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import ReactMarkdown from "react-markdown"
import { Eye, Info, User } from "lucide-react"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { PortfolioData } from "@/types/portfolio"
import { communityService, type Ad } from "@/app/services/community"

export default function MatchingAdsPage() {
  const [ads, setAds] = useState<Ad[]>([])
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const { publicKey } = useWallet()
  const viewedAds = useRef<Set<number>>(new Set())

  const trackImpression = useCallback(async (adId: number) => {
    if (!viewedAds.current.has(adId) && publicKey) {
      try {
        const data = await communityService.fetchPortfolio(publicKey.toString())
        setPortfolio(data)

        await communityService.trackImpression(adId, publicKey.toString())
        viewedAds.current.add(adId)
        setAds((prevAds) => prevAds.map((ad) => (ad.id === adId ? { ...ad, impressions: ad.impressions + 1 } : ad)))
      } catch (error) {
        console.error("Error tracking impression:", error)
      }
    }
  }, [publicKey])

  const trackInteraction = async (adId: number) => {
    if (!publicKey) return

    try {
      await communityService.trackInteraction(adId, publicKey.toString())
      setAds((prevAds) => prevAds.map((ad) => (ad.id === adId ? { ...ad, interactions: ad.interactions + 1 } : ad)))
      
      if (portfolio) {
        setPortfolio(prev => prev ? {
          ...prev,
          earned_rewards: (prev.earned_rewards || 0) + 0.5
        } : null)
      }
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
        const data = await communityService.fetchMatchingAds(publicKey.toString())
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
  }, [publicKey, trackImpression])

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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Matching Ads</h1>
            <p className="text-muted-foreground mt-1">Personalized content based on your on-chain profile</p>
          </div>
          {portfolio && (
            <Card>
              <CardContent className="justify-end text-right">
                <div className="text-sm text-muted-foreground">Total Earned</div>
                <div className="text-2xl font-bold">
                  {portfolio?.earned_rewards?.toFixed(2) || 0} USDC
                </div>
                <Button className="mt-2 w-full">
                  Redeem
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
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

            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown>{ad.body}</ReactMarkdown>
            </div>

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

