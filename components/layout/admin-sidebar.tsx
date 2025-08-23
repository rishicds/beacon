import { Button } from "@/components/ui/button"
import { LayoutDashboard, Mail, Eye, Users, Settings, AlertTriangle, LogOut } from "lucide-react"
import { SidebarHeader } from "./sidebar-header"
import { SidebarNavItem } from "./sidebar-nav-item"

export function AdminSidebar() {
  return (
    <div className="w-64 bg-sidebar border-r border-sidebar-border">
      <div className="p-6">
        <SidebarHeader title="SecureBeacon" subtitle="Admin Panel" />

        <nav className="space-y-2">
          <SidebarNavItem href="/admin" icon={LayoutDashboard} label="Dashboard" />
          <SidebarNavItem href="/admin/compose" icon={Mail} label="Compose Email" />
          <SidebarNavItem href="/admin/tracking" icon={Eye} label="Email Tracking" />
          <SidebarNavItem href="/admin/users" icon={Users} label="User Management" />
          <SidebarNavItem
            href="/admin/security"
            icon={AlertTriangle}
            label="Security Alerts"
            badge={{ text: "3", variant: "destructive" }}
          />
          <SidebarNavItem href="/admin/settings" icon={Settings} label="Settings" />
        </nav>

        <div className="mt-auto pt-8">
          <Button variant="ghost" className="w-full justify-start text-muted-foreground">
            <LogOut className="h-4 w-4 mr-3" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  )
}
