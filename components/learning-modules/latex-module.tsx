"use client"

import React, { useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LatexModule } from "./types"

interface LatexModuleProps {
  module: LatexModule
}

export function LatexModuleComponent({ module }: LatexModuleProps) {
  const mathRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Configure and load MathJax if not already loaded
    if (!window.MathJax) {
      // Configure MathJax before loading
      window.MathJax = {
        tex: {
          inlineMath: [['$', '$'], ['\\(', '\\)']],
          displayMath: [['$$', '$$'], ['\\[', '\\]']],
          processEscapes: true,
          processEnvironments: true
        },
        options: {
          processHtmlClass: 'mathjax',
          ignoreHtmlClass: 'no-mathjax'
        },
        startup: {
          ready: () => {
            window.MathJax.startup.defaultReady()
            console.log('MathJax is loaded and ready!')
          }
        }
      }
      
      const mathJaxScript = document.createElement('script')
      mathJaxScript.id = 'MathJax-script'
      mathJaxScript.async = true
      mathJaxScript.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js'
      document.head.appendChild(mathJaxScript)
    }
    
    // Render the equation after MathJax is loaded
    const renderEquation = () => {
      if (window.MathJax && window.MathJax.typesetPromise && mathRef.current) {
        window.MathJax.typesetPromise([mathRef.current]).then(() => {
          console.log('Equation rendered successfully')
        }).catch((err: any) => {
          console.error('MathJax rendering error:', err)
        })
      } else {
        // Retry if MathJax is not ready yet
        setTimeout(renderEquation, 500)
      }
    }
    
    const timer = setTimeout(renderEquation, 100)
    return () => clearTimeout(timer)
  }, [module.equation])

  return (
    <Card className="w-full bg-muted/30">
      {module.title && (
        <CardHeader className="pb-0 pt-3">
          <CardTitle className="text-xl font-semibold">
            {module.title}
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className="pt-0 pb-0">
        <div 
          ref={mathRef}
          className="mathjax text-center py-0 text-lg"
        >
          {`$$${module.equation}$$`}
        </div>
      </CardContent>
    </Card>
  )
}

// Extend window type for MathJax
declare global {
  interface Window {
    MathJax?: any
  }
} 