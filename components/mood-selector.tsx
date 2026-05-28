"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const moods = [
  "Stressed",
  "Anxious",
  "Overwhelmed",
  "Tired",
  "Sad",
  "Confused",
]

export function MoodSelector() {
  const [selectedMoods, setSelectedMoods] = useState<string[]>([])
  const router = useRouter()

  const toggleMood = (mood: string) => {
    setSelectedMoods((prev) =>
      prev.includes(mood)
        ? prev.filter((m) => m !== mood)
        : [...prev, mood]
    )
  }

  const handleStart = () => {
    // Store selected moods in sessionStorage for the chat
    sessionStorage.setItem("selectedMoods", JSON.stringify(selectedMoods))
    router.push("/chat")
  }

  return (
    <Card className="w-full max-w-xl mx-auto bg-secondary/50 border-0 shadow-none">
      <CardContent className="p-8 md:p-12">
        <h1 className="text-2xl md:text-3xl font-serif font-semibold text-center text-foreground mb-3">
          How are you feeling right now?
        </h1>
        <p className="text-center text-muted-foreground mb-8">
          (Take a moment — there's no rush.)
        </p>
        
        <div className="text-center mb-6">
          <p className="text-sm text-muted-foreground mb-1">You can take your time.</p>
          <p className="text-sm text-muted-foreground">This is a safe, calm space to talk freely.</p>
        </div>
        
        <p className="text-xs text-muted-foreground text-center mb-4">
          You can choose more than one.
        </p>
        
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {moods.map((mood) => (
            <button
              key={mood}
              onClick={() => toggleMood(mood)}
              className={cn(
                "px-4 py-2 rounded-full border text-sm transition-all",
                selectedMoods.includes(mood)
                  ? "bg-primary/20 border-primary text-foreground"
                  : "bg-card border-border text-foreground hover:bg-muted"
              )}
            >
              {mood}
            </button>
          ))}
        </div>
        
        <div className="flex justify-center">
          <Button
            onClick={handleStart}
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8 py-5"
          >
            Start conversation
          </Button>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground">
            KAAL AI is not a doctor or therapist.
          </p>
          <p className="text-xs text-muted-foreground">
            It listens with care and may suggest professional help when needed.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
