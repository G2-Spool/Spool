"use client"

interface PageHeaderProps {
  title: string
  description: string
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div className="space-y-1">
      <h2 className="text-2xl font-bold tracking-tight text-white">{title}</h2>
      <p className="text-gray-300">{description}</p>
    </div>
  )
}
