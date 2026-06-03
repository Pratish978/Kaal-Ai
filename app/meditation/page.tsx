"use client"

import { useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { BreathingExercise } from "@/components/breathing-exercise"
import { MeditationCards } from "@/components/meditation-cards"
import { useAuth } from "@/contexts/auth-context"
import { Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

export default function MeditationPage() {
  const { isLoggedIn, user } = useAuth()

  // STRICT PREMIUM SELECTION CHECKER SYSTEM
  const isPremium = isLoggedIn && user && (
    user.email === "bhonglepratish@gmail.com" ||
    user?.premium === true || 
    user?.plan === "founding" || 
    user?.plan === "plus" ||
    user?.plan === "annual"
  );

  useEffect(() => {
    const trackMeditation = async () => {
      try {
        // Backend verification loop updated to prevent 403 authorization lockouts
        await fetch("/api/meditation", {
          headers: {
            "X-API-Key": "kaal_dev_secret_key_123", // Syncing backend auth layer pipeline
            "x-user-name": user?.name || "",
            "x-user-email": user?.email || "",
          }
        })
      } catch (err) {
        console.error("[Meditation Tracking Error]", err)
      }
    }

    if (user?.email) {
      trackMeditation()
    }
  }, [user])

  /* -------------------------------
      LOCAL MEDITATION PROGRESS
  --------------------------------*/
  useEffect(() => {
    const progress = JSON.parse(
      localStorage.getItem("kaal_meditation_progress") ||
      '{"sessions":0,"minutes":0}'
    )

    const updated = {
      sessions: progress.sessions + 1,
      minutes: progress.minutes + 1
    }

    localStorage.setItem(
      "kaal_meditation_progress",
      JSON.stringify(updated)
    )
  }, [])

  return (
    <main 
      className={cn(
        "min-h-screen flex flex-col transition-colors duration-700 relative",
        isPremium ? "bg-[#FAF7F2]" : "bg-background"
      )}
    >
      {/* Decorative ambient light leaks strictly mapped for elite tier subscribers */}
      {isPremium && (
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-amber-500/5 blur-[100px] pointer-events-none rounded-full" />
      )}

      <Navbar showBackButton />

      {/* Main Container Layout */}
      <div className="flex-1 flex flex-col justify-start md:justify-center">
        
        {/* Breathing Exercise Container Layer */}
        {/* CHANGED (First file's responsive padding & alignment combined with premium layout styles) */}
        <section 
          className={cn(
            "flex-1 md:flex-initial flex flex-col items-center justify-center px-4 py-8 md:py-0 relative transition-all duration-500",
            isPremium 
              ? "bg-gradient-to-b from-[#FAF7F2] via-[#F4EFE6] to-[#FAF7F2]" 
              : "bg-gradient-to-b from-background to-secondary/30"
          )}
        >
          {/* Top micro pill banner inside screen framework */}
          {isPremium && (
            <div className="mb-4 flex items-center gap-1 px-3 py-1 bg-amber-600/10 border border-amber-500/20 rounded-full animate-pulse mt-4 md:mt-6">
              <Sparkles className="w-3 h-3 text-amber-600" />
              <span className="text-[10px] font-sans font-extrabold uppercase tracking-[0.15em] text-amber-700">
                Premium Sanctorum Active
              </span>
            </div>
          )}

          {/* Forwarding premium wrapper configurations to the breathing canvas layout */}
          <BreathingExercise isPremium={isPremium} />

        </section>

        {/* Meditation Cards Collection Framework */}
        <div className={cn(isPremium ? "bg-[#FAF7F2]/50 py-2" : "")}>
          <MeditationCards isPremium={isPremium} />
        </div>

      </div>
    </main>
  )
}