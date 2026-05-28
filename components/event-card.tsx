"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, MapPin } from "lucide-react"

interface EventCardProps {
id: string
title: string
date: string
time: string
location: string
price: number
isOnline?: boolean
zoom_link?: string
}

export function EventCard({
id,
title,
date,
time,
location,
price,
isOnline = true,
zoom_link
}: EventCardProps) {

const handleRegister = () => {


alert("Registration successful!")

if (isOnline && zoom_link) {
  window.open(zoom_link, "_blank")
}


}

return (


<Card className="bg-card border border-dashed border-border rounded-2xl overflow-hidden hover:shadow-md transition-shadow">

  <CardContent className="p-6">

    <div className="flex items-start justify-between mb-4">

      <h3 className="font-semibold text-foreground leading-tight pr-4">
        {title}
      </h3>

      <div className="flex gap-2 flex-shrink-0">

        {isOnline && (
          <Badge className="bg-blue-100 text-blue-700 rounded-full text-xs">
            Online
          </Badge>
        )}

        <Badge className="bg-primary/20 text-primary rounded-full text-xs">
          ₹{price}
        </Badge>

      </div>

    </div>

    <div className="space-y-2 mb-6">

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Calendar className="h-4 w-4" />
        <span>{date}</span>
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Clock className="h-4 w-4" />
        <span>{time}</span>
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <MapPin className="h-4 w-4" />
        <span>{location}</span>
      </div>

    </div>

    <Button
      onClick={handleRegister}
      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-full"
    >
      Register now
    </Button>

  </CardContent>

</Card>


)

}
