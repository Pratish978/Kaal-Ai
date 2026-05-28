import { useState, useEffect } from "react"

export interface GitaVerse {
  id: string
  chapterVerse: string
  sanskrit: string
  translation: string
  meaning: string
  reflection: string
}

interface UseGitaVerseReturn {
  verse: GitaVerse | null
  loading: boolean
  error: string | null
}

export function useGitaVerse(): UseGitaVerseReturn {
  const [verse, setVerse] = useState<GitaVerse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchVerse = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch("/api/gita/daily-verse")
        if (!response.ok) {
          throw new Error("Failed to fetch daily verse")
        }

        const data = await response.json()
        setVerse(data)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error"
        console.error("[Hook] Error fetching Gita verse:", errorMessage)
        setError(errorMessage)
        setVerse(null)
      } finally {
        setLoading(false)
      }
    }

    fetchVerse()
  }, [])

  return { verse, loading, error }
}
