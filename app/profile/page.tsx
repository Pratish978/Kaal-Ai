"use client"

import { useEffect, useState } from "react"
import { Navbar } from "@/components/navbar"
import { useAuth } from "@/contexts/auth-context"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MessageSquare, Zap, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"

interface SavedChat {
  id: string
  title: string
  preview: string
  timestamp: string
}

interface MeditationProgress {
  sessions: number
  minutes: number
}

export default function ProfilePage() {
  const { user, isLoggedIn, logout } = useAuth()
  const router = useRouter()

  const [savedChats, setSavedChats] = useState<SavedChat[]>([])
  const [loading, setLoading] = useState(true)

  const [progress, setProgress] = useState<MeditationProgress>({
    sessions: 0,
    minutes: 0
  })

  // Determine if the user is premium using the specific true flag condition
  const isPremium = user?.premium === true

  // Required diagnostic logging to verify frontend hydration states seamlessly
  console.log("AUTH STATE:", user);
  console.log("PREMIUM STATUS:", isPremium);

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/")
      return
    }

    /* ---------------- MEDITATION PROGRESS ---------------- */
    const meditation = JSON.parse(
      localStorage.getItem("kaal_meditation_progress") ||
      '{"sessions":0,"minutes":0}'
    )
    setProgress(meditation)

    /* ---------------- SAVED CHATS ---------------- */
    const fetchSavedChats = async () => {
      if (!user?.id) return;

      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"
      const url = `${baseUrl}/api/saved-chats/${user.id}`
      const apiKey = process.env.NEXT_PUBLIC_API_KEY || ""

      try {
        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "X-API-Key": apiKey
          }
        })
        
        if (!response.ok) {
          throw new Error(`Failed to fetch saved chats: ${response.statusText}`)
        }

        const data = await response.json()
        console.log("PROFILE RESPONSE:", data); // Injecting required tracking format trace hook

        if (data && data.success && Array.isArray(data.chats)) {
          const formattedChats: SavedChat[] = data.chats.map((chat: any) => ({
            id: chat.session_id || chat._id || chat.id,
            title: chat.title || "Conversation",
            preview: chat.preview || chat.last_message || chat.lastMessage || "",
            timestamp: chat.updated_at || chat.createdAt || chat.timestamp || new Date().toISOString()
          }))
          setSavedChats(formattedChats)
        } else {
          setSavedChats([])
        }
      } catch (error) {
        console.error("Error fetching saved chats:", error)
        setSavedChats([])
      } finally {
        setLoading(false)
      }
    }

    fetchSavedChats()
  }, [isLoggedIn, router, user])

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  if (!isLoggedIn || !user) return null

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <Navbar showBackButton />

      <div className="flex-1 px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-8">

          {/* PROFILE HEADER */}
          <section className="bg-card p-5 sm:p-6 rounded-2xl border">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
              <div className="flex gap-4 items-center">
                <Avatar className="h-16 w-16 bg-primary/20">
                  <AvatarFallback className="text-xl text-primary">
                    {user.initial}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-xl sm:text-2xl font-semibold">
                    {user.name}
                  </h1>
                  <p className="text-sm text-muted-foreground break-all">
                    {user.email}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                className="text-destructive sm:w-auto w-full"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Log out
              </Button>
            </div>
          </section>

          {/* CURRENT PLAN */}
          <section>
            <Card className="bg-white border border-gray-100 shadow-sm rounded-2xl hover:shadow-md transition-shadow duration-300">
              <CardContent className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold mb-1">
                    Current Plan
                  </p>
                  <h3 className={`text-xl font-serif font-bold mb-1 ${isPremium ? 'text-[#E9B87D]' : 'text-gray-800'}`}>
                    {isPremium ? "FOUNDING" : "FREE"}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {isPremium && user.premium_expires_at
                      ? `Premium Access Enabled • Expires on ${new Date(user.premium_expires_at).toLocaleDateString()}`
                      : "You are currently using the free version of KALL AI."}
                  </p>
                </div>
                {!isPremium && (
                  <Button
                    className="bg-[#E9B87D] hover:bg-[#d4a55d] text-white w-full sm:w-auto rounded-full font-medium transition-all"
                    onClick={() => router.push('/pricing')}
                  >
                    Upgrade to Premium →
                  </Button>
                )}
              </CardContent>
            </Card>
          </section>

          {/* SAVED CHATS */}
          <section>
            <h2 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Saved Conversations
            </h2>

            {loading ? (
              <p className="text-muted-foreground">Loading conversations...</p>
            ) : savedChats.length > 0 ? (
              <div className="space-y-3">
                {savedChats.map((chat) => (
                  <Card
                    key={chat.id}
                    className="bg-card border-border hover:border-muted-foreground transition-all cursor-pointer"
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{chat.title}</p>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {chat.preview}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(chat.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-full shrink-0"
                          onClick={() => router.push(`/chat?session=${chat.id}`)}
                        >
                          Open
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-card border-border">
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground">No saved conversations yet</p>
                </CardContent>
              </Card>
            )}
          </section>

          {/* MEDITATION PROGRESS */}
          <section>
            <h2 className="text-lg sm:text-xl font-semibold mb-4 flex gap-2">
              <Zap className="h-5 w-5" />
              Meditation Progress
            </h2>
            <Card className="bg-card border-border">
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground">Sessions: {progress.sessions}</p>
                <p className="text-sm text-muted-foreground">Minutes: {progress.minutes}</p>
              </CardContent>
            </Card>
          </section>

        </div>
      </div>
    </main>
  )
}