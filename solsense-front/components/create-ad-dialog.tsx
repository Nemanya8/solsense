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
import { Plus } from "lucide-react"
import axios from "axios"
import { useRouter } from "next/navigation"

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const name = formData.get("name") as string
    const shortDescription = formData.get("shortDescription") as string
    const body = formData.get("body") as string
    const totalBalance = parseFloat(formData.get("totalBalance") as string)
    
    const desiredProfile: ProfileRatings = {
      whale: parseFloat(formData.get("whale") as string),
      hodler: parseFloat(formData.get("hodler") as string),
      flipper: parseFloat(formData.get("flipper") as string),
      defi_user: parseFloat(formData.get("defi_user") as string),
      experienced: parseFloat(formData.get("experienced") as string),
    }

    try {
      const response = await axios.post(
        "http://localhost:4000/api/ads",
        {
          name,
          short_description: shortDescription,
          body,
          total_balance: totalBalance,
          desired_profile: desiredProfile,
        },
        {
          withCredentials: true,
        }
      )

      if (response.data) {
        setOpen(false)
        router.refresh()
      }
    } catch (error: any) {
      setError(error.response?.data?.error || "Failed to create ad")
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
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <Label htmlFor="totalBalance">Total Balance (SOL)</Label>
            <Input id="totalBalance" name="totalBalance" type="number" step="0.01" required />
          </div>

          <div className="space-y-4">
            <Label>Desired User Profile Ratings</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="whale">Whale Rating</Label>
                <Input id="whale" name="whale" type="number" min="0" max="1" step="0.1" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hodler">Hodler Rating</Label>
                <Input id="hodler" name="hodler" type="number" min="0" max="1" step="0.1" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="flipper">Flipper Rating</Label>
                <Input id="flipper" name="flipper" type="number" min="0" max="1" step="0.1" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="defi_user">DeFi User Rating</Label>
                <Input id="defi_user" name="defi_user" type="number" min="0" max="1" step="0.1" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="experienced">Experienced Rating</Label>
                <Input id="experienced" name="experienced" type="number" min="0" max="1" step="0.1" required />
              </div>
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Ad"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
} 