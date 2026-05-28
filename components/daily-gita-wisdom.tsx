"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"
import { useGitaVerse } from "@/hooks/useGitaVerse"

interface GitaVerse {
  id: string
  chapterVerse: string
  sanskrit: string
  translation: string
  meaning: string
  reflection: string
}

const gitaVersesPool: GitaVerse[] = [
  {
    id: "1",
    chapterVerse: "Chapter 2, Verse 47",
    sanskrit: "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।",
    translation:
      "You have a right to perform your prescribed duty, but you are not entitled to the fruits of your actions.",
    meaning:
      "Focus on doing your duty without being attached to the results. This teaches detachment from outcomes while maintaining commitment to action.",
    reflection: "What expectation might be creating pressure in your life today?",
  },
  {
    id: "2",
    chapterVerse: "Chapter 6, Verse 6",
    sanskrit: "बन्धुरात्मात्मनस्तस्य येनात्मैव आत्मना जितः।",
    translation:
      "For those who have conquered the mind, it is the best of friends; but for those who have failed to do so, the mind works as the greatest enemy.",
    meaning:
      "The mind is your greatest ally when controlled, but your worst enemy when left uncontrolled. Mental discipline is key to peace.",
    reflection:
      "How can you befriend your mind today instead of fighting it?",
  },
  {
    id: "3",
    chapterVerse: "Chapter 5, Verse 20",
    sanskrit: "लभन्ते ब्रह्मनिर्वाणं ऋषयः क्षीणकल्मषाः।",
    translation:
      "Those who achieve liberation attain peace in this life and beyond.",
    meaning:
      "True liberation comes from freeing yourself from attachment, fear, and negativity.",
    reflection: "What belief or attachment could you let go of today?",
  },
  {
    id: "4",
    chapterVerse: "Chapter 13, Verse 6",
    sanskrit: "अनन्यश्चिन्तयन्तो मां ये जनाः पर्युपासते।",
    translation:
      "Those who concentrate the mind on Me and engage in devotional service are the best yogis.",
    meaning:
      "Peace comes from finding one point of focus and dedicating yourself to it.",
    reflection:
      "What deserves your complete, undivided attention today?",
  },
  {
    id: "5",
    chapterVerse: "Chapter 2, Verse 38",
    sanskrit: "सुखदुःखे समे कृत्वा लाभालाभौ जयाजयौ।",
    translation:
      "Treating pleasure and pain, loss and gain, victory and defeat equally, engage in your duty.",
    meaning:
      "Equanimity is the path to peace.",
    reflection:
      "Where in your life can you practice more acceptance and less resistance?",
  },
]

interface DailyGitaWisdomProps {
  onReflectionSubmit?: (reflection: string) => void
}

export function DailyGitaWisdom({
  onReflectionSubmit,
}: DailyGitaWisdomProps) {
  const [showReflection, setShowReflection] = useState(false)
  const [reflectionAnswer, setReflectionAnswer] = useState("")

  const { verse, loading: isLoading } = useGitaVerse()

  const displayVerse =
    verse || gitaVersesPool[Math.floor(Math.random() * gitaVersesPool.length)]

  const handleReflectionSubmit = () => {
    if (!reflectionAnswer.trim()) return

    onReflectionSubmit?.(reflectionAnswer)

    setReflectionAnswer("")
    setShowReflection(false)
  }

  if (isLoading) {
    return (
      <Card className="bg-card border border-border rounded-2xl w-full max-w-2xl">
        <CardContent className="p-8">
          <p className="text-muted-foreground text-center">
            Loading verse...
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card border border-border rounded-2xl w-full max-w-2xl">
      <CardContent className="p-8">

        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">
            Daily Wisdom
          </h2>
        </div>

        <div className="bg-secondary/50 rounded-xl p-6 mb-6 space-y-4">
          <p className="text-sm font-medium text-muted-foreground">
            {displayVerse.chapterVerse}
          </p>

          <p className="text-lg italic text-foreground font-serif">
            {displayVerse.sanskrit}
          </p>

          <p className="text-sm text-muted-foreground">
            {displayVerse.translation}
          </p>

          <div className="border-t border-border pt-4">
            <p className="text-sm text-foreground leading-relaxed">
              {displayVerse.meaning}
            </p>
          </div>
        </div>

        <div className="bg-muted/40 rounded-lg p-4 mb-6">
          <p className="text-sm font-medium text-foreground mb-2">
            Reflect:
          </p>

          <p className="text-sm text-foreground/80 italic">
            "{displayVerse.reflection}"
          </p>
        </div>

        {showReflection ? (
          <div className="space-y-4 mt-6 pt-6 border-t border-border">
            <textarea
              value={reflectionAnswer}
              onChange={(e) => setReflectionAnswer(e.target.value)}
              placeholder="Share your thoughts on the reflection..."
              className="w-full p-3 rounded-lg bg-background border border-border text-foreground outline-none focus:ring-2 focus:ring-primary resize-none"
              rows={3}
            />

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowReflection(false)
                  setReflectionAnswer("")
                }}
                className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
              >
                Skip
              </button>

              <Button
                onClick={handleReflectionSubmit}
                disabled={!reflectionAnswer.trim()}
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6"
              >
                Save Reflection
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-6 pt-6 border-t border-border">
            <Button
              onClick={() => setShowReflection(true)}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-full"
            >
              Answer the Reflection
            </Button>
          </div>
        )}

      </CardContent>
    </Card>
  )
}