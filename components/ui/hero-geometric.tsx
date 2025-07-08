"use client";

import { motion, type Variants } from "framer-motion";
import { Circle } from "lucide-react";
import { useEffect, useState, useRef } from "react";

// Helper function for cn (tailwind-merge like functionality)
function cn(...inputs: (string | undefined | null | boolean)[]) {
    return inputs.filter(Boolean).join(' ');
}

interface Node {
    id: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    color: string;
    connections: number[];
}

interface Connection {
    source: number;
    target: number;
    distance: number;
}

function ForceGraph() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number | undefined>(undefined);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    
    const colors = [
        'rgba(99, 102, 241, 0.6)',   // indigo
        'rgba(244, 63, 94, 0.6)',    // rose
        'rgba(139, 92, 246, 0.6)',   // violet
        'rgba(245, 158, 11, 0.6)',   // amber
        'rgba(6, 182, 212, 0.6)',    // cyan
    ];

    useEffect(() => {
        const updateDimensions = () => {
            setDimensions({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };

        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    useEffect(() => {
        if (!canvasRef.current || dimensions.width === 0) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = dimensions.width;
        canvas.height = dimensions.height;

        // Create nodes
        const nodeCount = 60;
        const nodes: Node[] = [];
        const connections: Connection[] = [];

        // Spawn nodes evenly distributed within a circular area
        const centerX = dimensions.width / 2;
        const centerY = dimensions.height / 2;
        const maxRadius = Math.min(dimensions.width, dimensions.height) * 0.6;
        
        for (let i = 0; i < nodeCount; i++) {
            // Generate random angle (0 to 2π)
            const angle = Math.random() * Math.PI * 2;
            
            // Generate random radius with uniform distribution within circle
            // Using sqrt to ensure uniform area distribution
            const radius = Math.sqrt(Math.random()) * maxRadius;
            
            // Convert polar to cartesian coordinates
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            
            nodes.push({
                id: i,
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 0.025,
                vy: (Math.random() - 0.5) * 0.025,
                radius: Math.random() * 4 + 2,
                color: colors[Math.floor(Math.random() * colors.length)],
                connections: [],
            });
        }

        // Create connections between nearby nodes
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const dx = nodes[i].x - nodes[j].x;
                const dy = nodes[i].y - nodes[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 150 && Math.random() > 0.7) {
                    connections.push({
                        source: i,
                        target: j,
                        distance: distance,
                    });
                    nodes[i].connections.push(j);
                    nodes[j].connections.push(i);
                }
            }
        }

        const startTime = Date.now();

        const animate = () => {
            ctx.clearRect(0, 0, dimensions.width, dimensions.height);

            const currentTime = Date.now();
            const elapsedTime = (currentTime - startTime) / 1000; // Convert to seconds
            
            // Calculate damping factor based on time
            let dampingFactor = 0.998;
            let forceMultiplier = 1;
            
            if (elapsedTime > 2.5) {
                // After 3 seconds, stop all motion
                dampingFactor = 0.8;
                forceMultiplier = 0;
            }

            // Apply forces
            nodes.forEach((node, i) => {
                if (forceMultiplier > 0.001) { // Only apply forces if not fully stopped
                    // Repulsion between nodes (reduced during convergence)
                    nodes.forEach((other, j) => {
                        if (i !== j) {
                            const dx = node.x - other.x;
                            const dy = node.y - other.y;
                            const distance = Math.sqrt(dx * dx + dy * dy);
                            
                            if (distance > 0 && distance < 100) {
                                const force = (0.00625 / (distance * distance)) * forceMultiplier;
                                node.vx += (dx / distance) * force;
                                node.vy += (dy / distance) * force;
                            }
                        }
                    });

                    // Gradual attraction to center for convergence
                    const centerX = dimensions.width / 2;
                    const centerY = dimensions.height / 2;
                    const dx = centerX - node.x;
                    const dy = centerY - node.y;
                    const attractionForce = elapsedTime < 3.0 ? 0.0005 : 0;
                    node.vx += dx * attractionForce;
                    node.vy += dy * attractionForce;
                }

                // Apply damping
                if (elapsedTime > 3.0) {
                    // Stop all motion after 3 seconds
                    node.vx = 0;
                    node.vy = 0;
                } else {
                    node.vx *= dampingFactor;
                    node.vy *= dampingFactor;
                    
                    // Update position
                    node.x += node.vx;
                    node.y += node.vy;
                }

                // Boundary conditions (softer during convergence)
                if (node.x < 0 || node.x > dimensions.width) node.vx *= -0.3;
                if (node.y < 0 || node.y > dimensions.height) node.vy *= -0.3;
                
                node.x = Math.max(0, Math.min(dimensions.width, node.x));
                node.y = Math.max(0, Math.min(dimensions.height, node.y));
            });

            // Draw connections
            connections.forEach(connection => {
                const source = nodes[connection.source];
                const target = nodes[connection.target];
                
                const dx = target.x - source.x;
                const dy = target.y - source.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 200) {
                    ctx.beginPath();
                    ctx.moveTo(source.x, source.y);
                    ctx.lineTo(target.x, target.y);
                    ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 * (1 - distance / 200)})`;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            });

            // Draw nodes
            nodes.forEach(node => {
                ctx.beginPath();
                ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
                ctx.fillStyle = node.color;
                ctx.fill();
                
                // Add glow effect
                ctx.beginPath();
                ctx.arc(node.x, node.y, node.radius * 2, 0, Math.PI * 2);
                ctx.fillStyle = node.color.replace('0.6', '0.1');
                ctx.fill();
            });

            animationRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [dimensions]);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full"
            style={{ background: 'transparent' }}
        />
    );
}

function HeroGeometric({
    title1 = "Elevate Your Digital Vision",
    title2 = "Crafting Exceptional Websites",
}: {
    title1?: string;
    title2?: string;
}) {
    const fadeUpVariants: Variants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 1,
                delay: 0.5,
                ease: [0.25, 0.4, 0.25, 1] as [number, number, number, number],
            },
        },
    };

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#030303] pt-16">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.05] via-transparent to-rose-500/[0.05] blur-3xl" />

            <div className="absolute inset-0 overflow-hidden">
                <ForceGraph />
            </div>

            <div className="relative z-10 container mx-auto px-4 md:px-6">
                <div className="max-w-3xl mx-auto text-center">
                    <motion.div
                        variants={fadeUpVariants}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: 0.7 }}
                    >
                        <h1 className="text-4xl sm:text-6xl md:text-8xl font-bold mb-6 md:mb-8 tracking-tight">
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-accent via-white to-accent">
                                {title1}
                            </span>
                            <br />
                            <span
                                className={cn(
                                    "bg-clip-text text-transparent bg-gradient-to-r from-accent via-white/90 to-accent/80 "
                                )}
                            >
                                {title2}
                            </span>
                        </h1>
                    </motion.div>

                    <motion.div
                        variants={fadeUpVariants}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: 0.9 }}
                    >
                        <p className="text-base sm:text-lg md:text-xl text-white/40 mb-8 leading-relaxed font-light tracking-wide max-w-xl mx-auto px-4">
                            Crafting exceptional digital experiences through
                            innovative design and cutting-edge technology.
                        </p>
                    </motion.div>
                </div>
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-transparent to-[#030303]/80 pointer-events-none" />
        </div>
    );
}

export default HeroGeometric; 