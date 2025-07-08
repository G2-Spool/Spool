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
    // Physics Cluster - completely isolated
    { source: "physics", target: "waves", strength: 0.9 },
    { source: "physics", target: "mechanics", strength: 0.9 },
    { source: "physics", target: "thermodynamics", strength: 0.8 },
    { source: "physics", target: "electromagnetism", strength: 0.8 },
    { source: "waves", target: "sound-waves", strength: 0.9 },
    { source: "waves", target: "light-waves", strength: 0.8 },
    { source: "waves", target: "frequency", strength: 0.7 },
    { source: "sound-waves", target: "guitar", strength: 0.9 },
    { source: "sound-waves", target: "resonance", strength: 0.8 },
    { source: "light-waves", target: "photography", strength: 0.8 },
    { source: "thermodynamics", target: "heat-transfer", strength: 0.8 },
    { source: "thermodynamics", target: "energy", strength: 0.7 },
    { source: "frequency", target: "vibration", strength: 0.8 },
    { source: "resonance", target: "vibration", strength: 0.7 },
    { source: "energy", target: "mechanics", strength: 0.6 },

    // Chemistry Cluster - completely isolated
    { source: "chemistry", target: "organic-chemistry", strength: 0.9 },
    { source: "chemistry", target: "chemical-reactions", strength: 0.9 },
    { source: "chemistry", target: "molecular-structure", strength: 0.8 },
    { source: "organic-chemistry", target: "molecular-structure", strength: 0.8 },
    { source: "chemical-reactions", target: "organic-chemistry", strength: 0.7 },
    { source: "cooking", target: "chemistry", strength: 0.8 },
    { source: "baking", target: "chemistry", strength: 0.8 },
    { source: "baking", target: "cooking", strength: 0.7 },

    // Mathematics Cluster - completely isolated
    { source: "mathematics", target: "calculus", strength: 0.9 },
    { source: "mathematics", target: "algebra", strength: 0.8 },
    { source: "mathematics", target: "geometry", strength: 0.8 },
    { source: "mathematics", target: "statistics", strength: 0.7 },
    { source: "mathematics", target: "linear-algebra", strength: 0.8 },
    { source: "calculus", target: "algebra", strength: 0.6 },
    { source: "geometry", target: "drawing", strength: 0.8 },
    { source: "geometry", target: "symmetry", strength: 0.7 },
    { source: "statistics", target: "linear-algebra", strength: 0.6 },
    { source: "algebra", target: "patterns", strength: 0.7 },
    { source: "linear-algebra", target: "patterns", strength: 0.6 },
    { source: "drawing", target: "creativity", strength: 0.9 },
    { source: "patterns", target: "symmetry", strength: 0.8 },
    { source: "logic", target: "mathematics", strength: 0.7 },

    // Computer Science Cluster - completely isolated
    { source: "computer-science", target: "algorithms", strength: 0.9 },
    { source: "computer-science", target: "data-structures", strength: 0.8 },
    { source: "computer-science", target: "machine-learning", strength: 0.8 },
    { source: "computer-science", target: "web-development", strength: 0.7 },
    { source: "computer-science", target: "databases", strength: 0.7 },
    { source: "algorithms", target: "data-structures", strength: 0.8 },
    { source: "algorithms", target: "optimization", strength: 0.8 },
    { source: "machine-learning", target: "data-analysis", strength: 0.9 },
    { source: "coding", target: "computer-science", strength: 0.9 },
    { source: "coding", target: "algorithms", strength: 0.8 },
    { source: "gaming", target: "algorithms", strength: 0.7 },
    { source: "gaming", target: "problem-solving", strength: 0.8 },
    { source: "web-development", target: "visualization", strength: 0.7 },
    { source: "databases", target: "data-structures", strength: 0.6 },
    { source: "problem-solving", target: "optimization", strength: 0.7 },
    { source: "data-analysis", target: "visualization", strength: 0.6 },

    // Biology Cluster - completely isolated
    { source: "biology", target: "ecology", strength: 0.9 },
    { source: "biology", target: "genetics", strength: 0.8 },
    { source: "biology", target: "cell-biology", strength: 0.9 },
    { source: "biology", target: "evolution", strength: 0.8 },
    { source: "ecology", target: "systems", strength: 0.8 },
    { source: "genetics", target: "cell-biology", strength: 0.7 },
    { source: "cell-biology", target: "evolution", strength: 0.6 },
    { source: "evolution", target: "systems", strength: 0.7 },
    { source: "gardening", target: "biology", strength: 0.8 },
    { source: "gardening", target: "ecology", strength: 0.7 },
    { source: "hiking", target: "ecology", strength: 0.8 },

    // Humanities Cluster - completely isolated
    { source: "history", target: "literature", strength: 0.8 },
    { source: "history", target: "psychology", strength: 0.7 },
    { source: "literature", target: "reading", strength: 0.9 },
    { source: "literature", target: "composition", strength: 0.8 },
    { source: "psychology", target: "reading", strength: 0.6 },
    { source: "reading", target: "composition", strength: 0.7 },
    { source: "composition", target: "literature", strength: 0.6 },
    { source: "psychology", target: "history", strength: 0.5 },

    // Note: Economics node removed to avoid isolated nodes
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

    // Create zoom behavior with circular bounds
    const radius = Math.min(width, height) / 2 - 40
    const padding = 80
    
    zoomBehavior
      .scaleExtent([0.5, 3])
      .translateExtent([
        [width / 2 - radius - padding, height / 2 - radius - padding],
        [width / 2 + radius + padding, height / 2 + radius + padding]
      ])
      .on("zoom", (event) => {
        g.attr("transform", event.transform)
        setZoomLevel(event.transform.k)
      })

    svg.call(zoomBehavior as any)

    // Define cluster centers closer together for less separation
    const clusterCenters = {
      physics: { x: width * 0.3, y: height * 0.3 },
      chemistry: { x: width * 0.7, y: height * 0.3 },
      mathematics: { x: width * 0.3, y: height * 0.7 },
      "computer-science": { x: width * 0.7, y: height * 0.7 },
      biology: { x: width * 0.5, y: height * 0.25 },
      humanities: { x: width * 0.5, y: height * 0.75 },
    }

    // Assign nodes to clusters
    const getClusterForNode = (nodeId: string) => {
      const physicsNodes = ["physics", "waves", "mechanics", "thermodynamics", "electromagnetism", "sound-waves", "light-waves", "frequency", "vibration", "resonance", "energy", "heat-transfer", "guitar", "photography"]
      const chemistryNodes = ["chemistry", "organic-chemistry", "chemical-reactions", "molecular-structure", "cooking", "baking"]
      const mathNodes = ["mathematics", "calculus", "algebra", "geometry", "statistics", "linear-algebra", "patterns", "symmetry", "logic", "creativity", "drawing"]
      const csNodes = ["computer-science", "algorithms", "data-structures", "machine-learning", "web-development", "databases", "problem-solving", "optimization", "data-analysis", "visualization", "coding", "gaming"]
      const biologyNodes = ["biology", "ecology", "genetics", "cell-biology", "evolution", "systems", "gardening", "hiking"]
      const humanitiesNodes = ["history", "literature", "psychology", "composition", "reading"]

      if (physicsNodes.includes(nodeId)) return "physics"
      if (chemistryNodes.includes(nodeId)) return "chemistry"
      if (mathNodes.includes(nodeId)) return "mathematics"
      if (csNodes.includes(nodeId)) return "computer-science"
      if (biologyNodes.includes(nodeId)) return "biology"
      if (humanitiesNodes.includes(nodeId)) return "humanities"
      return "physics" // fallback
    }

    // Create force simulation optimized for disjoint clusters
    const simulation = forceSimulation<Node>(nodes)
      .velocityDecay(0.8) // Moderate decay for natural movement
      .force(
        "link",
        forceLink<Node, Link>(links)
          .id((d) => d.id)
          .strength((d) => d.strength * 0.3) // Gentler links for looser clusters
          .distance(120), // Longer distance for more spread
      )
      .force("charge", forceManyBody().strength(-200).distanceMax(250)) // Gentler repulsion with longer range
      .force("collision", forceCollide().radius((d) => Math.sqrt((d as Node).connections) * 3 + 8).strength(0.7))
      .force("cluster", () => {
        // Very gentle force toward cluster centers
        nodes.forEach((node) => {
          const cluster = getClusterForNode(node.id)
          const center = clusterCenters[cluster as keyof typeof clusterCenters]
          if (center && node.x && node.y) {
            const dx = center.x - node.x
            const dy = center.y - node.y
            const distance = Math.sqrt(dx * dx + dy * dy)
            if (distance > 100) { // Only apply if far from center
              const force = (distance - 100) * 0.02 // Very gentle pull
              node.x! += (dx / distance) * force
              node.y! += (dy / distance) * force
            }
          }
        })
      })
             .force("separate", () => {
         // Reduced inter-cluster repulsion for closer clusters
         for (let i = 0; i < nodes.length; i++) {
           for (let j = i + 1; j < nodes.length; j++) {
             const nodeA = nodes[i]
             const nodeB = nodes[j]
             const clusterA = getClusterForNode(nodeA.id)
             const clusterB = getClusterForNode(nodeB.id)
             
             // Only apply repulsion between different clusters
             if (clusterA !== clusterB && nodeA.x && nodeA.y && nodeB.x && nodeB.y) {
               const dx = nodeB.x - nodeA.x
               const dy = nodeB.y - nodeA.y
               const distance = Math.sqrt(dx * dx + dy * dy)
               
               if (distance < 100) { // Even smaller threshold for closer clusters
                 const force = (100 - distance) * 0.005 // Much weaker repulsion
                 const normalizedDx = dx / distance
                 const normalizedDy = dy / distance
                 
                 nodeA.x! -= normalizedDx * force
                 nodeA.y! -= normalizedDy * force
                 nodeB.x! += normalizedDx * force
                 nodeB.y! += normalizedDy * force
               }
             }
           }
         }
       })
       .force("bounds", () => {
         // Circular boundary instead of rectangular
         const centerX = width / 2
         const centerY = height / 2
         const radius = Math.min(width, height) / 2 - 40 // Circular boundary with padding
         
         nodes.forEach((node) => {
           if (node.x && node.y) {
             const dx = node.x - centerX
             const dy = node.y - centerY
             const distance = Math.sqrt(dx * dx + dy * dy)
             
             if (distance > radius) {
               // Push node back inside the circle
               const force = (distance - radius) * 0.1
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
                <span className="text-sm text-gray-300">Clusters</span>
                <span className="font-medium text-white">5 separate groups</span>
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
