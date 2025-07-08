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
    { id: "guitar", name: "Guitar Playing", type: "hobby", connections: 4 },
    { id: "baking", name: "Baking", type: "hobby", connections: 2 },
    { id: "physics", name: "Physics", type: "subject", connections: 3 },
    { id: "waves", name: "Waves", type: "topic", connections: 5 },
    { id: "sound-waves", name: "Sound Waves", type: "topic", connections: 3 },
    { id: "frequency", name: "Frequency", type: "connection", connections: 2 },
    { id: "resonance", name: "Resonance", type: "connection", connections: 3 },
    { id: "vibration", name: "Vibration", type: "connection", connections: 2 },
    { id: "chemistry", name: "Chemistry", type: "subject", connections: 1 },
    { id: "heat-transfer", name: "Heat Transfer", type: "topic", connections: 2 },
  ]

  const links: Link[] = [
    { source: "guitar", target: "sound-waves", strength: 0.9 },
    { source: "guitar", target: "frequency", strength: 0.8 },
    { source: "guitar", target: "vibration", strength: 0.7 },
    { source: "guitar", target: "resonance", strength: 0.6 },
    { source: "sound-waves", target: "waves", strength: 0.9 },
    { source: "sound-waves", target: "physics", strength: 0.8 },
    { source: "waves", target: "physics", strength: 0.9 },
    { source: "frequency", target: "waves", strength: 0.7 },
    { source: "vibration", target: "waves", strength: 0.6 },
    { source: "resonance", target: "physics", strength: 0.5 },
    { source: "baking", target: "chemistry", strength: 0.8 },
    { source: "baking", target: "heat-transfer", strength: 0.7 },
    { source: "heat-transfer", target: "chemistry", strength: 0.6 },
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

    // Create zoom behavior
    zoomBehavior.scaleExtent([0.5, 3]).on("zoom", (event) => {
      g.attr("transform", event.transform)
      setZoomLevel(event.transform.k)
    })

    svg.call(zoomBehavior)

    // Create force simulation
    const simulation = forceSimulation<Node>(nodes)
      .force(
        "link",
        forceLink<Node, Link>(links)
          .id((d) => d.id)
          .strength((d) => d.strength),
      )
      .force("charge", forceManyBody().strength(-300))
      .force("center", forceCenter(width / 2, height / 2))
      .force("collision", forceCollide().radius(30))

    // Create links
    const link = g
      .append("g")
      .selectAll("line")
      .data(links)
      .enter()
      .append("line")
      .attr("stroke", "#555")
      .attr("stroke-opacity", 0.6)
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
      .attr("r", (d) => Math.sqrt(d.connections) * 8 + 10)
      .attr("fill", (d) => {
        switch (d.type) {
          case "hobby":
            return "#78af9f" // primary accent color
          case "subject":
            return "#e5e7eb" // light gray
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

    // Add labels to nodes
    node
      .append("text")
      .text((d) => d.name)
      .attr("text-anchor", "middle")
      .attr("dy", ".35em")
      .attr("font-size", "12px")
      .attr("font-weight", "bold")
      .attr("fill", (d) => {
        // Use dark text for light colored nodes, light text for dark nodes
        switch (d.type) {
          case "hobby":
            return "#262624" // dark text on accent color
          case "subject":
          case "topic":
          case "connection":
            return "#262624" // dark text on light gray nodes
          default:
            return "#f9fafb" // light text
        }
      })
      .style("pointer-events", "none")

    // Update positions on simulation tick
    simulation.on("tick", () => {
      link
        .attr("x1", (d) => (d.source as Node).x!)
        .attr("y1", (d) => (d.source as Node).y!)
        .attr("x2", (d) => (d.target as Node).x!)
        .attr("y2", (d) => (d.target as Node).y!)

      node.attr("transform", (d) => `translate(${d.x},${d.y})`)
    })
  }, [])

  const handleZoomIn = () => {
    const svg = select(svgRef.current)
    svg.transition().call(zoomBehavior.scaleBy, 1.5)
  }

  const handleZoomOut = () => {
    const svg = select(svgRef.current)
    svg.transition().call(zoomBehavior.scaleBy, 1 / 1.5)
  }

  const handleReset = () => {
    const svg = select(svgRef.current)
    svg.transition().call(zoomBehavior.transform, zoomIdentity)
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "hobby":
        return "bg-[#78af9f]"
      case "subject":
        return "bg-gray-200"
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
                <span className="font-medium text-white">Guitar → Sound Waves</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </div>
  )
}
