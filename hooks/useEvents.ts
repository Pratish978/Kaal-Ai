"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"

export interface Event {
  id: string
  title: string
  description?: string
  date: string
 time: string
  location?: string
  type?: string
  price?: number
  zoom_link?: string
}

interface UseEventsReturn {
  events: Event[]
  loading: boolean
  error: string | null
}

export function useEvents(): UseEventsReturn {

  const { user } = useAuth()

  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {

    const fetchEvents = async () => {

      try {

        setLoading(true)
        setError(null)

        console.log("[FETCH EVENTS] Starting request...")

        const response = await fetch("/api/events", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "x-user-name": user?.name || "",
            "x-user-email": user?.email || "",
          },
          cache: "no-store",
        })

        const data = await response.json()

        console.log("[EVENTS API RESPONSE]", data)

        if (!response.ok) {

          console.error("[EVENTS API ERROR]", data)

          setError(data?.error || "Failed to load events")
          setEvents([])

          return
        }

        /* backend returns { count, events } */

        if (Array.isArray(data?.events)) {

          setEvents(data.events)

        } else if (Array.isArray(data)) {

          setEvents(data)

        } else {

          setEvents([])

        }

      } catch (err) {

        console.error("[EVENTS FETCH ERROR]", err)

        setError("Failed to load events")
        setEvents([])

      } finally {

        setLoading(false)

      }

    }

    fetchEvents()

  }, [user])

  return {
    events,
    loading,
    error,
  }

}