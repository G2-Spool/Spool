"use client"

interface PageHeaderProps {
  title: string
  description: string
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div className="space-y-4">
      <h1 className="text-4xl font-bold text-foreground">{title}</h1>
      <p className="text-muted-foreground text-lg">{description}</p>
    </div>
  )
}
