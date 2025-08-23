import { Shield } from "lucide-react"

interface SidebarHeaderProps {
  title: string
  subtitle: string
}

export function SidebarHeader({ title, subtitle }: SidebarHeaderProps) {
  return (
    <div className="flex items-center gap-2 mb-8">
      <Shield className="h-8 w-8 text-primary" />
      <div>
        <h2 className="text-lg font-bold text-sidebar-foreground">{title}</h2>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  )
}
