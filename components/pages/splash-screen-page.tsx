"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ForceGraph, generateAcademicNetwork, generateHobbyNetwork } from "@/components/ui/force-graph"
import { cn } from "@/lib/utils"
import { Zap, RotateCcw } from "lucide-react"

interface SplashScreenPageProps {
  onComplete: () => void
}

export function SplashScreenPage({ onComplete }: SplashScreenPageProps) {
  const [academicNetwork] = useState(() => generateAcademicNetwork())
  const [hobbyNetwork] = useState(() => generateHobbyNetwork())

  // Animation states for graphs
  const [showFirstSlideHobbyGraph, setShowFirstSlideHobbyGraph] = useState(false)
  const [showAcademiaLabel, setShowAcademiaLabel] = useState(false)
  const [showInterestsLabel, setShowInterestsLabel] = useState(false)
  const [showCombinedGraph, setShowCombinedGraph] = useState(false)

  const content = (
        <div className="space-y-6">
                    {/* Graph Container */}
          <div className="flex justify-center items-center min-h-[200px] relative">
            {/* Combined Graph - appears after 8 seconds with bridge connections */}
            {showCombinedGraph && (
              <div className="absolute transition-all duration-2000 ease-out">
                <div className="text-center">
                  <div className="translate-y-4">
                    <ForceGraph 
                      nodes={[
                        ...academicNetwork.nodes.map(node => ({ ...node, color: '#f97316' })), // orange for academic
                        ...hobbyNetwork.nodes.map(node => ({ ...node, color: 'hsl(var(--primary))' })) // primary for hobbies
                      ]}
                      links={[
                        ...academicNetwork.links, 
                        ...hobbyNetwork.links,
                        // Bridge connections
                        { source: 'math', target: 'gaming' },
                        { source: 'physics', target: 'guitar' },
                        { source: 'chemistry', target: 'cooking' },
                        { source: 'history', target: 'reading' },
                        { source: 'biology', target: 'sports' },
                        { source: 'english', target: 'art' },
                        { source: 'economics', target: 'travel' },
                        { source: 'psychology', target: 'photography' }
                      ]}
                      nodeColor="hsl(var(--primary))"
                      width={280}
                      height={280}
                      animate={true}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Academic Graph - appears on the left */}
            <div className={cn(
              "absolute -translate-x-28 -translate-y-4 transition-all duration-2000 ease-out",
              showCombinedGraph ? "opacity-0 scale-95" : "opacity-100 scale-100"
            )}>
              <div className="text-center">
                <p className={cn(
                  "text-2xl font-bold text-white mb-2 transition-all duration-1000 ease-out -translate-y-4",
                  showAcademiaLabel 
                    ? "opacity-100 translate-y-0" 
                    : "opacity-0 translate-y-2"
                )}>Academia</p>
                <div className="translate-y-4">
                  <ForceGraph 
                    nodes={academicNetwork.nodes}
                    links={academicNetwork.links}
                    nodeColor="#f97316"
                    width={160}
                    height={160}
                    animate={true}
                  />
                </div>
              </div>
            </div>
            
            {/* Hobby Graph - appears on the right after 3 seconds */}
            <div className={cn(
              "absolute translate-x-28 -translate-y-4 transition-all duration-2000 ease-out",
              showCombinedGraph ? "opacity-0 scale-95" : "opacity-100 scale-100"
            )}>
              <div className="text-center">
                <p className={cn(
                  "text-2xl font-bold text-white mb-2 transition-all duration-1000 ease-out -translate-y-4",
                  showInterestsLabel 
                    ? "opacity-100 translate-y-0" 
                    : "opacity-0 translate-y-2"
                )}>Interests</p>
                <div className="translate-y-4">
                  {showFirstSlideHobbyGraph && (
                    <ForceGraph 
                      nodes={hobbyNetwork.nodes}
                      links={hobbyNetwork.links}
                      nodeColor="hsl(var(--primary))"
                      width={160}
                      height={160}
                      animate={true}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )

  // Handle graph animations
  useEffect(() => {
    // Show academia label quickly, then hobby graph and interests label after 3 seconds
    setTimeout(() => setShowAcademiaLabel(true), 300)
    setTimeout(() => {
      setShowFirstSlideHobbyGraph(true)
      setShowInterestsLabel(true)
    }, 3000)
    // 5 seconds after blue graph appears, show combined graph with bridge connections
    setTimeout(() => {
      setShowCombinedGraph(true)
    }, 8000) // 3000 + 5000 = 8000ms total
  }, [])

  const handleNext = () => {
    onComplete()
  }

  const restartAnimation = () => {
    // Reset all animation states
    setShowAcademiaLabel(false)
    setShowInterestsLabel(false)
    setShowFirstSlideHobbyGraph(false)
    setShowCombinedGraph(false)

    // Restart animation sequence
    setTimeout(() => setShowAcademiaLabel(true), 300)
    setTimeout(() => {
      setShowFirstSlideHobbyGraph(true)
      setShowInterestsLabel(true)
    }, 3000)
    setTimeout(() => {
      setShowCombinedGraph(true)
    }, 8000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-8 relative">
          {/* Refresh button */}
          <Button
            onClick={restartAnimation}
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 text-muted-foreground hover:text-foreground p-2 h-8 w-8"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>

          {/* Content */}
          <div className="min-h-[350px] flex flex-col justify-center">
            {content}
          </div>

          {/* Navigation */}
          <div className="mt-8 flex gap-3">
            {/* Start Learning button */}
            <Button
              onClick={handleNext}
              size="lg"
              className="flex-1 group transition-all duration-300 hover:shadow-lg"
            >
              Start Learning!
              <Zap className="ml-2 h-4 w-4 group-hover:scale-110 transition-transform" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 