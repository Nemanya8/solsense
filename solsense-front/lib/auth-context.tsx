"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import api from './axios'
import { getToken, removeToken, getUser, setUser as saveUser, removeUser } from './token-service'

interface Advertiser {
  id: number
  email: string
  name: string
  description: string
  created_at: string
}

interface AuthContextType {
  user: Advertiser | null
  setUser: (user: Advertiser | null) => void
  isLoading: boolean
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Advertiser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const loadUserData = async () => {
      try {
        // Check if token exists in localStorage
        const token = getToken();
        const savedUser = getUser();
        
        if (savedUser) {
          setUser(savedUser);
          setIsLoading(false);
          return;
        }
        
        if (!token) {
          setIsLoading(false);
          return;
        }

        // Validate token with backend
        const response = await api.get('/advertiser/me');
        if (response.data) {
          setUser(response.data);
          saveUser(response.data);
        }
      } catch (error) {
        console.error('Error validating token:', error);
        // If token validation fails, clear token
        removeToken();
        removeUser();
      } finally {
        setIsLoading(false);
      }
    }

    loadUserData();
  }, []);

  // Update user in localStorage when it changes
  useEffect(() => {
    if (user) {
      saveUser(user);
    }
  }, [user]);

  const logout = async () => {
    try {
      // Clear token and user data
      removeToken();
      removeUser();
      setUser(null);
      router.push('/');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }

  return (
    <AuthContext.Provider value={{ user, setUser, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 