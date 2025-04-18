"use client"

import { useEffect, useState, HTMLProps } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { CreateAdDialog } from "@/components/create-ad-dialog"
import { Progress } from "@/components/ui/progress"
import ReactMarkdown from 'react-markdown'
import api from "@/lib/axios"
import { useAuth } from "../auth-provider"
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'

interface ProfileRatings {
  whale: number;
  hodler: number;
  flipper: number;
  defi_user: number;
  experienced: number;
}

interface HTMLPropsWithBgColor extends HTMLProps<HTMLDivElement> {
  bgcolor?: string;
}

interface Ad {
  id: number;
  name: string;
  short_description: string;
  body: string;
  total_balance: number;
  remaining_balance: number;
  desired_profile: ProfileRatings;
  impressions: number;
  interactions: number;
  created_at: string;
}

export default function AdvertiserAds() {
  const [ads, setAds] = useState<Ad[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const router = useRouter()
  const { advertiser } = useAuth()

  useEffect(() => {
    // Redirect if not logged in
    if (!advertiser && !loading) {
      router.push('/advertiser/login')
      return
    }

    const fetchAds = async () => {
      try {
        const response = await api.get("/ads")
        setAds(response.data)
      } catch (error) {
        console.error("Error fetching ads:", error)
        setError("Failed to load ads")
      } finally {
        setLoading(false)
      }
    }

    if (advertiser) {
      fetchAds()
    }
  }, [router, advertiser, loading])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Your Ads</h1>
        <CreateAdDialog />
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Advertising Campaigns</CardTitle>
          <CardDescription>Manage your advertising campaigns</CardDescription>
        </CardHeader>
        <CardContent>
          {ads.length > 0 ? (
            <div className="space-y-6">
              {ads.map((ad) => (
                <Card key={ad.id} className="p-4">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">{ad.name}</h3>
                        <p className="text-muted-foreground">{ad.short_description}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          Balance: ${ad.remaining_balance.toFixed(2)} / ${ad.total_balance.toFixed(2)} USDC
                        </p>
                        <Progress 
                          value={(ad.remaining_balance / ad.total_balance) * 100} 
                          className="w-[100px] mt-2"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold mb-2">Performance</h4>
                        <div className="space-y-1">
                          <p>Impressions: {ad.impressions}</p>
                          <p>Interactions: {ad.interactions}</p>
                          <p>Interaction Rate: {ad.impressions > 0 ? ((ad.interactions / ad.impressions) * 100).toFixed(2) : 0}%</p>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Target Profile</h4>
                        <div className="space-y-1">
                          <p>Whale: {ad.desired_profile.whale}%</p>
                          <p>Hodler: {ad.desired_profile.hodler}%</p>
                          <p>Flipper: {ad.desired_profile.flipper}%</p>
                          <p>DeFi User: {ad.desired_profile.defi_user}%</p>
                          <p>Experienced: {ad.desired_profile.experienced}%</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Ad Content</h4>
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        <ReactMarkdown 
                          components={{
                            // Override default paragraph to preserve HTML formatting
                            p: ({ children, ...props }) => <div className="whitespace-pre-wrap" {...props}>{children}</div>,
                            // Handle table elements with proper styling
                            table: ({children, ...props}) => <table className="min-w-full divide-y divide-gray-200" {...props}>{children}</table>,
                            td: ({children, ...props}) => <td className="px-3 py-2" {...props}>{children}</td>,
                            th: ({children, ...props}) => <th className="px-3 py-2 font-semibold" {...props}>{children}</th>,
                            // Handle any HTML attributes by passing them through
                            div: ({children, ...props}: HTMLPropsWithBgColor) => {
                              // Convert bgColor to style.backgroundColor if present
                              if (props.bgcolor) {
                                props.style = { ...props.style, backgroundColor: props.bgcolor }
                                delete props.bgcolor
                              }
                              return <div {...props}>{children}</div>
                            }
                          }}
                          remarkPlugins={[remarkGfm]}
                          rehypePlugins={[rehypeRaw]}
                        >
                          {ad.body}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No ads created yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
  