"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context" // Adjust path if necessary

export interface SavedChat {
  id: string
  title: string
  preview: string
  timestamp: string
}

interface UseSavedChatsReturn {
  savedChats: SavedChat[]
  loading: boolean
  error: string | null
  saveChat: (chatData: Partial<SavedChat>) => Promise<void>
}

export function useSavedChats(): UseSavedChatsReturn {
  const { user } = useAuth()
  const [savedChats, setSavedChats] = useState<SavedChat[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSavedChats = async () => {
      // Don't attempt fetch if user isn't loaded yet
      if (!user?.id) {
        setLoading(false)
        return
      }

      // Construct Absolute Backend URL
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"
      const url = `${baseUrl}/api/saved-chats/${user.id}`
      const apiKey = process.env.NEXT_PUBLIC_API_KEY || ""

      // Debug Logs
      console.log("Saved Chats User:", user?.id)
      console.log("Saved Chats URL:", url)

      try {
        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "X-API-Key": apiKey // Injected auth header
          }
        })

        if (!response.ok) {
          console.warn(`[SavedChats] API returned status: ${response.status}`)
          setSavedChats([])
          return
        }

        const data = await response.json()

        // Handle both raw array or structured { success: true, chats: [...] }
        if (Array.isArray(data)) {
          setSavedChats(data)
        } else if (data && data.chats && Array.isArray(data.chats)) {
          setSavedChats(data.chats)
        } else {
          setSavedChats([])
        }

      } catch (err) {
        console.warn("[SavedChats] Backend not ready or unreachable", err)
        setSavedChats([])
        setError(null)
      } finally {
        setLoading(false)
      }
    }

    fetchSavedChats()
  }, [user?.id])

  const saveChat = async (chatData: Partial<SavedChat>) => {
    if (!user?.id) return

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"
    const url = `${baseUrl}/api/save-chat` // Pointing to the proper save endpoint
    const apiKey = process.env.NEXT_PUBLIC_API_KEY || ""

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": apiKey // Injected auth header
        },
        // Ensure user_id is sent in the payload for the backend to associate it correctly
        body: JSON.stringify({ ...chatData, user_id: user.id }), 
      })

      if (!response.ok) {
        console.warn("[SavedChats] POST not ready")
        return
      }

      const newChat = await response.json()

      if (newChat) {
        setSavedChats((prev) => [newChat, ...prev])
      }

    } catch (err) {
      console.warn("[SavedChats] Save skipped", err)
    }
  }

  return {
    savedChats,
    loading,
    error,
    saveChat
  }
}