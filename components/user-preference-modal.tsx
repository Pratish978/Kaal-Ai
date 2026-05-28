"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"

interface UserPreferenceModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UserPreferenceModal({ open, onOpenChange }: UserPreferenceModalProps) {
  const [selectedPreference, setSelectedPreference] = useState<"gita" | "no-preference" | null>(null)
  const [showComplete, setShowComplete] = useState(false)
  const { updateUserPreference } = useAuth()

  const handleContinue = () => {
    if (selectedPreference) {
      updateUserPreference(selectedPreference)
      setShowComplete(true)
      setTimeout(() => {
        onOpenChange(false)
        setSelectedPreference(null)
        setShowComplete(false)
      }, 2000)
    }
  }

  if (showComplete) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md bg-card border-0 rounded-2xl">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="text-4xl mb-4">✓</div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Preferences Saved
            </h2>
            <p className="text-sm text-muted-foreground">
              Your guidance preference has been saved successfully.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-0 rounded-2xl">
        <DialogHeader className="text-center">
          <DialogTitle className="text-xl font-semibold">
            Personalize Your Guidance
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-6">
          <p className="text-center text-sm text-muted-foreground mb-6">
            Choose what resonates with you. This will personalize your KAAL experience.
          </p>

          {/* Gita Option */}
          <Card
            onClick={() => setSelectedPreference("gita")}
            className={cn(
              "p-4 cursor-pointer transition-all border-2",
              selectedPreference === "gita"
                ? "border-primary bg-primary/5"
                : "border-border hover:border-muted-foreground"
            )}
          >
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full border-2 mt-1 flex items-center justify-center"
                style={{
                  borderColor: selectedPreference === "gita" ? "var(--primary)" : "var(--border)",
                }}
              >
                {selectedPreference === "gita" && (
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "var(--primary)" }} />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">
                  Bhagavad Gita Wisdom
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Incorporate Gita teachings and Sanskrit wisdom into your wellness journey.
                </p>
              </div>
            </div>
          </Card>

          {/* No Preference Option */}
          <Card
            onClick={() => setSelectedPreference("no-preference")}
            className={cn(
              "p-4 cursor-pointer transition-all border-2",
              selectedPreference === "no-preference"
                ? "border-primary bg-primary/5"
                : "border-border hover:border-muted-foreground"
            )}
          >
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full border-2 mt-1 flex items-center justify-center"
                style={{
                  borderColor: selectedPreference === "no-preference" ? "var(--primary)" : "var(--border)",
                }}
              >
                {selectedPreference === "no-preference" && (
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "var(--primary)" }} />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">
                  No Preference
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Experience personalized wellness guidance without religious or spiritual focus.
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={handleContinue}
            disabled={!selectedPreference}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-full"
          >
            Save Preference
          </Button>
          <button
            onClick={() => onOpenChange(false)}
            className="w-full py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Skip for now
          </button>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          You can change this anytime in your profile settings.
        </p>
      </DialogContent>
    </Dialog>
  )
}
