"use client"

import { useState, useRef, useEffect } from "react"
import { Mic, Send, Save, ArrowLeft, Volume2, Loader2, Square, Crown } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

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
    content: "I'm KAAL AI. This is a space to pause and reflect. What has been on your mind lately?",
  },
]

// Rotating presence captions shown while KAAL is composing a reply.
// Cycled, not random, so the pacing itself feels considered rather than glitchy.
const PRESENCE_CAPTIONS = ["Listening...", "Reflecting...", "Finding the words..."]

// Standardized UUID v4 fallback to prevent backend ID validation errors
const generateUUID = () => {
  if (typeof window !== "undefined" && window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function ChatInterface({ onBack }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState("")
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showPremiumModal, setShowPremiumModal] = useState(false)
  const [messageCount, setMessageCount] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [isWaitingResponse, setIsWaitingResponse] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [isInputFocused, setIsInputFocused] = useState(false)
  const [justSent, setJustSent] = useState(false)
  const [presenceCaptionIdx, setPresenceCaptionIdx] = useState(0)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const hasInitialized = useRef(false)

  const { isLoggedIn, user } = useAuth()

  // STRICT TESTING BYPASS RULE (Synced with Profile Page)
  const isPremium = Boolean(
    isLoggedIn && user && (
      user.email === "bhonglepratish@gmail.com" ||
      user.email === "piyu232004@gmail.com" ||
      user?.premium === true ||
      user?.plan === "founding" ||
      user?.plan === "plus" ||
      user?.plan === "annual"
    )
  );

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }
  
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Cycle the presence caption slowly while waiting for a reply — paced like a breath,
  // not a generic "typing" flicker.
  useEffect(() => {
    if (!isWaitingResponse) {
      setPresenceCaptionIdx(0)
      return
    }
    const interval = setInterval(() => {
      setPresenceCaptionIdx((prev) => (prev + 1) % PRESENCE_CAPTIONS.length)
    }, 2200)
    return () => clearInterval(interval)
  }, [isWaitingResponse])

  useEffect(() => {
    if (hasInitialized.current) return
    hasInitialized.current = true

    const restoredSessionId = localStorage.getItem("kaal_restored_session")
    const restoredMessagesStr = localStorage.getItem("kaal_restored_messages")

    if (restoredSessionId && restoredMessagesStr) {
      try {
        const parsed = JSON.parse(restoredMessagesStr)
        const mappedMessages = parsed.map((m: any) => ({
          id: m.id || generateUUID(), 
          role: m.role,
          content: m.content
        }))
        
        if (mappedMessages.length > 0) {
          setMessages(mappedMessages)
        }

        localStorage.setItem("kaal_session", restoredSessionId)
      } catch (e) {
        console.error("Failed to parse restored messages", e)
      }
      
      localStorage.removeItem("kaal_restored_session")
      localStorage.removeItem("kaal_restored_messages")
    } else {
      if (!localStorage.getItem("kaal_session")) {
        localStorage.setItem("kaal_session", generateUUID())
      }
    }
  }, [])

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
        
        const response = await fetch("/api/stt", { 
          method: "POST", 
          body: blob,
          headers: {
            "Content-Type": "audio/webm"
          }
        })
        const data = await response.json()
        if (data.text) setInput(data.text)
      }
      mediaRecorder.start()
      setIsRecording(true)
    } catch (err) {
      console.error("Microphone hardware error:", err)
    }
  }

  const handleSend = async () => {
    if (!input.trim() || isWaitingResponse) return
    const text = input
    const userMessage: Message = { id: generateUUID(), role: "user", content: text }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setMessageCount((prev) => prev + 1)
    setIsWaitingResponse(true)

    // Brief send pulse on the composer — tactile confirmation the message left.
    setJustSent(true)
    setTimeout(() => setJustSent(false), 400)

    if (messageCount >= 1 && messageCount < 2 && !isLoggedIn) {
      setTimeout(() => setShowLoginModal(true), 1000)
    }

    const loadingId = generateUUID()
    setMessages((prev) => [...prev, { id: loadingId, role: "assistant", content: "", isLoading: true }])

    try {
      let sessionId = localStorage.getItem("kaal_session")
      if (!sessionId) {
        sessionId = generateUUID()
        localStorage.setItem("kaal_session", sessionId)
      }

      const apiKey = process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY || process.env.NEXT_PUBLIC_CHAT_KEY || ""

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
          "x-user-name": user?.name || "",
          "x-user-email": user?.email || "",
        },
        body: JSON.stringify({ user_id: user?.id || null, session_id: sessionId, message: text }),
      })

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`)
      }

      const data = await response.json()
      const reply = data.reply || "KAAL AI couldn't respond right now."
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === loadingId ? { id: generateUUID(), role: "assistant", content: reply } : msg
        )
      )
      setIsWaitingResponse(false)
      
    } catch (error) {
      console.error("Chat error:", error)
      setIsWaitingResponse(false)
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === loadingId ? { id: generateUUID(), role: "assistant", content: "⚠️ Server error. Please try again." } : msg
        )
      )
    }
  }

  return (
    <div className="bg-[#FBF9F6] flex-1 flex flex-col items-center px-4 w-full overflow-hidden">
      <style>{`
        @keyframes kaal-breathe {
          0%, 100% { transform: scale(0.85); opacity: 0.35; }
          50% { transform: scale(1.15); opacity: 1; }
        }
        @keyframes kaal-caption-fade {
          0% { opacity: 0; transform: translateY(2px); }
          15%, 85% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-2px); }
        }
        @keyframes kaal-rise-in {
          from { opacity: 0; transform: translateY(10px) scale(0.985); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .kaal-message-enter {
          animation: kaal-rise-in 0.55s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        @media (prefers-reduced-motion: reduce) {
          .kaal-message-enter { animation: none; }
          .kaal-breathe { animation: none !important; }
        }
      `}</style>

      <div
        className={cn(
          "bg-[#F6F2ED] w-full max-w-3xl rounded-[40px] px-8 py-10 flex flex-col shadow-[0_8px_40px_-12px_rgba(120,90,50,0.12)] max-h-[82vh] mt-4 transition-all duration-1000 ease-out relative",
          isVisible ? "translate-y-0 opacity-100" : "-translate-y-10 opacity-0"
        )}
      >
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

        <div className={cn(
          "w-full overflow-y-auto mb-6 space-y-7 flex flex-col [&::-webkit-scrollbar]:hidden",
          onBack ? "pt-6" : "pt-0"
        )}>
          {messages.map((message, idx) => (
            <div
              key={message.id}
              className={message.isLoading ? "" : "kaal-message-enter"}
              style={message.isLoading ? undefined : { animationDelay: "40ms" }}
            >
              <MessageBubble 
                message={message} 
                idx={idx} 
                isPremium={isPremium}
                userEmail={user?.email}
                onShowPaywall={() => setShowPremiumModal(true)}
                presenceCaption={PRESENCE_CAPTIONS[presenceCaptionIdx]}
              />
              
              {idx === 4 && (
                <div className="my-6">
                  <WisdomCard insight="Clarity often appears when the mind becomes still. In silence, we find what matters most." />
                </div>
              )}
            </div>
          ))}

          <div ref={messagesEndRef} />
        </div>

        <div className="mt-auto w-full max-w-2xl mx-auto">
          {!isLoggedIn && messages.length > 3 && (
            <button
              onClick={() => setShowLoginModal(true)}
              className="w-full mb-3 py-2 px-3 bg-white/70 rounded-full text-sm text-gray-400 hover:text-gray-600 flex items-center justify-center gap-2 border border-dashed border-gray-200 transition-colors"
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
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSend()
                }
              }}
              placeholder="Type here..."
              className={cn(
                "w-full bg-[#FAF9F6] border rounded-2xl py-4 pl-6 pr-28 text-[15px] text-[#5A5A5A] focus:outline-none transition-all duration-300",
                isInputFocused
                  ? "border-[#E9B87D] shadow-[0_0_0_4px_rgba(233,184,125,0.12)]"
                  : "border-gray-100 shadow-sm"
              )}
            />
            
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-5">
              <button
                type="button"
                onClick={startRecording}
                className={cn(
                  "transition-all duration-200 bg-transparent border-none cursor-pointer p-1",
                  isRecording ? "text-red-500 scale-110 animate-pulse" : "text-gray-400 hover:text-gray-600 hover:scale-105"
                )}
              >
                <Mic className="h-5 w-5" />
              </button>
              
              <button
                onClick={handleSend}
                disabled={isWaitingResponse}
                className={cn(
                  "transition-all duration-200 bg-transparent border-none cursor-pointer p-1",
                  isWaitingResponse
                    ? "text-gray-200 cursor-not-allowed"
                    : "text-[#3D3D3D] hover:text-black hover:scale-110",
                  justSent && "scale-125 text-[#E9B87D]"
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

      <div className="text-center py-4">
        <p className="text-xs text-gray-400">
          KAAL AI is not a doctor or therapist.
        </p>
      </div>

      <AuthModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
      
      <PaywallModal 
        isOpen={showPremiumModal} 
        onClose={() => setShowPremiumModal(false)} 
      />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// PresenceIndicator — the signature "breathing" loading state.
// Three dots that expand and contract slowly like an inhale/exhale, instead of
// a generic fast-bouncing typing indicator. Paired with a slow-cycling caption.
// ─────────────────────────────────────────────────────────────────────────────
function PresenceIndicator({ caption }: { caption: string }) {
  return (
    <div className="flex items-center gap-3 py-1">
      <div className="flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="kaal-breathe block w-2 h-2 rounded-full bg-[#E9B87D]"
            style={{
              animation: "kaal-breathe 2.6s ease-in-out infinite",
              animationDelay: `${i * 0.35}s`,
            }}
          />
        ))}
      </div>
      <span
        key={caption}
        className="text-xs text-[#A78A63] font-medium tracking-wide"
        style={{ animation: "kaal-caption-fade 2.2s ease-in-out" }}
      >
        {caption}
      </span>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// MessageBubble Component
// ─────────────────────────────────────────────────────────────────────────────
function MessageBubble({ 
  message, 
  idx, 
  isPremium,
  userEmail,
  onShowPaywall,
  presenceCaption,
}: { 
  message: Message; 
  idx: number; 
  isPremium: boolean;
  userEmail?: string;
  onShowPaywall: () => void;
  presenceCaption: string;
}) {
  const isUser = message.role === "user"

  const [isGenerating, setIsGenerating] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const objectUrlRef = useRef<string | null>(null)

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current)
      }
    }
  }, [])

  if (message.isLoading) {
    return (
      <div className="flex w-full justify-start">
        <div className="bg-[#F0EAE2]/70 rounded-[32px] px-7 py-5 shadow-sm w-fit">
          <PresenceIndicator caption={presenceCaption} />
        </div>
      </div>
    )
  }

  const handlePlayVoice = async () => {
    if (!isPremium) {
      onShowPaywall()
      return
    }

    if (isPlaying && audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setIsPlaying(false)
      return
    }

    if (audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play().catch((err) => console.error("Audio playback interrupted:", err))
      return
    }

    try {
      setIsGenerating(true)
      
      console.log("TTS USER EMAIL:", userEmail);

      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-user-email": userEmail || ""
        },
        body: JSON.stringify({ 
          text: message.content,
          email: userEmail
        })
      })

      if (!res.ok) {
        throw new Error("Failed to generate voice")
      }

      const blob = await res.blob()
      
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current)
      }
      
      const url = URL.createObjectURL(blob)
      objectUrlRef.current = url
      
      const audio = new Audio(url)
      
      audio.onplay = () => setIsPlaying(true)
      audio.onended = () => setIsPlaying(false)
      audio.onpause = () => setIsPlaying(false)
      
      audioRef.current = audio
      
      audio.play().catch((err) => console.error("Audio playback failed:", err))

    } catch (error) {
      console.error("TTS Playback Error:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div
      className={cn(
        "flex w-full",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "rounded-[32px] px-6 py-6 sm:px-10 transition-all duration-300 w-fit relative",
          isUser
            ? "bg-[#FAF6EF] border border-[#E9B87D]/15 shadow-[0_2px_16px_-6px_rgba(233,184,125,0.18)]"
            : "bg-[#F0EAE2] shadow-sm",
          isPremium && !isUser ? "border border-amber-500/20 shadow-amber-500/[0.04]" : "",
          isUser 
            ? "text-right max-w-[92%] sm:max-w-[85%] md:max-w-[80%]" 
            : "text-left max-w-[92%] sm:max-w-[85%] md:max-w-[80%]"
        )}
      >
        <div className="flex items-center gap-2 mb-2 justify-between">
          <h2 className={cn(
            "text-base font-bold leading-tight",
            isUser ? "text-[#5A4A35]" : "text-[#3D3D3D] font-serif"
          )}>
            {isUser ? "You" : idx === 0 ? "I hear you." : "KAAL AI"}
          </h2>
          
          {isPremium && !isUser && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500/10 text-amber-700 text-[9px] font-black uppercase tracking-wider rounded-full">
              <Crown className="w-2.5 h-2.5 fill-current" /> Premium Seeker
            </span>
          )}
        </div>
        
        <p className="text-[15px] text-[#5A5A5A] leading-relaxed whitespace-pre-wrap">
          {message.content}
        </p>

        {!isUser && (
          <div className="mt-5 flex justify-start">
            <button 
              onClick={handlePlayVoice}
              disabled={isGenerating}
              className={cn(
                "flex items-center gap-2.5 px-5 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all duration-300 active:scale-95 shadow-sm",
                isGenerating 
                  ? "bg-white/60 text-[#E9B87D] border border-[#E9B87D]/30 cursor-wait" 
                  : isPlaying
                  ? "bg-[#E9B87D] text-white border border-[#E9B87D] shadow-md"
                  : "bg-[#FAF9F6] text-[#7A7A7A] border border-gray-200/80 hover:bg-white hover:text-[#E9B87D] hover:border-[#E9B87D]/50 hover:shadow-md"
              )}
              title={isPlaying ? "Stop audio" : "Listen to response"}
            >
              {isGenerating ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Generating Audio...</span>
                </>
              ) : isPlaying ? (
                <>
                  <Square size={14} className="fill-current" />
                  <span>Playing...</span>
                </>
              ) : (
                <>
                  <Volume2 size={16} />
                  <span>Listen to Guidance</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// PaywallModal Component
// ─────────────────────────────────────────────────────────────────────────────
function PaywallModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const router = useRouter()
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] rounded-[32px] p-6 sm:p-8 bg-white border border-gray-100 shadow-xl gap-0">
        <DialogHeader className="text-center mb-6">
          <DialogTitle className="text-2xl font-serif text-gray-800 text-center leading-tight">
            Unlock KAAL AI Premium
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mb-8">
          {[
            { icon: "🎧", text: "Krishna Voice Guidance" },
            { icon: "🧘", text: "Full Meditation Library" },
            { icon: "♾", text: "Unlimited Conversations" }
          ].map((benefit, i) => (
            <div key={i} className="flex items-center gap-4 text-sm text-gray-800 font-medium">
              <div className="bg-[#E9B87D]/10 p-2 rounded-full text-lg w-10 h-10 flex items-center justify-center">
                {benefit.icon}
              </div>
              {benefit.text}
            </div>
          ))}
        </div>

        <div className="text-center mb-8 bg-[#F6F2ED] py-4 rounded-2xl border border-[#E9B87D]/20">
          <p className="text-3xl font-bold text-gray-800">
            ₹49<span className="text-sm font-normal text-gray-500">/month</span>
          </p>
          <p className="text-xs text-[#E9B87D] font-bold uppercase tracking-widest mt-1">
            Founding Offer
          </p>
        </div>

        <DialogFooter className="flex flex-col sm:flex-col gap-3 w-full">
          <button 
            onClick={() => {
              onClose();
              router.push('/pricing');
            }}
            className="w-full bg-[#E9B87D] hover:bg-[#d4a55d] text-white rounded-full py-4 text-sm font-bold tracking-wider uppercase shadow-md transition-all active:scale-95"
          >
            Upgrade Now
          </button>
          <button 
            onClick={onClose}
            className="w-full text-gray-400 hover:text-gray-600 rounded-full py-3 text-sm font-medium transition-colors"
          >
            Maybe Later
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}