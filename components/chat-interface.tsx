"use client"

import { useState, useRef, useEffect } from "react"
import { Mic, Send, Save, ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"

import { WisdomCard } from "@/components/wisdom-card"
import { useAuth } from "@/contexts/auth-context"
import AuthModal from "./login-modal"

// ── Types ──
interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  isLoading?: boolean
}

interface ChatInterfaceProps {
  onBack?: () => void
}

const initialMessages: Message[] = [
  {
    id: "init",
    role: "assistant",
    content: "I'm KAAL. This is a space to pause and reflect. What has been on your mind lately?",
  },
]

export function ChatInterface({ onBack }: ChatInterfaceProps) {
  // ── State Hooks ──
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [messageCount, setMessageCount] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [isWaitingResponse, setIsWaitingResponse] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { isLoggedIn, user } = useAuth()

  // ── Entrance Slide Animation ──
  useEffect(() => {
    setIsVisible(true)
  }, [])

  // ── Smooth Scroll Execution ──
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // ── LocalStorage State Sync Handler ──
  useEffect(() => {
    const openChat = localStorage.getItem("kaal_open_chat")
    if (openChat) {
      const chat = JSON.parse(openChat)
      localStorage.setItem("kaal_active_chat", chat.id)
      setMessages([
        { id: crypto.randomUUID(), role: "user", content: chat.title },
        { id: crypto.randomUUID(), role: "assistant", content: chat.preview },
      ])
      localStorage.removeItem("kaal_open_chat")
    } else {
      localStorage.removeItem("kaal_active_chat")
      setMessages(initialMessages)
    }
  }, [])

  // ── Local Active Session Updates ──
  const saveChatLocal = (chat: any) => {
    let chats = JSON.parse(localStorage.getItem("kaal_saved_chats") || "[]")
    let activeChatId = localStorage.getItem("kaal_active_chat")
    if (!activeChatId) {
      activeChatId = crypto.randomUUID()
      localStorage.setItem("kaal_active_chat", activeChatId)
      chats.unshift({ id: activeChatId, title: chat.title, preview: chat.preview, timestamp: chat.timestamp })
    } else {
      chats = chats.map((c: any) =>
        c.id === activeChatId ? { ...c, preview: chat.preview, timestamp: chat.timestamp } : c
      )
    }
    chats = chats.slice(0, 4)
    localStorage.setItem("kaal_saved_chats", JSON.stringify(chats))
  }

  // ── Voice Transcription Logic (Web Audio API) ──
  const startRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop()
      setIsRecording(false)
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []
      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }
      mediaRecorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" })
        const response = await fetch("/api/stt", { method: "POST", body: blob })
        const data = await response.json()
        if (data.text) setInput(data.text)
      }
      mediaRecorder.start()
      setIsRecording(true)
    } catch (err) {
      console.error("Microphone hardware error:", err)
    }
  }

  // ── Send Handlers & Async Network Pipeline ──
  const handleSend = async () => {
    if (!input.trim() || isWaitingResponse) return
    const text = input
    const userMessage: Message = { id: crypto.randomUUID(), role: "user", content: text }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setMessageCount((prev) => prev + 1)
    setIsWaitingResponse(true)

    if (messageCount >= 1 && messageCount < 2 && !isLoggedIn) {
      setTimeout(() => setShowLoginModal(true), 1000)
    }

    const loadingId = crypto.randomUUID()
    setMessages((prev) => [...prev, { id: loadingId, role: "assistant", content: "", isLoading: true }])

    try {
      let sessionId = localStorage.getItem("kaal_session")
      if (!sessionId) {
        sessionId = crypto.randomUUID()
        localStorage.setItem("kaal_session", sessionId)
      }

      // Read key directly from client environment securely or proxy through route
      const apiKey = process.env.NEXT_PUBLIC_CHAT_KEY || ""

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
          "x-user-name": user?.name || "",
          "x-user-email": user?.email || "",
        },
        body: JSON.stringify({ session_id: sessionId, message: text }),
      })

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`)
      }

      const data = await response.json()
      const reply = data.reply || "KAAL couldn't respond right now."
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === loadingId ? { id: crypto.randomUUID(), role: "assistant", content: reply } : msg
        )
      )
      setIsWaitingResponse(false)
      saveChatLocal({ title: text.slice(0, 40), preview: reply.slice(0, 80), timestamp: new Date().toISOString() })
    } catch (error) {
      console.error("Chat error:", error)
      setIsWaitingResponse(false)
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === loadingId ? { id: crypto.randomUUID(), role: "assistant", content: "⚠️ Server error. Please try again." } : msg
        )
      )
    }
  }

  return (
    <div className="bg-[#FBF9F6] flex-1 flex flex-col items-center px-4 w-full overflow-hidden">
      
      {/* ── Main Chat Shell Container ── */}
      <div
        className={cn(
          "bg-[#F6F2ED] w-full max-w-3xl rounded-[40px] px-8 py-10 flex flex-col shadow-sm max-h-[82vh] mt-4 transition-all duration-1000 ease-out relative",
          isVisible ? "translate-y-0 opacity-100" : "-translate-y-10 opacity-0"
        )}
      >
        {/* Upper Action Bar for embedded back views */}
        {onBack && (
          <div className="absolute top-6 left-8 z-10">
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 text-gray-500 hover:text-black transition-colors bg-transparent border-none cursor-pointer text-xs uppercase tracking-wider font-semibold group"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
              Exit Chat
            </button>
          </div>
        )}

        {/* ── Chat Messages Pipeline viewport ── */}
        <div className={cn(
          "w-full overflow-y-auto mb-6 space-y-6 flex flex-col [&::-webkit-scrollbar]:hidden",
          onBack ? "pt-6" : "pt-0"
        )}>
          {messages.map((message, idx) => (
            <div key={message.id}>
              <MessageBubble message={message} idx={idx} />
              
              {/* Context Quote Injector */}
              {idx === 4 && (
                <div className="my-6">
                  <WisdomCard insight="Clarity often appears when the mind becomes still. In silence, we find what matters most." />
                </div>
              )}
            </div>
          ))}

          <div ref={messagesEndRef} />
        </div>

        {/* ── Animated Brand Spinner Loader ── */}
        {isWaitingResponse && (
          <div className="flex flex-col items-center gap-2 mb-4 self-center">
            <img
              src="/kaal-logo-1.png"
              alt="Loading"
              className="w-5 h-5 animate-spin opacity-30"
              style={{ animationDuration: "3s" }}
            />
          </div>
        )}

        {/* ── Bottom Input Action Section ── */}
        <div className="mt-auto w-full max-w-2xl mx-auto">
          
          {/* Guest Unauthenticated Fallback Banner */}
          {!isLoggedIn && messages.length > 3 && (
            <button
              onClick={() => setShowLoginModal(true)}
              className="w-full mb-3 py-2 px-3 bg-white/70 rounded-full text-sm text-gray-400 hover:text-gray-600 flex items-center justify-center gap-2 border border-dashed border-gray-200"
            >
              <Save className="h-4 w-4" />
              Save chat to continue later
            </button>
          )}

          <div className="relative">
            <input
              autoFocus
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSend()
                }
              }}
              placeholder="Type here..."
              className="w-full bg-[#FAF9F6] border border-gray-100 rounded-2xl py-4 pl-6 pr-28 text-[15px] text-[#5A5A5A] focus:outline-none shadow-sm transition-all focus:border-[#E9B87D]"
            />
            
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-5">
              {/* Speech-To-Text Toggle Button */}
              <button
                type="button"
                onClick={startRecording}
                className={cn(
                  "transition-colors bg-transparent border-none cursor-pointer p-1",
                  isRecording ? "text-red-500 scale-110 animate-pulse" : "text-gray-400 hover:text-gray-600"
                )}
              >
                <Mic className="h-5 w-5" />
              </button>
              
              {/* Network Payload Dispatch Trigger */}
              <button
                onClick={handleSend}
                disabled={isWaitingResponse}
                className={cn(
                  "transition-colors bg-transparent border-none cursor-pointer p-1",
                  isWaitingResponse ? "text-gray-200 cursor-not-allowed" : "text-[#3D3D3D] hover:text-black"
                )}
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>

          <p className="text-[11px] text-gray-400 italic mt-2 pl-1">
            You can share as much or as little as you want.
          </p>
        </div>
      </div>

      {/* ── Medical Disclaimer ── */}
      <div className="text-center py-4">
        <p className="text-xs text-gray-400">
          KAAL AI is not a doctor or therapist.
        </p>
      </div>

      {/* ── Contextual Modal Portals ── */}
      <AuthModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </div>
  )
}

// ────────────────────── MessageBubble Component ──────────────────────
function MessageBubble({ message, idx }: { message: Message; idx: number }) {
  const isUser = message.role === "user"

  if (message.isLoading) return null

  return (
    <div
      className={cn(
        "flex w-full animate-in fade-in slide-in-from-top-2 duration-500",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "bg-[#F0EAE2] rounded-[32px] px-10 py-6 shadow-sm transition-all duration-300 max-w-[85%] w-fit",
          isUser ? "text-right" : "text-left"
        )}
      >
        <h2 className="text-base font-bold text-[#3D3D3D] mb-1 leading-tight">
          {isUser ? "You" : idx === 0 ? "I hear you." : "Kaal AI"}
        </h2>
        <p className="text-[14px] text-[#5A5A5A] leading-relaxed whitespace-pre-wrap">
          {message.content}
        </p>
      </div>
    </div>
  )
}