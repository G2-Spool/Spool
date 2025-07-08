"use client";

import { useLoading } from "@/contexts/loading-context";
import { Button } from "./button";

export function LoadingTestButton() {
  const { isLoading, startLoading, stopLoading } = useLoading();

  const handleTestLoading = () => {
    if (isLoading) {
      stopLoading();
    } else {
      startLoading();
      // Auto-stop after 1.5 seconds for testing
      setTimeout(() => {
        stopLoading();
      }, 1500);
    }
  };

  return (
    <Button 
      onClick={handleTestLoading}
      variant={isLoading ? "destructive" : "default"}
      size="sm"
    >
      {isLoading ? "Stop Loading" : "Test Loading"}
    </Button>
  );
} 