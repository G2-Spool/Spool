"use client"

import React, { useEffect, useRef } from 'react'
import * as d3 from 'd3'

interface Node {
  id: string
  x?: number
  y?: number
  fx?: number | null
  fy?: number | null
  color?: string
}

interface Link {
  source: string | Node
  target: string | Node
}

interface ForceGraphProps {
  nodes: Node[]
  links: Link[]
  width?: number
  height?: number
  nodeColor?: string
  linkColor?: string
  nodeRadius?: number
  className?: string
  animate?: boolean
}

export function ForceGraph({
  nodes,
  links,
  width = 200,
  height = 200,
  nodeColor = '#f97316', // orange-500
  linkColor = '#d1d5db', // gray-300
  nodeRadius = 8,
  className = '',
  animate = true
}: ForceGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const simulationRef = useRef<d3.Simulation<Node, Link> | null>(null)

  useEffect(() => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    // Create container group
    const container = svg.append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`)

    // Clone nodes and links to avoid mutation issues
    const nodesCopy = nodes.map(d => ({ ...d }))
    const linksCopy = links.map(d => ({ ...d }))

    // Add subtle glow effect
    const defs = svg.append('defs')
    const filter = defs.append('filter')
      .attr('id', `glow-${Date.now()}`)
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%')

    filter.append('feGaussianBlur')
      .attr('stdDeviation', '3')
      .attr('result', 'coloredBlur')

    const feMerge = filter.append('feMerge')
    feMerge.append('feMergeNode')
      .attr('in', 'coloredBlur')
    feMerge.append('feMergeNode')
      .attr('in', 'SourceGraphic')

    // Create force simulation first
    const simulation = d3.forceSimulation(nodesCopy)
      .force('link', d3.forceLink(linksCopy).id((d: any) => d.id).distance(35).strength(1))
      .force('charge', d3.forceManyBody().strength(-150))
      .force('center', d3.forceCenter(0, 0))
      .force('collision', d3.forceCollide().radius(nodeRadius + 3))
      .alphaDecay(0.01)
      .velocityDecay(0.4)
      .stop() // Stop initially to let us control when it starts

    simulationRef.current = simulation

    // Create links after force simulation is set up
    const link = container.selectAll('.link')
      .data(linksCopy)
      .enter()
      .append('line')
      .attr('class', 'link')
      .attr('stroke', linkColor)
      .attr('stroke-width', 2)
      .attr('opacity', animate ? 0 : 0.6)

    // Create nodes
    const node = container.selectAll('.node')
      .data(nodesCopy)
      .enter()
      .append('circle')
      .attr('class', 'node')
      .attr('r', animate ? 0 : nodeRadius)
      .attr('fill', (d: Node) => d.color || nodeColor)
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .attr('filter', `url(#glow-${Date.now()})`)

    // Function to update positions
    const updatePositions = () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y)

      node
        .attr('cx', (d: any) => d.x)
        .attr('cy', (d: any) => d.y)
    }

    // Set up tick handler
    simulation.on('tick', updatePositions)

    // Start simulation and let it run for initial stabilization
    simulation.restart()
    
    // Run simulation for initial ticks to stabilize
    for (let i = 0; i < 100; i++) {
      simulation.tick()
    }

    // Update positions immediately after stabilization
    updatePositions()

    // Add entrance animation
    if (animate) {
      node
        .transition()
        .duration(800)
        .delay((d: Node, i: number) => i * 100)
        .attr('r', nodeRadius)

      link
        .transition()
        .duration(800)
        .delay(200)
        .attr('opacity', 0.6)
    }

    return () => {
      if (simulationRef.current) {
        simulationRef.current.stop()
      }
    }
  }, [nodes, links, width, height, nodeColor, linkColor, nodeRadius, animate])

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      className={className}
      style={{ overflow: 'visible' }}
    />
  )
}

// Helper function to generate academic network data
export function generateAcademicNetwork(): { nodes: Node[], links: Link[] } {
  const nodes: Node[] = [
    { id: 'math' },
    { id: 'physics' },
    { id: 'chemistry' },
    { id: 'biology' },
    { id: 'english' },
    { id: 'history' },
    { id: 'economics' },
    { id: 'psychology' }
  ]

  const links: Link[] = [
    { source: 'math', target: 'physics' },
    { source: 'math', target: 'chemistry' },
    { source: 'math', target: 'economics' },
    { source: 'physics', target: 'chemistry' },
    { source: 'chemistry', target: 'biology' },
    { source: 'english', target: 'history' },
    { source: 'history', target: 'economics' },
    { source: 'psychology', target: 'biology' },
    { source: 'economics', target: 'psychology' }
  ]

  return { nodes, links }
}

// Helper function to generate hobby network data
export function generateHobbyNetwork(): { nodes: Node[], links: Link[] } {
  const nodes: Node[] = [
    { id: 'guitar' },
    { id: 'gaming' },
    { id: 'cooking' },
    { id: 'art' },
    { id: 'sports' },
    { id: 'music' },
    { id: 'reading' },
    { id: 'coding' },
    { id: 'photography' },
    { id: 'travel' }
  ]

  const links: Link[] = [
    { source: 'guitar', target: 'music' },
    { source: 'gaming', target: 'coding' },
    { source: 'cooking', target: 'art' },
    { source: 'art', target: 'reading' },
    { source: 'sports', target: 'music' },
    { source: 'music', target: 'reading' },
    { source: 'coding', target: 'gaming' },
    { source: 'art', target: 'music' },
    // Additional connections to make network more cohesive
    { source: 'guitar', target: 'art' },
    { source: 'sports', target: 'gaming' },
    { source: 'reading', target: 'coding' },
    { source: 'cooking', target: 'music' },
    { source: 'guitar', target: 'coding' },
    { source: 'sports', target: 'art' },
    // New node connections
    { source: 'photography', target: 'art' },
    { source: 'photography', target: 'travel' },
    { source: 'travel', target: 'reading' },
    { source: 'travel', target: 'cooking' },
    { source: 'photography', target: 'sports' },
    { source: 'travel', target: 'music' }
  ]

  return { nodes, links }
} 