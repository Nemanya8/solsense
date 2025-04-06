"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import api from "@/lib/axios"
import { useAuth } from "../auth-provider"

interface Advertiser {
  id: string | number
  name: string
  email: string
  description: string
  ads?: string[]
  created_at?: string
}

export default function Dashboard() {
  const [advertiser, setAdvertiser] = useState<Advertiser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { advertiser: authAdvertiser } = useAuth()

  useEffect(() => {
    if (authAdvertiser) {
      setAdvertiser(authAdvertiser as Advertiser)
      setLoading(false)
    } else {
      fetchProfile()
    }
  }, [authAdvertiser])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const response = await api.get("/advertiser/me")
      if (response.data) {
        setAdvertiser(response.data)
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
      setError("Failed to load profile")
    } finally {
      setLoading(false)
    }
  }

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
              <p>{new Date(advertiser.created_at || "").toLocaleDateString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
  