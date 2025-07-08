"use client"

import React, { useEffect, useRef } from "react"
import { TextModule } from "./types"

interface TextModuleProps {
  module: TextModule
}

// Function to detect and format equations in text
function formatTextWithEquations(text: string): JSX.Element[] {
  const parts: JSX.Element[] = []
  
  // Regex to match LaTeX equations: $$...$$ for display, $...$ for inline
  const equationRegex = /(\$\$[\s\S]*?\$\$|\$[^$\n]*?\$)/g
  
  let lastIndex = 0
  let match
  let keyCounter = 0
  
  while ((match = equationRegex.exec(text)) !== null) {
    // Add text before the equation
    if (match.index > lastIndex) {
      const beforeText = text.slice(lastIndex, match.index)
      if (beforeText.trim()) {
        parts.push(<span key={`text-${keyCounter++}`}>{beforeText}</span>)
      }
    }
    
    // Add the equation
    const equation = match[0]
    const isDisplayMode = equation.startsWith('$$')
    
    parts.push(
      <span
        key={`equation-${keyCounter++}`}
        className={`mathjax-equation ${isDisplayMode ? 'block text-center my-4' : 'inline'}`}
        data-equation={equation}
      >
        {equation}
      </span>
    )
    
    lastIndex = match.index + match[0].length
  }
  
  // Add remaining text
  if (lastIndex < text.length) {
    const remainingText = text.slice(lastIndex)
    if (remainingText.trim()) {
      parts.push(<span key={`text-${keyCounter++}`}>{remainingText}</span>)
    }
  }
  
  // If no equations found, return the original text
  if (parts.length === 0) {
    parts.push(<span key="text-0">{text}</span>)
  }
  
  return parts
}

export function TextModuleComponent({ module }: TextModuleProps) {
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Configure and load MathJax if not already loaded
    if (!window.MathJax) {
      window.MathJax = {
        tex: {
          inlineMath: [['$', '$'], ['\\(', '\\)']],
          displayMath: [['$$', '$$'], ['\\[', '\\]']],
          processEscapes: true,
          processEnvironments: true
        },
        options: {
          processHtmlClass: 'mathjax-equation',
          ignoreHtmlClass: 'no-mathjax'
        },
        startup: {
          ready: () => {
            window.MathJax.startup.defaultReady()
          }
        }
      }
      
      const mathJaxScript = document.createElement('script')
      mathJaxScript.id = 'MathJax-script'
      mathJaxScript.async = true
      mathJaxScript.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js'
      document.head.appendChild(mathJaxScript)
    }
    
    // Render equations after content is loaded
    const renderEquations = () => {
      if (window.MathJax && window.MathJax.typesetPromise && contentRef.current) {
        window.MathJax.typesetPromise([contentRef.current]).catch((err: any) => {
          console.error('MathJax rendering error:', err)
        })
      } else {
        setTimeout(renderEquations, 500)
      }
    }
    
    const timer = setTimeout(renderEquations, 100)
    return () => clearTimeout(timer)
  }, [module.content])

  return (
    <div className="w-full">
      {module.title && (
        <h3 className="text-xl font-semibold mb-3">{module.title}</h3>
      )}
      <div ref={contentRef} className="prose prose-xl max-w-none">
        {module.content.split('\n\n').map((paragraph, index) => (
          <p key={index} className="mb-4 text-foreground leading-relaxed text-base">
            {formatTextWithEquations(paragraph)}
          </p>
        ))}
      </div>
    </div>
  )
}

// Extend window type for MathJax
declare global {
  interface Window {
    MathJax?: any
  }
} 