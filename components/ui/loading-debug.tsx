"use client";

import { useLoading } from "@/contexts/loading-context";
import { Badge } from "./badge";

export function LoadingDebug() {
  const { isLoading } = useLoading();

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <Badge variant={isLoading ? "default" : "secondary"}>
        Loading: {isLoading ? "ON" : "OFF"}
      </Badge>
    </div>
  );
} 