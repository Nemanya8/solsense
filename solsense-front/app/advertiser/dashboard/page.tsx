"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import axios from "axios"

interface Advertiser {
  id: number;
  email: string;
  name: string;
  description: string;
  ads: string[];
  created_at: string;
}

export default function AdvertiserDashboard() {
  const [advertiser, setAdvertiser] = useState<Advertiser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get("http://localhost:4000/api/advertiser/profile", {
          withCredentials: true
        })
        setAdvertiser(response.data)
      } catch (error: any) {
        if (error.response?.status === 401) {
          router.push("/")
        } else {
          setError("Failed to load profile")
        }
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [router])

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

  if (!advertiser) {
    return null
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Advertiser Dashboard</h1>
      </div>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Your advertiser account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold">Name</h3>
              <p>{advertiser.name}</p>
            </div>
            <div>
              <h3 className="font-semibold">Email</h3>
              <p>{advertiser.email}</p>
            </div>
            <div>
              <h3 className="font-semibold">Description</h3>
              <p>{advertiser.description || "No description provided"}</p>
            </div>
            <div>
              <h3 className="font-semibold">Member Since</h3>
              <p>{new Date(advertiser.created_at).toLocaleDateString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
  