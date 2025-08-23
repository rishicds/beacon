import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import type { LucideIcon } from "lucide-react"

interface SidebarNavItemProps {
  href: string
  icon: LucideIcon
  label: string
  badge?: {
    text: string
    variant?: "default" | "destructive" | "outline" | "secondary"
  }
}

export function SidebarNavItem({ href, icon: Icon, label, badge }: SidebarNavItemProps) {
  return (
    <Button variant="ghost" className="w-full justify-start" asChild>
      <Link href={href}>
        <Icon className="h-4 w-4 mr-3" />
        {label}
        {badge && (
          <Badge variant={badge.variant || "default"} className="ml-auto">
            {badge.text}
          </Badge>
        )}
      </Link>
    </Button>
  )
}
