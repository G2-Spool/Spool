"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Network, ZoomIn, ZoomOut, RotateCcw } from "lucide-react"
import { select } from "d3-selection"
import { forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide } from "d3-force"
import { drag } from "d3-drag"
import { zoom, zoomIdentity } from "d3-zoom"

interface Node {
  id: string
  name: string
  type: "hobby" | "subject" | "topic" | "connection"
  connections: number
  x?: number
  y?: number
  fx?: number | null
  fy?: number | null
}

interface Link {
  source: string | Node
  target: string | Node
  strength: number
}

export function ProgressPage() {
  const svgRef = useRef<SVGSVGElement>(null)
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [zoomLevel, setZoomLevel] = useState(1)
  const zoomBehavior = zoom()

  const nodes: Node[] = [
    // Hobbies & Interests
    { id: "guitar", name: "Guitar Playing", type: "hobby", connections: 6 },
    { id: "baking", name: "Baking", type: "hobby", connections: 4 },
    { id: "photography", name: "Photography", type: "hobby", connections: 5 },
    { id: "gaming", name: "Video Games", type: "hobby", connections: 3 },
    { id: "reading", name: "Reading", type: "hobby", connections: 4 },
    { id: "hiking", name: "Hiking", type: "hobby", connections: 3 },
    { id: "drawing", name: "Drawing", type: "hobby", connections: 4 },
    { id: "coding", name: "Programming", type: "hobby", connections: 7 },
    { id: "gardening", name: "Gardening", type: "hobby", connections: 3 },
    { id: "cooking", name: "Cooking", type: "hobby", connections: 4 },
    
    // Academic Subjects
    { id: "physics", name: "Physics", type: "subject", connections: 8 },
    { id: "chemistry", name: "Chemistry", type: "subject", connections: 6 },
    { id: "mathematics", name: "Mathematics", type: "subject", connections: 9 },
    { id: "biology", name: "Biology", type: "subject", connections: 5 },
    { id: "computer-science", name: "Computer Science", type: "subject", connections: 8 },
    { id: "history", name: "History", type: "subject", connections: 3 },
    { id: "psychology", name: "Psychology", type: "subject", connections: 4 },
    { id: "literature", name: "Literature", type: "subject", connections: 3 },
    { id: "economics", name: "Economics", type: "subject", connections: 2 },
    
    // Physics Topics
    { id: "waves", name: "Waves", type: "topic", connections: 7 },
    { id: "sound-waves", name: "Sound Waves", type: "topic", connections: 5 },
    { id: "light-waves", name: "Light Waves", type: "topic", connections: 4 },
    { id: "mechanics", name: "Mechanics", type: "topic", connections: 3 },
    { id: "thermodynamics", name: "Thermodynamics", type: "topic", connections: 4 },
    { id: "electromagnetism", name: "Electromagnetism", type: "topic", connections: 3 },
    
    // Chemistry Topics
    { id: "organic-chemistry", name: "Organic Chemistry", type: "topic", connections: 3 },
    { id: "molecular-structure", name: "Molecular Structure", type: "topic", connections: 4 },
    { id: "chemical-reactions", name: "Chemical Reactions", type: "topic", connections: 5 },
    { id: "heat-transfer", name: "Heat Transfer", type: "topic", connections: 3 },
    
    // Math Topics
    { id: "calculus", name: "Calculus", type: "topic", connections: 6 },
    { id: "algebra", name: "Algebra", type: "topic", connections: 4 },
    { id: "geometry", name: "Geometry", type: "topic", connections: 3 },
    { id: "statistics", name: "Statistics", type: "topic", connections: 4 },
    { id: "linear-algebra", name: "Linear Algebra", type: "topic", connections: 3 },
    
    // Biology Topics
    { id: "ecology", name: "Ecology", type: "topic", connections: 3 },
    { id: "genetics", name: "Genetics", type: "topic", connections: 2 },
    { id: "cell-biology", name: "Cell Biology", type: "topic", connections: 3 },
    { id: "evolution", name: "Evolution", type: "topic", connections: 2 },
    
    // Computer Science Topics
    { id: "algorithms", name: "Algorithms", type: "topic", connections: 5 },
    { id: "data-structures", name: "Data Structures", type: "topic", connections: 4 },
    { id: "machine-learning", name: "Machine Learning", type: "topic", connections: 4 },
    { id: "web-development", name: "Web Development", type: "topic", connections: 3 },
    { id: "databases", name: "Databases", type: "topic", connections: 2 },
    
    // Key Connections
    { id: "frequency", name: "Frequency", type: "connection", connections: 5 },
    { id: "resonance", name: "Resonance", type: "connection", connections: 4 },
    { id: "vibration", name: "Vibration", type: "connection", connections: 3 },
    { id: "patterns", name: "Patterns", type: "connection", connections: 6 },
    { id: "symmetry", name: "Symmetry", type: "connection", connections: 4 },
    { id: "optimization", name: "Optimization", type: "connection", connections: 5 },
    { id: "energy", name: "Energy", type: "connection", connections: 4 },
    { id: "data-analysis", name: "Data Analysis", type: "connection", connections: 5 },
    { id: "problem-solving", name: "Problem Solving", type: "connection", connections: 7 },
    { id: "visualization", name: "Visualization", type: "connection", connections: 4 },
    { id: "logic", name: "Logic", type: "connection", connections: 5 },
    { id: "creativity", name: "Creativity", type: "connection", connections: 6 },
    { id: "composition", name: "Composition", type: "connection", connections: 3 },
    { id: "systems", name: "Systems", type: "connection", connections: 4 },
  ]

  const links: Link[] = [
    // Key hobby connections
    { source: "guitar", target: "sound-waves", strength: 0.9 },
    { source: "guitar", target: "frequency", strength: 0.8 },
    { source: "photography", target: "light-waves", strength: 0.8 },
    { source: "photography", target: "geometry", strength: 0.7 },
    { source: "gaming", target: "algorithms", strength: 0.7 },
    { source: "gaming", target: "problem-solving", strength: 0.8 },
    { source: "reading", target: "literature", strength: 0.9 },
    { source: "hiking", target: "ecology", strength: 0.8 },
    { source: "drawing", target: "geometry", strength: 0.8 },
    { source: "drawing", target: "creativity", strength: 0.9 },
    { source: "coding", target: "computer-science", strength: 0.9 },
    { source: "coding", target: "algorithms", strength: 0.8 },
    { source: "coding", target: "problem-solving", strength: 0.9 },
    { source: "gardening", target: "biology", strength: 0.8 },
    { source: "cooking", target: "chemistry", strength: 0.8 },
    { source: "baking", target: "chemistry", strength: 0.8 },
    
    // Core subject connections
    { source: "waves", target: "physics", strength: 0.9 },
    { source: "sound-waves", target: "physics", strength: 0.8 },
    { source: "light-waves", target: "physics", strength: 0.8 },
    { source: "mechanics", target: "physics", strength: 0.9 },
    { source: "thermodynamics", target: "physics", strength: 0.8 },
    
    { source: "organic-chemistry", target: "chemistry", strength: 0.9 },
    { source: "chemical-reactions", target: "chemistry", strength: 0.9 },
    { source: "heat-transfer", target: "chemistry", strength: 0.6 },
    
    { source: "calculus", target: "mathematics", strength: 0.9 },
    { source: "algebra", target: "mathematics", strength: 0.8 },
    { source: "geometry", target: "mathematics", strength: 0.8 },
    { source: "statistics", target: "mathematics", strength: 0.7 },
    
    { source: "ecology", target: "biology", strength: 0.9 },
    { source: "genetics", target: "biology", strength: 0.8 },
    { source: "cell-biology", target: "biology", strength: 0.9 },
    
    { source: "algorithms", target: "computer-science", strength: 0.9 },
    { source: "data-structures", target: "computer-science", strength: 0.8 },
    { source: "machine-learning", target: "computer-science", strength: 0.8 },
    
    // Key wave connections
    { source: "sound-waves", target: "waves", strength: 0.9 },
    { source: "light-waves", target: "waves", strength: 0.8 },
    { source: "frequency", target: "waves", strength: 0.7 },
    
    // Important cross-disciplinary links
    { source: "calculus", target: "physics", strength: 0.7 },
    { source: "statistics", target: "data-analysis", strength: 0.8 },
    { source: "machine-learning", target: "statistics", strength: 0.8 },
    { source: "data-analysis", target: "statistics", strength: 0.9 },
    
    // Key connection hubs
    { source: "problem-solving", target: "mathematics", strength: 0.7 },
    { source: "logic", target: "mathematics", strength: 0.8 },
    { source: "energy", target: "physics", strength: 0.7 },
    { source: "data-structures", target: "algorithms", strength: 0.8 },
    { source: "optimization", target: "algorithms", strength: 0.8 },
  ]

  useEffect(() => {
    if (!svgRef.current) return

    const svg = select(svgRef.current)
    svg.selectAll("*").remove()

    const width = 800
    const height = 600
    const margin = 40

    svg.attr("viewBox", `0 0 ${width} ${height}`)

    const g = svg.append("g")

    // Create zoom behavior with bounds
    const maxDistance = Math.min(width, height) / 1.8
    const padding = 50
    const horizontalPadding = 150 // More horizontal movement space
    
    zoomBehavior
      .scaleExtent([0.5, 3])
      .translateExtent([
        [width / 2 - maxDistance - horizontalPadding, height / 2 - maxDistance - padding],
        [width / 2 + maxDistance + horizontalPadding, height / 2 + maxDistance + padding]
      ])
      .on("zoom", (event) => {
        g.attr("transform", event.transform)
        setZoomLevel(event.transform.k)
      })

    svg.call(zoomBehavior as any)

    // Create force simulation
    const simulation = forceSimulation<Node>(nodes)
      .velocityDecay(0.7) // Reduce maximum velocity
      .force(
        "link",
        forceLink<Node, Link>(links)
          .id((d) => d.id)
          .strength((d) => d.strength * 0.3)
          .distance(100),
      )
      .force("charge", forceManyBody().strength(-250))
      .force("center", forceCenter(width / 2, height / 2))
      .force("collision", forceCollide().radius((d) => Math.sqrt((d as Node).connections) * 3 + 10))
      .force("bounds", () => {
        // Keep nodes within bounds but allow much more spread
        nodes.forEach((node) => {
          if (node.x && node.y) {
            // Very soft boundary force to keep nodes from flying too far
            const centerX = width / 2
            const centerY = height / 2
            const maxDistance = Math.min(width, height) / 1.8
            
            const dx = node.x - centerX
            const dy = node.y - centerY
            const distance = Math.sqrt(dx * dx + dy * dy)
            
            if (distance > maxDistance) {
              const force = (distance - maxDistance) * 0.02
              node.x! -= (dx / distance) * force
              node.y! -= (dy / distance) * force
            }
          }
        })
      })

    // Create links
    const link = g
      .append("g")
      .selectAll("line")
      .data(links)
      .enter()
      .append("line")
      .attr("stroke", "#9ca3af")
      .attr("stroke-opacity", 0.9)
      .attr("stroke-width", (d) => Math.sqrt(d.strength * 5))

    // Create nodes
    const node = g
      .append("g")
      .selectAll("g")
      .data(nodes)
      .enter()
      .append("g")
      .style("cursor", "pointer")
      .call(
        drag<SVGGElement, Node>()
          .on("start", (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart()
            d.fx = d.x
            d.fy = d.y
          })
          .on("drag", (event, d) => {
            d.fx = event.x
            d.fy = event.y
          })
          .on("end", (event, d) => {
            if (!event.active) simulation.alphaTarget(0)
            d.fx = null
            d.fy = null
          }),
      )

    // Add circles to nodes
    node
      .append("circle")
      .attr("r", (d) => Math.sqrt(d.connections) * 3 + 4)
      .attr("fill", (d) => {
        switch (d.type) {
          case "hobby":
            return "#78af9f" // green accent color
          case "subject":
            return "#c96442" // academic reddish-brown
          case "topic":
            return "#d1d5db" // medium gray
          case "connection":
            return "#9ca3af" // darker gray
          default:
            return "#6b7280" // darkest gray
        }
      })
      .attr("stroke", "#262624")
      .attr("stroke-width", 2)
      .on("click", (event, d) => {
        setSelectedNode(d)
      })



    // Update positions on simulation tick
    simulation.on("tick", () => {
      // Limit maximum velocity for smoother movement
      const maxVelocity = 1
      nodes.forEach((node) => {
        const d3Node = node as any
        if (d3Node.vx && d3Node.vy) {
          const velocity = Math.sqrt(d3Node.vx * d3Node.vx + d3Node.vy * d3Node.vy)
          if (velocity > maxVelocity) {
            d3Node.vx = (d3Node.vx / velocity) * maxVelocity
            d3Node.vy = (d3Node.vy / velocity) * maxVelocity
          }
        }
      })

      link
        .attr("x1", (d) => (d.source as Node).x!)
        .attr("y1", (d) => (d.source as Node).y!)
        .attr("x2", (d) => (d.target as Node).x!)
        .attr("y2", (d) => (d.target as Node).y!)

      node.attr("transform", (d) => `translate(${d.x},${d.y})`)
    })
  }, [])

  const handleZoomIn = () => {
    if (!svgRef.current) return
    const svg = select(svgRef.current)
    ;(svg as any).transition().call(zoomBehavior.scaleBy, 1.5)
  }

  const handleZoomOut = () => {
    if (!svgRef.current) return
    const svg = select(svgRef.current)
    ;(svg as any).transition().call(zoomBehavior.scaleBy, 1 / 1.5)
  }

  const handleReset = () => {
    if (!svgRef.current) return
    const svg = select(svgRef.current)
    ;(svg as any).transition().call(zoomBehavior.transform, zoomIdentity)
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "hobby":
        return "bg-[#78af9f]"
      case "subject":
        return "bg-[#c96442]"
      case "topic":
        return "bg-gray-300"
      case "connection":
        return "bg-gray-400"
      default:
        return "bg-gray-500"
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "hobby":
        return "Hobby"
      case "subject":
        return "Subject"
      case "topic":
        return "Topic"
      case "connection":
        return "Connection"
      default:
        return "Unknown"
    }
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-foreground">Learning Map</h1>
          <p className="text-muted-foreground text-lg">Visualize how your interests connect to your studies</p>
        </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2 text-white">
                    <Network className="h-5 w-5" />
                    <span>Knowledge Network</span>
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Click on nodes to explore connections • Drag to rearrange
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={handleZoomIn}>
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleZoomOut}>
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleReset}>
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="w-full h-96 border rounded-lg overflow-hidden bg-[#262624]">
                <svg ref={svgRef} className="w-full h-full" style={{ background: "#262624" }} />
              </div>
              <div className="flex items-center justify-center space-x-4 mt-4 text-sm text-gray-400">
                <span>Zoom: {Math.round(zoomLevel * 100)}%</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-white">Legend</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { type: "hobby", label: "Hobbies & Interests" },
                { type: "subject", label: "Academic Subjects" },
                { type: "topic", label: "Study Topics" },
                { type: "connection", label: "Key Connections" },
              ].map(({ type, label }) => (
                <div key={type} className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full ${getTypeColor(type)}`} />
                  <span className="text-sm text-gray-300">{label}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {selectedNode && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <div className={`w-3 h-3 rounded-full ${getTypeColor(selectedNode.type)}`} />
                  <span>{selectedNode.name}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Badge variant="secondary">{getTypeLabel(selectedNode.type)}</Badge>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-300">Connections</div>
                  <div className="text-2xl font-bold text-white">{selectedNode.connections}</div>
                </div>
                <div className="text-sm text-gray-400">
                  {selectedNode.type === "hobby" && "Your personal interests that make learning more engaging"}
                  {selectedNode.type === "subject" && "Academic subjects you're studying"}
                  {selectedNode.type === "topic" && "Specific topics within your subjects"}
                  {selectedNode.type === "connection" && "Key concepts that bridge your interests and studies"}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-white">Network Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-300">Total Nodes</span>
                <span className="font-medium text-white">{nodes.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-300">Connections</span>
                <span className="font-medium text-white">{links.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-300">Strongest Link</span>
                <span className="font-medium text-white">Programming → Problem Solving</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-300">Hub Nodes</span>
                <span className="font-medium text-white">Mathematics, Physics</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </div>
  )
}
