"use client"

import React from "react"
import { DiagramModule } from "./types"
import Image from "next/image"

interface DiagramModuleProps {
  module: DiagramModule
}

export function DiagramModuleComponent({ module }: DiagramModuleProps) {
  return (
    <div className="w-full">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative w-3/5 max-w-2xl">
          <Image
            src={module.imageUrl}
            alt={module.alt || module.caption}
            width={800}
            height={600}
            className="rounded-lg shadow-md w-full h-auto"
            style={{ objectFit: 'contain' }}
          />
        </div>
        <div className="text-center">
          <p className="text-base text-muted-foreground italic">
            {module.caption}
          </p>
        </div>
      </div>
    </div>
  )
} 