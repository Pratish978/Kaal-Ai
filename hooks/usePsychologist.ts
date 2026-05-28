import { useState, useEffect, useCallback } from "react"

interface Psychologist {
  id: string
  name: string
  specialization: string
  rating: number
  availableSlots: string[]
  bio?: string
  experience?: string
}

interface BookingRequest {
  psychologistId: string
  slotTime: string
  notes?: string
}

interface UsePsychologistReturn {
  psychologists: Psychologist[]
  loading: boolean
  error: string | null
  bookSession: (booking: BookingRequest) => Promise<any>
}

export function usePsychologist(): UsePsychologistReturn {
  const [psychologists, setPsychologists] = useState<Psychologist[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch psychologists on mount
  useEffect(() => {
    const fetchPsychologists = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch("/api/psychologist", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to fetch psychologists")
        }

        const data = await response.json()
        setPsychologists(Array.isArray(data) ? data : data.data || [])
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch psychologists"
        setError(errorMessage)
        console.error("[usePsychologist] Error:", err)
        setPsychologists([])
      } finally {
        setLoading(false)
      }
    }

    fetchPsychologists()
  }, [])

  const bookSession = useCallback(
    async (booking: BookingRequest) => {
      try {
        setError(null)

        const response = await fetch("/api/psychologist", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(booking),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to book session")
        }

        const data = await response.json()
        return data
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to book session"
        setError(errorMessage)
        console.error("[usePsychologist] Booking error:", err)
        throw err
      }
    },
    []
  )

  return {
    psychologists,
    loading,
    error,
    bookSession,
  }
}
