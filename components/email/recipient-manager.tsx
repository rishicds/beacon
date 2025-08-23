"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, X, Users, UserPlus, Mail } from "lucide-react"

interface RecipientManagerProps {
  recipients: string[]
  onRecipientsChange: (recipients: string[]) => void
}

export function RecipientManager({ recipients, onRecipientsChange }: RecipientManagerProps) {
  const [newRecipient, setNewRecipient] = useState("")
  const [recipientType, setRecipientType] = useState("employee")

  // Mock employee data
  const employees = [
    { email: "john.doe@company.com", name: "John Doe", department: "Finance" },
    { email: "sarah.wilson@company.com", name: "Sarah Wilson", department: "HR" },
    { email: "mike.johnson@company.com", name: "Mike Johnson", department: "IT" },
    { email: "lisa.chen@company.com", name: "Lisa Chen", department: "Legal" },
  ]

  const addRecipient = () => {
    if (newRecipient && !recipients.includes(newRecipient)) {
      onRecipientsChange([...recipients, newRecipient])
      setNewRecipient("")
    }
  }

  const removeRecipient = (email: string) => {
    onRecipientsChange(recipients.filter((r) => r !== email))
  }

  const addEmployee = (email: string) => {
    if (!recipients.includes(email)) {
      onRecipientsChange([...recipients, email])
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Manage Recipients
          </CardTitle>
          <CardDescription>Add employees and external recipients to your secure email</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="add" className="space-y-4">
            <TabsList>
              <TabsTrigger value="add">Add Recipients</TabsTrigger>
              <TabsTrigger value="employees">Company Directory</TabsTrigger>
            </TabsList>

            <TabsContent value="add" className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="recipient">Email Address</Label>
                  <Input
                    id="recipient"
                    type="email"
                    placeholder="Enter email address..."
                    value={newRecipient}
                    onChange={(e) => setNewRecipient(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addRecipient()}
                  />
                </div>
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select value={recipientType} onValueChange={setRecipientType}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employee">Employee</SelectItem>
                      <SelectItem value="external">External</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button onClick={addRecipient}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="employees" className="space-y-4">
              <div className="space-y-2">
                {employees.map((employee) => (
                  <div
                    key={employee.email}
                    className="flex items-center justify-between p-3 border border-border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{employee.name}</p>
                      <p className="text-sm text-muted-foreground">{employee.email}</p>
                      <p className="text-xs text-muted-foreground">{employee.department}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addEmployee(employee.email)}
                      disabled={recipients.includes(employee.email)}
                    >
                      <UserPlus className="h-3 w-3 mr-2" />
                      {recipients.includes(employee.email) ? "Added" : "Add"}
                    </Button>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Current Recipients */}
      <Card>
        <CardHeader>
          <CardTitle>Current Recipients ({recipients.length})</CardTitle>
          <CardDescription>People who will receive this secure email</CardDescription>
        </CardHeader>
        <CardContent>
          {recipients.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Mail className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No recipients added yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recipients.map((email) => (
                <div key={email} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <Mail className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{email}</p>
                      <Badge variant="outline" className="text-xs">
                        {employees.find((e) => e.email === email) ? "Employee" : "External"}
                      </Badge>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => removeRecipient(email)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
