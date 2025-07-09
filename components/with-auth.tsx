"use client"

import { ComponentType } from "react"
import { AuthGuard } from "@/components/auth-guard"

/**
 * Higher-order component that wraps a component with authentication protection
 * 
 * Usage:
 * ```typescript
 * const ProtectedPage = withAuth(MyPage)
 * export default ProtectedPage
 * ```
 */
export function withAuth<T extends object>(
  Component: ComponentType<T>,
  redirectTo: string = "/"
) {
  return function AuthenticatedComponent(props: T) {
    return (
      <AuthGuard redirectTo={redirectTo}>
        <Component {...props} />
      </AuthGuard>
    )
  }
} 