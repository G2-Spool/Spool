"use client"

import React from "react"
import { QuoteModule } from "./types"

interface QuoteModuleProps {
  module: QuoteModule
}

export function QuoteModuleComponent({ module }: QuoteModuleProps) {
  return (
    <div className="w-full">
      <div className="w-11/12 mx-auto border-l-4 border-muted-foreground/30 pl-6 pr-4 py-4 bg-muted/20 rounded-md" style={{width: '90%', maxWidth: '90%'}}>
        <blockquote className="text-base italic text-foreground mb-4">
          "{module.content}"
        </blockquote>
        {(module.author || module.citation) && (
          <div className="text-sm text-muted-foreground">
            {module.author && <span className="font-medium">— {module.author}</span>}
            {module.citation && (
              <span>
                {module.author ? ', ' : '— '}
                <em>{module.citation}</em>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
} 