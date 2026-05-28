"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface TherapistCardProps {
  name: string
  specialization: string
  experience: string
  rating: number
  sessionPrice: number
  nextAvailable: string
  communicationModes: string[]
  languages: string[]
  quote: string
  isRecommended?: boolean
  isBestMatch?: boolean
  isOnline?: boolean
  imageUrl?: string
  onBook?: () => void
}

export function TherapistCard({
  name,
  specialization,
  experience,
  rating,
  sessionPrice,
  nextAvailable,
  communicationModes,
  languages,
  quote,
  isRecommended = false,
  isBestMatch = false,
  isOnline = true,
  imageUrl,
  onBook,
}: TherapistCardProps) {
  return (
    <Card className="bg-card border-0 shadow-sm rounded-2xl overflow-hidden">
      <CardContent className="p-6">
        {/* Badge */}
        <div className="mb-4">
          {isRecommended && (
            <Badge className="bg-primary/20 text-primary hover:bg-primary/20 rounded-full text-xs">
              KAAL Recommended for You
            </Badge>
          )}
          {isBestMatch && (
            <Badge className="bg-muted text-muted-foreground hover:bg-muted rounded-full text-xs">
              Best match
            </Badge>
          )}
        </div>

        {/* Profile */}
        <div className="flex items-start gap-3 mb-4">
          <div className="relative">
            <Avatar className="h-14 w-14">
              <AvatarImage src={imageUrl} alt={name} />
              <AvatarFallback className="bg-muted text-muted-foreground">
                {name.split(" ").map(n => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <div className={cn(
              "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-card",
              isOnline ? "bg-green-500" : "bg-red-500"
            )} />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">{name}</h3>
            <p className="text-sm text-muted-foreground">{specialization}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-muted-foreground">{experience}</span>
              <span className="text-muted-foreground">·</span>
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-primary text-primary" />
                <span className="text-xs text-foreground">{rating}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Communication modes */}
        <div className="flex flex-wrap gap-2 mb-4">
          {communicationModes.map((mode) => (
            <Badge key={mode} variant="outline" className="rounded-full text-xs font-normal">
              {mode}
            </Badge>
          ))}
          {languages.map((lang) => (
            <Badge key={lang} variant="outline" className="rounded-full text-xs font-normal">
              {lang}
            </Badge>
          ))}
        </div>

        {/* Why this match button */}
        <Button
          variant="ghost"
          className="w-full bg-primary/10 hover:bg-primary/20 text-primary rounded-full mb-4"
        >
          Why this match?
        </Button>

        {/* Quote */}
        <p className="text-sm text-muted-foreground italic mb-4">
          "{quote}"
        </p>

        {/* Availability and price */}
        <div className="flex items-center justify-between text-sm mb-4">
          <div>
            <span className="text-muted-foreground">Next available: </span>
            <span className="font-medium text-foreground">{nextAvailable}</span>
          </div>
          <span className="text-foreground">₹{sessionPrice} / session</span>
        </div>

        {/* Book button */}
        <Button 
          onClick={onBook}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-full"
        >
          Book session
        </Button>
      </CardContent>
    </Card>
  )
}
