import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Shield, LayoutDashboard, Mail, FileText, Bell, Settings, LogOut, User } from "lucide-react"
import Link from "next/link"

export function EmployeeSidebar() {
  return (
    <div className="w-64 bg-sidebar border-r border-sidebar-border">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h2 className="text-lg font-bold text-sidebar-foreground">SecureBeacon</h2>
            <p className="text-xs text-muted-foreground">Employee Portal</p>
          </div>
        </div>

        {/* User Profile */}
        <div className="mb-6 p-3 bg-sidebar-accent rounded-lg">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-sidebar-foreground">John Doe</p>
              <p className="text-xs text-muted-foreground">john.doe@company.com</p>
            </div>
          </div>
        </div>

        <nav className="space-y-2">
          <Button variant="ghost" className="w-full justify-start" asChild>
            <Link href="/employee">
              <LayoutDashboard className="h-4 w-4 mr-3" />
              Dashboard
            </Link>
          </Button>

          <Button variant="ghost" className="w-full justify-start" asChild>
            <Link href="/employee/emails">
              <Mail className="h-4 w-4 mr-3" />
              My Emails
            </Link>
          </Button>

          <Button variant="ghost" className="w-full justify-start" asChild>
            <Link href="/employee/documents">
              <FileText className="h-4 w-4 mr-3" />
              Secure Documents
            </Link>
          </Button>

          <Button variant="ghost" className="w-full justify-start" asChild>
            <Link href="/employee/notifications">
              <Bell className="h-4 w-4 mr-3" />
              Notifications
              <Badge variant="secondary" className="ml-auto">
                2
              </Badge>
            </Link>
          </Button>

          <Button variant="ghost" className="w-full justify-start" asChild>
            <Link href="/employee/settings">
              <Settings className="h-4 w-4 mr-3" />
              Settings
            </Link>
          </Button>
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
