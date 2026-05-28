"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ReflectionResultProps {
  stressLevel: "Low" | "Moderate" | "High"
  score?: number
}

export function ReflectionResult({ stressLevel, score }: ReflectionResultProps) {
  const getStressColor = () => {
    switch (stressLevel) {
      case "Low":
        return "text-green-600"
      case "Moderate":
        return "text-yellow-600"
      case "High":
        return "text-[#c97a7a]"
      default:
        return "text-muted-foreground"
    }
  }

  const getMessage = () => {
    switch (stressLevel) {
      case "Low":
        return "Your responses indicate balanced stress levels. Keep up the good self-care practices!"
      case "Moderate":
        return "Your responses indicate moderate stress levels. Consider taking some time for self-care."
      case "High":
        return "Your responses indicate elevated stress levels. We recommend starting with a guided conversation."
      default:
        return ""
    }
  }

  const isHighStress = stressLevel === "High"

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      <h1 className="text-2xl md:text-3xl font-serif font-bold text-center text-foreground mb-2">
        Your Reflection
      </h1>
      <p className="text-center text-muted-foreground mb-8">
        Based on your responses
      </p>

      <Card className={cn(
        "border-2 rounded-3xl overflow-hidden",
        stressLevel === "High" ? "border-[#c97a7a]/50" : "border-border"
      )}>
        {/* Stress indicator bar */}
        <div className={cn(
          "h-2",
          stressLevel === "Low" && "bg-green-500",
          stressLevel === "Moderate" && "bg-yellow-500",
          stressLevel === "High" && "bg-[#c97a7a]"
        )} />
        
        <CardContent className="p-8 bg-secondary/50">
          <div className="text-center">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
              CURRENT STRESS LEVEL
            </p>
            <h2 className={cn("text-4xl font-serif font-semibold mb-6", getStressColor())}>
              {stressLevel}
            </h2>
            
            <div className="w-full h-px bg-border mb-6" />
            
            <p className="text-muted-foreground mb-8 leading-relaxed">
              {getMessage()}
            </p>

            {/* Action buttons - always show Talk to KAAL AI and Meditation */}
            <div className={cn(
              "flex flex-col sm:flex-row gap-3 justify-center",
              isHighStress ? "mb-4" : "mb-6"
            )}>
              <Link href="/chat">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6 w-full sm:w-auto">
                  Talk to KAAL AI
                </Button>
              </Link>
              <Link href="/meditation">
                <Button variant="outline" className="rounded-full px-6 w-full sm:w-auto">
                  Try Meditation
                </Button>
              </Link>
            </div>

            {/* Show therapist recommendation for high stress */}
            {isHighStress && (
              <div className="bg-card border border-border rounded-2xl p-6 mt-6 text-left">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-lg">👩‍⚕️</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      Professional Support Recommended
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      You may benefit from talking with a psychologist.
                    </p>
                  </div>
                </div>
                <Link href="/connect">
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-full">
                    Connect with Psychologist
                  </Button>
                </Link>
              </div>
            )}

            {/* Additional links */}
            <div className="space-y-2 mt-6">
              {isHighStress && (
                <Link href="/connect" className="block text-sm text-foreground underline hover:no-underline">
                  View recommended therapists
                </Link>
              )}
              <Link href="/reflection" className="block text-sm text-muted-foreground hover:text-foreground">
                Retake assessment
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Side action */}
      <div className="hidden lg:block fixed right-8 top-1/2 -translate-y-1/2">
        <Link href="/meditation" className="text-sm text-muted-foreground hover:text-foreground">
          Try Meditation
        </Link>
      </div>
    </div>
  )
}
