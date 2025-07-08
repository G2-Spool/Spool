"use client";

import { useEffect, useState } from "react";
import { DotLoader } from "./dot-loader";
import { cn } from "@/lib/utils";
import { useLoading } from "@/contexts/loading-context";

const loadingFrames = [
    [14, 7, 0, 8, 6, 13, 20],
    [14, 7, 13, 20, 16, 27, 21],
    [14, 20, 27, 21, 34, 24, 28],
    [27, 21, 34, 28, 41, 32, 35],
    [34, 28, 41, 35, 48, 40, 42],
    [34, 28, 41, 35, 48, 42, 46],
    [34, 28, 41, 35, 48, 42, 38],
    [34, 28, 41, 35, 48, 30, 21],
    [34, 28, 41, 48, 21, 22, 14],
    [34, 28, 41, 21, 14, 16, 27],
    [34, 28, 21, 14, 10, 20, 27],
    [28, 21, 14, 4, 13, 20, 27],
    [28, 21, 14, 12, 6, 13, 20],
    [28, 21, 14, 6, 13, 20, 11],
    [28, 21, 14, 6, 13, 20, 10],
    [14, 6, 13, 20, 9, 7, 21],
];

interface LoadingScreenProps {
  className?: string;
}

export function LoadingScreen({ className }: LoadingScreenProps) {
  const { isLoading } = useLoading();
  const [shouldRender, setShouldRender] = useState(isLoading);

  useEffect(() => {
    if (isLoading) {
      console.log('🖥️ Loading screen showing');
      setShouldRender(true);
    } else {
      console.log('🖥️ Loading screen hiding');
      // Delay unmounting to allow fade out animation
      const timer = setTimeout(() => {
        console.log('🖥️ Loading screen unmounted');
        setShouldRender(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  console.log('🖥️ LoadingScreen render:', { isLoading, shouldRender });

  if (!shouldRender) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-background transition-opacity duration-300",
        isLoading ? "opacity-100" : "opacity-0",
        className
      )}
    >
      <div className="flex flex-col items-center gap-4">
        <p className="text-xl font-bold text-foreground animate-bounce">
          Too Spool for School!
        </p>
        <div className="relative">
          <DotLoader
            frames={loadingFrames}
            className="gap-1"
            dotClassName="bg-muted-foreground/30 [&.active]:bg-primary size-2"
            duration={120}
          />
        </div>
        <div className="text-center">
          <p className="text-lg font-medium text-foreground">Loading...</p>
        </div>
      </div>
    </div>
  );
} 