"use client"

import { useState, useEffect, useCallback } from "react"
// Adjust path based on your project structure if needed
import { useAuth } from "@/contexts/auth-context" 

export interface SavedChat {
  id: string
  title: string
  preview: string
  timestamp: string
  session_id?: string
}

interface UseSavedChatsReturn {
  savedChats: SavedChat[]
  loading: boolean
  error: string | null
  saveChat: (chatData: Partial<SavedChat>) => Promise<SavedChat | null>
  deleteChat: (sessionId: string) => Promise<boolean>
}

export function useSavedChats(): UseSavedChatsReturn {
  const { user } = useAuth()

  const [savedChats, setSavedChats] = useState<SavedChat[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  /* LOAD FROM MONGODB API */
  useEffect(() => {
    const fetchHistory = async () => {
      if (!user?.id) {
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/saved-chats/${user.id}`)
        
        if (!response.ok) {
          throw new Error(`API error: ${response.statusText}`)
        }

        const data = await response.json()

        if (data && data.success && Array.isArray(data.chats)) {
          // Map MongoDB schema to the existing UI schema
          const formatted: SavedChat[] = data.chats.map((item: any) => ({
            id: item.session_id || item.id || item._id,
            title: item.title || "Conversation",
            preview: item.preview || item.last_message || item.lastMessage || "",
            timestamp: item.timestamp || item.updated_at || item.createdAt || new Date().toISOString(),
            session_id: item.session_id || item.id || item._id
          }))
          setSavedChats(formatted)
        } else {
          setSavedChats([])
        }
      } catch (err) {
        console.warn("[SavedChats] Failed to load from API:", err)
        setError("Failed to load chats")
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [user?.id])

  /* SAVE CHAT TO MONGODB API */
  const saveChat = useCallback(async (
    chatData: Partial<SavedChat>
  ): Promise<SavedChat | null> => {
    if (!user?.id) return null

    try {
      const payload = {
        ...chatData,
        user_id: user.id,
        timestamp: chatData.timestamp || new Date().toISOString(),
      }

      const response = await fetch('/api/save-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error("Failed to save chat")
      }

      const data = await response.json()
      
      const newChat: SavedChat = {
        id: data.chat?.session_id || data.session_id || data.id || crypto.randomUUID(),
        title: chatData.title || "Conversation",
        preview: chatData.preview || "",
        timestamp: payload.timestamp,
        session_id: data.chat?.session_id || data.session_id
      }

      setSavedChats(prev => [newChat, ...prev])

      return newChat
    } catch (err) {
      console.warn("[SavedChats] API save failed:", err)
      return null
    }
  }, [user?.id])

  /* DELETE CHAT FROM MONGODB API */
  const deleteChat = useCallback(async (sessionId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/delete-chat/${sessionId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error("Failed to delete chat")
      }

      // Update UI state to remove the deleted chat
      setSavedChats(prev => prev.filter(c => c.id !== sessionId && c.session_id !== sessionId))
      
      return true
    } catch (err) {
      console.warn("[SavedChats] API delete failed:", err)
      setError("Failed to delete the conversation.")
      return false
    }
  }, [])

  return {
    savedChats,
    loading,
    error,
    saveChat,
    deleteChat
  }
}