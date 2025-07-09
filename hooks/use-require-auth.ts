"use client"

import { useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useUnifiedNavigation } from "@/hooks/use-unified-navigation"

/**
 * Hook that ensures user is authenticated and returns user data
 * Redirects to sign-in if not authenticated
 * 
 * Usage:
 * ```typescript
 * function MyProtectedComponent() {
 *   const { user } = useRequireAuth()
 *   // user is guaranteed to be non-null here
 *   return <div>Hello {user.email}</div>
 * }
 * ```
 */
export function useRequireAuth() {
  const { user, isLoading } = useAuth()
  const { navigateToSignInWithRedirect } = useUnifiedNavigation()

  useEffect(() => {
    if (!isLoading && !user) {
      // Store the current path for redirect after sign in and navigate to sign in
      if (typeof window !== 'undefined') {
        navigateToSignInWithRedirect(window.location.pathname)
      }
    }
  }, [user, isLoading, navigateToSignInWithRedirect])

  // Return non-null user for TypeScript
  if (!user) {
    throw new Error("useRequireAuth must be used in a component that is wrapped with AuthGuard")
  }

  return { user, isLoading }
} 