"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

interface Advertiser {
  id: string
  name: string
  email: string
  description: string
}

interface AuthContextType {
  advertiser: Advertiser | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string, description: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [advertiser, setAdvertiser] = useState<Advertiser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      try {
        const response = await fetch("http://localhost:4000/api/advertiser/me", {
          credentials: "include",
        })
        if (response.ok) {
          const data = await response.json()
          setAdvertiser(data)
        } else if (response.status === 401) {
          // Clear advertiser state if unauthorized
          setAdvertiser(null)
        } else {
          // Retry once on other errors
          const retryResponse = await fetch("http://localhost:4000/api/advertiser/me", {
            credentials: "include",
          })
          if (retryResponse.ok) {
            const data = await retryResponse.json()
            setAdvertiser(data)
          } else {
            setAdvertiser(null)
          }
        }
      } catch (error) {
        console.error("Error checking session:", error)
        // Retry once on network errors
        try {
          const retryResponse = await fetch("http://localhost:4000/api/advertiser/me", {
            credentials: "include",
          })
          if (retryResponse.ok) {
            const data = await retryResponse.json()
            setAdvertiser(data)
          } else {
            setAdvertiser(null)
          }
        } catch (retryError) {
          console.error("Error retrying session check:", retryError)
          setAdvertiser(null)
        }
      } finally {
        setIsLoading(false)
      }
    }

    checkSession()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch("http://localhost:4000/api/advertiser/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Login failed")
      }

      const data = await response.json()
      setAdvertiser(data)
    } catch (error) {
      console.error("Login error:", error)
      throw error
    }
  }

  const register = async (email: string, password: string, name: string, description: string) => {
    try {
      const response = await fetch("http://localhost:4000/api/advertiser/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password, name, description }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Registration failed")
      }

      const data = await response.json()
      setAdvertiser(data)
    } catch (error) {
      console.error("Registration error:", error)
      throw error
    }
  }

  const logout = async () => {
    try {
      await fetch("http://localhost:4000/api/advertiser/logout", {
        method: "POST",
        credentials: "include",
      })
      setAdvertiser(null)
    } catch (error) {
      console.error("Logout error:", error)
      // Even if logout fails, clear the local state
      setAdvertiser(null)
    }
  }

  // Show loading state while checking session
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ advertiser, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
} 