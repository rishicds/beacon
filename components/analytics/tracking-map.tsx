import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Globe, MapPin, Users } from "lucide-react"

const locationData = [
  { country: "United States", city: "New York", opens: 245, suspicious: 2 },
  { country: "United Kingdom", city: "London", opens: 189, suspicious: 0 },
  { country: "Canada", city: "Toronto", opens: 156, suspicious: 1 },
  { country: "Germany", city: "Berlin", opens: 134, suspicious: 0 },
  { country: "France", city: "Paris", opens: 98, suspicious: 0 },
  { country: "Russia", city: "Moscow", opens: 12, suspicious: 8 },
  { country: "China", city: "Beijing", opens: 8, suspicious: 6 },
]

export function TrackingMap() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Geographic Distribution
          </CardTitle>
          <CardDescription>Email opens by location with security analysis</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Mock world map placeholder */}
          <div className="h-96 bg-muted/30 rounded-lg border-2 border-dashed border-border flex items-center justify-center">
            <div className="text-center space-y-2">
              <Globe className="h-12 w-12 mx-auto text-muted-foreground" />
              <p className="text-muted-foreground">Interactive world map would be displayed here</p>
              <p className="text-sm text-muted-foreground">
                Integration with mapping service like Mapbox or Google Maps
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Location Analytics</CardTitle>
          <CardDescription>Detailed breakdown by country and city</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {locationData.map((location, index) => (
              <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">
                      {location.city}, {location.country}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-3 w-3" />
                      <span>{location.opens} opens</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{location.opens} opens</Badge>
                  {location.suspicious > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {location.suspicious} suspicious
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
