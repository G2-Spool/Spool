"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useLoading } from "@/contexts/loading-context";

export function useNavigationLoading() {
  const router = useRouter();
  const pathname = usePathname();
  const { startLoading, stopLoading } = useLoading();
  const previousPathname = useRef(pathname);

  // Enhanced router.push with loading state
  const navigateWithLoading = (url: string, options?: { replace?: boolean }) => {
    console.log('🔄 Starting navigation to:', url);
    startLoading();
    
    if (options?.replace) {
      router.replace(url);
    } else {
      router.push(url);
    }
    
    // Auto-stop loading after timeout as fallback
    setTimeout(() => {
      console.log('⏰ Timeout reached, stopping loading');
      stopLoading();
    }, 1000);
  };

  // Enhanced router.replace with loading state
  const replaceWithLoading = (url: string) => {
    navigateWithLoading(url, { replace: true });
  };

  // Enhanced router.back with loading state
  const backWithLoading = () => {
    startLoading();
    router.back();
    
    // Auto-stop loading after timeout as fallback
    setTimeout(() => {
      stopLoading();
    }, 1000);
  };

  // Monitor pathname changes to stop loading
  useEffect(() => {
    if (previousPathname.current !== pathname) {
      console.log('🔄 Pathname changed from', previousPathname.current, 'to', pathname);
      previousPathname.current = pathname;
      // Minimum loading time to ensure animation is visible
      setTimeout(() => {
        console.log('✅ Navigation complete, stopping loading');
        stopLoading();
      }, 300); // Reduced to 300ms for faster transitions
    }
  }, [pathname, stopLoading]);

  return {
    navigateWithLoading,
    replaceWithLoading,
    backWithLoading,
  };
} 