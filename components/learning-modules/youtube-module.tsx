"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronRight } from "lucide-react"
import { YouTubeModule } from "./types"

interface YouTubeModuleProps {
  module: YouTubeModule
}

export function YouTubeModuleComponent({ module }: YouTubeModuleProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const buildYouTubeUrl = () => {
    let url = `https://www.youtube.com/embed/${module.videoId}`
    const params = new URLSearchParams()
    
    if (module.startTime) {
      params.append('start', module.startTime.toString())
    }
    if (module.endTime) {
      params.append('end', module.endTime.toString())
    }
    
    // Add common YouTube embed parameters
    params.append('rel', '0') // Don't show related videos
    params.append('modestbranding', '1') // Minimal YouTube branding
    
    if (params.toString()) {
      url += '?' + params.toString()
    }
    
    return url
  }

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed)
  }

  return (
    <Card className="w-full mb-6 bg-muted/30">
      <CardHeader className="pb-2 pt-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold">
            {module.title || "YouTube Video"}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleCollapse}
            className="h-8 w-8 p-0"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      
      {!isCollapsed && (
        <CardContent className="pt-2">
          <div className="aspect-video w-full mb-4">
            <iframe
              src={buildYouTubeUrl()}
              title={module.title || "YouTube video"}
              className="w-full h-full rounded-lg shadow-md"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          {module.description && (
            <p className="text-base text-muted-foreground">
              {module.description}
            </p>
          )}
        </CardContent>
      )}
    </Card>
  )
} 