"use client"

import { useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { BreathingExercise } from "@/components/breathing-exercise"
import { MeditationCards } from "@/components/meditation-cards"
import { useAuth } from "@/contexts/auth-context"

export default function MeditationPage() {

  const { user } = useAuth()

  useEffect(() => {

    const trackMeditation = async () => {

      try {

        // OPTIONAL backend tracking
        await fetch("/api/meditation", {
          headers: {
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

    <main className="min-h-screen flex flex-col bg-background">

      <Navbar showBackButton />

      {/* CHANGED: Changed from simple flex-col to control alignment responsively */}
      <div className="flex-1 flex flex-col justify-start md:justify-center">

        {/* Breathing Exercise */}

        {/* CHANGED: 
            - Changed py-12 to py-6 on mobile so it sits closer to the navbar.
            - Kept md:py-16 (or md:flex-1) so your desktop layout stays spacious and identical to your original design.
        */}
        <section className="flex-1 md:flex-initial flex items-center justify-center px-4 py-8 md:py-0 bg-gradient-to-b from-background to-secondary/30">

          <BreathingExercise />

        </section>

        {/* Meditation Cards */}

        <MeditationCards />

      </div>

    </main>

  )

}