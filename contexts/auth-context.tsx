"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { getCurrentUser, fetchAuthSession, signOut as amplifySignOut } from 'aws-amplify/auth'
import { Hub } from 'aws-amplify/utils'

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
  refreshAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkAuthStatus()

    // Listen for auth events
    const unsubscribe = Hub.listen('auth', ({ payload }) => {
      switch (payload.event) {
        case 'signedIn':
          console.log('🔐 User signed in')
          checkAuthStatus()
          break
        case 'signedOut':
          console.log('🔐 User signed out')
          setUser(null)
          break
        case 'tokenRefresh':
          console.log('🔐 Token refreshed')
          checkAuthStatus()
          break
        case 'tokenRefresh_failure':
          console.log('🔐 Token refresh failed')
          setUser(null)
          break
      }
    })

    return unsubscribe
  }, [])

  const checkAuthStatus = async () => {
    console.log("🔐 Checking authentication status...")
    
    try {
      // Get current authenticated user from Cognito
      const cognitoUser = await getCurrentUser()
      console.log("🔐 Cognito user found:", cognitoUser)

      // Get user attributes from the session
      const session = await fetchAuthSession()
      
      if (session.tokens?.idToken) {
        const idToken = session.tokens.idToken
        const payload = idToken.payload
        
        const userData: User = {
          sub: cognitoUser.userId,
          email: payload.email as string || '',
          email_verified: payload.email_verified as boolean || false,
          given_name: payload.given_name as string || undefined,
          family_name: payload.family_name as string || undefined,
        }
        
        setUser(userData)
        console.log("🔐 User authenticated:", userData.email)
      } else {
        console.log("🔐 No valid session found")
        setUser(null)
      }
    } catch (error: any) {
      if (error.name === 'UserUnAuthenticatedException' || 
          error.name === 'NotAuthorizedException' || 
          error.name === 'UserNotFoundException') {
        console.log("🔐 User not authenticated")
      } else {
        console.error("🔐 Auth check error:", error)
      }
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const refreshAuth = async () => {
    setIsLoading(true)
    await checkAuthStatus()
  }

  const signOut = async () => {
    try {
      await amplifySignOut()
      setUser(null)
      
      // Clear session-specific data only (not user data)
      localStorage.removeItem("user-signed-in")
      localStorage.removeItem("splash-completed")
      
      // Clear legacy non-user-specific keys (for cleanup)
      localStorage.removeItem("study-streak-data")
      localStorage.removeItem("achievement-data")
      localStorage.removeItem("user-profile")
      
      // Reset to landing page by clearing the visited flag and setting return flag
      localStorage.setItem("return-to-landing", "true")
      localStorage.removeItem("visited-landing")
      
      console.log("🔐 Sign out successful")
    } catch (error) {
      console.error("Sign out failed:", error)
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, signOut, refreshAuth }}>
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