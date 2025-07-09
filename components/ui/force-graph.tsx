"use client"

import React, { useEffect, useRef } from 'react'
import * as d3 from 'd3'

interface Node {
  id: string
  x?: number
  y?: number
  fx?: number | null
  fy?: number | null
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

    // Create links
    const link = container.selectAll('.link')
      .data(links)
      .enter()
      .append('line')
      .attr('class', 'link')
      .attr('stroke', linkColor)
      .attr('stroke-width', 2)
      .attr('opacity', 0.6)

    // Create nodes
    const node = container.selectAll('.node')
      .data(nodes)
      .enter()
      .append('circle')
      .attr('class', 'node')
      .attr('r', nodeRadius)
      .attr('fill', nodeColor)
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)

    // Add subtle glow effect
    const defs = svg.append('defs')
    const filter = defs.append('filter')
      .attr('id', 'glow')
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

    node.attr('filter', 'url(#glow)')

    // Create force simulation
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id((d: any) => d.id).distance(30))
      .force('charge', d3.forceManyBody().strength(-100))
      .force('center', d3.forceCenter(0, 0))
      .force('collision', d3.forceCollide().radius(nodeRadius + 2))

    simulationRef.current = simulation

    // Update positions on each tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y)

      node
        .attr('cx', (d: any) => d.x)
        .attr('cy', (d: any) => d.y)
    })

    // Add entrance animation
    if (animate) {
      node
        .attr('r', 0)
        .transition()
        .duration(800)
        .delay((d: Node, i: number) => i * 100)
        .attr('r', nodeRadius)

      link
        .attr('opacity', 0)
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
    { id: 'coding' }
  ]

  const links: Link[] = [
    { source: 'guitar', target: 'music' },
    { source: 'gaming', target: 'coding' },
    { source: 'cooking', target: 'art' },
    { source: 'art', target: 'reading' },
    { source: 'sports', target: 'music' },
    { source: 'music', target: 'reading' },
    { source: 'coding', target: 'gaming' },
    { source: 'art', target: 'music' }
  ]

  return { nodes, links }
} 