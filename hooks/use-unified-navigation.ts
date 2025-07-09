"use client"

import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useRef } from "react"
import { useLoading } from "@/contexts/loading-context"

export type AppTab = "dashboard" | "learning" | "classes" | "visualization" | "settings" | "profile"

export interface NavigationState {
  activeTab: AppTab
  isLoading: boolean
}

export interface NavigationActions {
  navigateToTab: (tab: AppTab) => void
  navigateToTopic: (topicId: string) => void
  navigateBack: () => void
  navigateToUrl: (url: string, options?: { replace?: boolean }) => void
  navigateToLanding: () => void
  navigateToSignIn: () => void
  navigateToSignInWithRedirect: (redirectUrl: string) => void
  getCurrentTab: () => AppTab
  isTabActive: (tab: AppTab) => boolean
}

const DEFAULT_TAB: AppTab = "dashboard"

const TAB_ROUTE_MAP: Record<AppTab, string> = {
  dashboard: "/?tab=dashboard",
  learning: "/?tab=learning", 
  classes: "/?tab=classes",
  visualization: "/?tab=visualization",
  settings: "/?tab=settings",
  profile: "/?tab=profile"
}

export function useUnifiedNavigation(): NavigationState & NavigationActions {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { startLoading, stopLoading } = useLoading()
  const previousPathname = useRef(pathname)
  
  // Get current tab from URL
  const getCurrentTab = useCallback((): AppTab => {
    // For topic pages, return classes as active tab
    if (pathname.startsWith("/topic/")) {
      return "classes"
    }
    
    // For root page, get tab from search params
    if (pathname === "/") {
      const tabParam = searchParams.get("tab")
      if (tabParam && isValidTab(tabParam)) {
        return tabParam as AppTab
      }
    }
    
    return DEFAULT_TAB
  }, [pathname, searchParams])

  const activeTab = getCurrentTab()
  
  // Check if a tab is currently active
  const isTabActive = useCallback((tab: AppTab): boolean => {
    return getCurrentTab() === tab
  }, [getCurrentTab])

  // Navigate to a specific tab
  const navigateToTab = useCallback((tab: AppTab) => {
    const url = TAB_ROUTE_MAP[tab]
    console.log(`🔄 Navigating to tab: ${tab} (${url})`)
    
    startLoading()
    router.push(url)
    
    // Auto-stop loading after timeout as fallback
    setTimeout(() => {
      console.log("⏰ Navigation timeout, stopping loading")
      stopLoading()
    }, 1000)
  }, [router, startLoading, stopLoading])

  // Navigate to a topic page
  const navigateToTopic = useCallback((topicId: string) => {
    const url = `/topic/${topicId}`
    console.log(`🔄 Navigating to topic: ${topicId} (${url})`)
    
    startLoading()
    router.push(url)
    
    // Auto-stop loading after timeout as fallback
    setTimeout(() => {
      console.log("⏰ Topic navigation timeout, stopping loading")
      stopLoading()
    }, 1000)
  }, [router, startLoading, stopLoading])

  // Navigate back
  const navigateBack = useCallback(() => {
    console.log("🔄 Navigating back")
    
    startLoading()
    router.back()
    
    // Auto-stop loading after timeout as fallback
    setTimeout(() => {
      console.log("⏰ Back navigation timeout, stopping loading")
      stopLoading()
    }, 1000)
  }, [router, startLoading, stopLoading])

  // Navigate to landing page
  const navigateToLanding = useCallback(() => {
    console.log("🔄 Navigating to landing page")
    
    // Clear visited landing flag and set return flag
    localStorage.setItem("return-to-landing", "true")
    localStorage.removeItem("visited-landing")
    
    startLoading()
    router.push("/")
    
    // Auto-stop loading after timeout as fallback
    setTimeout(() => {
      console.log("⏰ Landing navigation timeout, stopping loading")
      stopLoading()
    }, 1000)
  }, [router, startLoading, stopLoading])

  // Navigate to sign in
  const navigateToSignIn = useCallback(() => {
    console.log("🔄 Navigating to sign in")
    
    // Clear return-to-landing flag to show sign in
    localStorage.removeItem("return-to-landing")
    
    startLoading()
    router.push("/")
    
    // Auto-stop loading after timeout as fallback
    setTimeout(() => {
      console.log("⏰ Sign in navigation timeout, stopping loading")
      stopLoading()
    }, 1000)
  }, [router, startLoading, stopLoading])

  // Navigate to sign in with redirect
  const navigateToSignInWithRedirect = useCallback((redirectUrl: string) => {
    console.log(`🔄 Navigating to sign in with redirect: ${redirectUrl}`)
    
    // Store the redirect URL for after sign in
    localStorage.setItem('auth-redirect', redirectUrl)
    // Clear return-to-landing flag to show sign in
    localStorage.removeItem("return-to-landing")
    
    startLoading()
    router.push("/")
    
    // Auto-stop loading after timeout as fallback
    setTimeout(() => {
      console.log("⏰ Sign in with redirect navigation timeout, stopping loading")
      stopLoading()
    }, 1000)
  }, [router, startLoading, stopLoading])

  // Navigate to any URL
  const navigateToUrl = useCallback((url: string, options?: { replace?: boolean }) => {
    console.log(`🔄 Navigating to URL: ${url}`)
    
    startLoading()
    
    if (options?.replace) {
      router.replace(url)
    } else {
      router.push(url)
    }
    
    // Auto-stop loading after timeout as fallback
    setTimeout(() => {
      console.log("⏰ URL navigation timeout, stopping loading")
      stopLoading()
    }, 1000)
  }, [router, startLoading, stopLoading])

  // Monitor pathname changes to stop loading
  useEffect(() => {
    if (previousPathname.current !== pathname) {
      console.log(`🔄 Pathname changed from ${previousPathname.current} to ${pathname}`)
      previousPathname.current = pathname
      
      // Stop loading with a minimum delay for smooth UX
      setTimeout(() => {
        console.log("✅ Navigation complete, stopping loading")
        stopLoading()
      }, 300)
    }
  }, [pathname, stopLoading])

  return {
    activeTab,
    isLoading: false, // Loading state is managed by LoadingContext
    navigateToTab,
    navigateToTopic,
    navigateBack,
    navigateToUrl,
    navigateToLanding,
    navigateToSignIn,
    navigateToSignInWithRedirect,
    getCurrentTab,
    isTabActive
  }
}

// Helper function to validate tab parameter
function isValidTab(tab: string): tab is AppTab {
  return ["dashboard", "learning", "classes", "visualization", "settings", "profile"].includes(tab)
} 