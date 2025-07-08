"use client"

import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Quote } from "lucide-react"
import { QuoteModule } from "./types"

interface QuoteModuleProps {
  module: QuoteModule
}

export function QuoteModuleComponent({ module }: QuoteModuleProps) {
  return (
    <Card className="w-full mb-6 bg-muted/30">
      <CardContent className="pt-6">
        <div className="flex items-start space-x-4">
          <Quote className="h-8 w-8 text-blue-500 mt-1 flex-shrink-0" />
          <div className="flex-1">
            <blockquote className="text-xl italic text-slate-700 mb-4">
              "{module.content}"
            </blockquote>
            {(module.author || module.citation) && (
              <div className="text-base text-slate-600">
                {module.author && <span className="font-medium">— {module.author}</span>}
                {module.citation && (
                  <span className="ml-2">
                    {module.author ? ', ' : '— '}
                    <em>{module.citation}</em>
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 