"use client"

import { useState, useEffect } from "react"

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
  saveChat: (chatData: Partial<SavedChat>) => Promise<SavedChat | null>
}

export function useSavedChats(): UseSavedChatsReturn {

  const [savedChats, setSavedChats] = useState<SavedChat[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  /* LOAD FROM LOCAL STORAGE */

  useEffect(() => {

    try {

      const chats = JSON.parse(
        localStorage.getItem("kaal_saved_chats") || "[]"
      )

      setSavedChats(Array.isArray(chats) ? chats : [])

    } catch (err) {

      console.warn("[SavedChats] Failed to load from localStorage")
      setError("Failed to load chats")

    } finally {

      setLoading(false)

    }

  }, [])

  /* SAVE CHAT LOCALLY */

  const saveChat = async (
    chatData: Partial<SavedChat>
  ): Promise<SavedChat | null> => {

    try {

      const newChat: SavedChat = {
        id: crypto.randomUUID(),
        title: chatData.title || "Conversation",
        preview: chatData.preview || "",
        timestamp: chatData.timestamp || new Date().toISOString(),
      }

      const existingChats: SavedChat[] = JSON.parse(
        localStorage.getItem("kaal_saved_chats") || "[]"
      )

      const updatedChats = [newChat, ...existingChats].slice(0, 10)

      localStorage.setItem(
        "kaal_saved_chats",
        JSON.stringify(updatedChats)
      )

      setSavedChats(updatedChats)

      return newChat

    } catch {

      console.warn("[SavedChats] Local save failed")
      return null

    }

  }

  return {
    savedChats,
    loading,
    error,
    saveChat
  }

}
