"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"

interface User {
  sub: string
  email: string
  email_verified: boolean
  given_name?: string
  family_name?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  signOut: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false)

  useEffect(() => {
    // Only check auth once
    if (!hasCheckedAuth) {
      checkAuthStatus()
    }
  }, [hasCheckedAuth])

  const checkAuthStatus = async () => {
    console.log("🔐 Checking authentication status...")
    
    try {
      // First, check for existing mock authentication
      const mockUserData = localStorage.getItem("mock-auth-user")
      if (mockUserData) {
        try {
          const mockUser = JSON.parse(mockUserData)
          setUser(mockUser)
          console.log("🔐 Using existing mock authentication for:", mockUser.email)
          setIsLoading(false)
          setHasCheckedAuth(true)
          return
        } catch (parseError) {
          console.error("Failed to parse mock user data:", parseError)
          localStorage.removeItem("mock-auth-user") // Remove corrupted data
        }
      }

      // Try API auth (will likely fail in development)
      const response = await fetch("/api/auth/me")
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
        console.log("🔐 API authentication successful")
      } else {
        console.log("🔐 API authentication failed (expected in development)")
        // No user found
        setUser(null)
      }
    } catch (error: any) {
      console.log("🔐 Auth check failed (expected in development):", error.message)
      // No user found
      setUser(null)
    } finally {
      setIsLoading(false)
      setHasCheckedAuth(true)
    }
  }

  const signOut = async () => {
    try {
      await fetch("/api/auth/signout", { method: "POST" })
      setUser(null)
    } catch (error) {
      console.error("Sign out failed:", error)
    }
    
    // Clear all user data
    localStorage.removeItem("mock-auth-user")
    localStorage.removeItem("user-signed-in")
    localStorage.removeItem("onboarding-complete")
    localStorage.removeItem("user-profile")
    localStorage.removeItem("splash-completed")
    
    // Reset to landing page by clearing the visited flag and setting return flag
    localStorage.setItem("return-to-landing", "true")
    localStorage.removeItem("visited-landing")
    
    setUser(null)
    setHasCheckedAuth(false) // Allow re-checking auth after sign out
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, signOut }}>
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