import { useState, useCallback } from "react"
import { useAuth } from "@/contexts/auth-context"

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp?: string
}

export function useChat() {

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /* -------- AUTH DATA -------- */

  const { sessionId, user } = useAuth()

  const sendMessage = useCallback(
    async (content: string) => {

      if (!content.trim()) return

      setLoading(true)
      setError(null)

      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content,
        timestamp: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, userMessage])

      try {

        /* -------- USER INFO -------- */

        const userName =
          user?.name || user?.email?.split("@")[0] || "User"

        const userEmail = user?.email || ""

        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            session_id: sessionId,
            message: content,
            name: userName,
            email: userEmail,
          }),
        })

        if (!response.ok) {
          throw new Error("Backend error")
        }

        const data = await response.json()

        const aiMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data.reply || "KAAL couldn't respond right now.",
          timestamp: new Date().toISOString(),
        }

        setMessages((prev) => [...prev, aiMessage])

      } catch (err) {

        console.error("[useChat] Error:", err)

        setError("Failed to send message")

        setMessages((prev) => prev.slice(0, -1))

      } finally {

        setLoading(false)

      }

    },
    [sessionId, user]
  )

  const clearMessages = () => {
    setMessages([])
    setError(null)
  }

  return {
    messages,
    loading,
    error,
    sendMessage,
    clearMessages,
  }
}
