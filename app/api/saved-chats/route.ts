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
saveChat: (chatData: Partial<SavedChat>) => Promise<void>
}

export function useSavedChats(): UseSavedChatsReturn {

const [savedChats, setSavedChats] = useState<SavedChat[]>([])
const [loading, setLoading] = useState(true)
const [error, setError] = useState<string | null>(null)

useEffect(() => {


const fetchSavedChats = async () => {

  try {

    const response = await fetch("/api/saved-chats")

    if (!response.ok) {
      console.warn("[SavedChats] API not ready")
      setSavedChats([])
      return
    }

    const data = await response.json()

    if (Array.isArray(data)) {
      setSavedChats(data)
    } else {
      setSavedChats([])
    }

  } catch (err) {

    console.warn("[SavedChats] Backend not ready")

    setSavedChats([])
    setError(null)

  } finally {

    setLoading(false)

  }

}

fetchSavedChats()


}, [])

const saveChat = async (chatData: Partial<SavedChat>) => {


try {

  const response = await fetch("/api/saved-chats", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(chatData),
  })

  if (!response.ok) {
    console.warn("[SavedChats] POST not ready")
    return
  }

  const newChat = await response.json()

  if (newChat) {
    setSavedChats((prev) => [newChat, ...prev])
  }

} catch {

  console.warn("[SavedChats] Save skipped")

}


}

return {
savedChats,
loading,
error,
saveChat
}

}
