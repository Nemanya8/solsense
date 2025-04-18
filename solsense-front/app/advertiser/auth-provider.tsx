"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { getToken, setToken, removeToken, getUser, setUser as saveUser, removeUser } from '@/lib/token-service'
import api from '@/lib/axios'

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
    // Check for existing token and user data in local storage
    const token = getToken();
    const savedUser = getUser();
    
    if (savedUser) {
      setAdvertiser(savedUser);
      setIsLoading(false);
      return;
    }
    
    if (!token) {
      setIsLoading(false);
      return;
    }

    // Validate token with the backend
    const checkToken = async () => {
      try {
        const response = await api.get('/advertiser/me');
        if (response.data) {
          setAdvertiser(response.data);
          saveUser(response.data);
        }
      } catch (error) {
        console.error("Error checking token:", error);
        // Token is invalid, remove it
        removeToken();
        removeUser();
      } finally {
        setIsLoading(false);
      }
    }

    checkToken();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post("/advertiser/login", {
        email,
        password,
      });

      if (response.data) {
        // Save token and user data
        const { token, ...advertiserData } = response.data;
        setToken(token);
        saveUser(advertiserData);
        setAdvertiser(advertiserData);
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  const register = async (email: string, password: string, name: string, description: string) => {
    try {
      await api.post("/advertiser/register", {
        email,
        password,
        name,
        description,
      });

      // If registration is successful, login automatically
      await login(email, password);
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  }

  const logout = async () => {
    // Clear token and user data
    removeToken();
    removeUser();
    setAdvertiser(null);
  }

  // Show loading state while checking token
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