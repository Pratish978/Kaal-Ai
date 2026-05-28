import { useState, useEffect } from "react"

export interface Meditation {
id: string
title: string
description: string
duration: string
isFree?: boolean
isLocked?: boolean
}

interface UseMeditationsReturn {
meditations: Meditation[]
loading: boolean
error: string | null
}

export function useMeditations(): UseMeditationsReturn {

const [meditations, setMeditations] = useState<Meditation[]>([])
const [loading, setLoading] = useState(true)
const [error, setError] = useState<string | null>(null)

useEffect(() => {

try {

  const meditationData: Meditation[] = [

    {
      id: "breathing-calm",
      title: "Breathing Calm",
      description: "Slow breathing to calm the nervous system.",
      duration: "10 min",
      isFree: true,
    },

    {
      id: "morning-energy",
      title: "Morning Energy",
      description: "Start your day with calm focus and energy.",
      duration: "7 min",
      isFree: true,
    },

    {
      id: "deep-calm",
      title: "Deep Calm",
      description: "Relax your mind and release stress.",
      duration: "12 min",
      isFree: true,
    },

    {
      id: "stress-relief",
      title: "Stress Relief",
      description: "A short meditation to release anxiety.",
      duration: "8 min",
      isFree: true,
    },

  ]

  setMeditations(meditationData)
  setLoading(false)

} catch (err) {

  console.error("[Meditation Hook Error]", err)
  setError("Failed to load meditations")
  setLoading(false)

}


}, [])

return { meditations, loading, error }

}
