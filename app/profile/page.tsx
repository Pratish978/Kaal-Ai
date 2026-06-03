"use client"

import { useEffect, useState } from "react"
import { Navbar } from "@/components/navbar"
import { useAuth } from "@/contexts/auth-context"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MessageSquare, Zap, LogOut, Crown, Clock, Flame, Calendar, CheckCircle2, ArrowRight } from "lucide-react"
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

  // 1st Logic: Exact condition for premium flag
  const isPremium = user?.premium === true

  // 1st Logic: Required diagnostic logging to verify frontend hydration states seamlessly
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

  const formatChatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return isNaN(date.getTime()) ? "Recently" : date.toLocaleString([], { dateStyle: "medium", timeStyle: "short" })
    } catch { return "Recently" }
  }

  if (!isLoggedIn || !user) return null

  return (
    <main className="min-h-screen flex flex-col bg-[#FBF9F6]">
      <Navbar showBackButton />

      <div className="flex-1 px-4 py-8 md:py-12">
        <div className="max-w-3xl mx-auto space-y-8">
          
          {/* PROFILE USER INFO */}
          <section className="bg-white p-6 sm:p-8 rounded-[24px] border border-stone-200/70 shadow-sm relative overflow-hidden">
            {isPremium && (
              <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500/10 to-transparent w-32 h-32 rounded-bl-full pointer-events-none" />
            )}
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 relative z-10">
              <div className="flex gap-4 sm:gap-5 items-center">
                <div className={`p-0.5 rounded-full ${isPremium ? 'bg-gradient-to-tr from-amber-500 via-amber-200 to-amber-600' : 'bg-stone-200'}`}>
                  <Avatar className="h-16 w-16 border-2 border-white">
                    <AvatarFallback className={`text-xl font-bold ${isPremium ? 'bg-stone-900 text-amber-400' : 'bg-[#E9B87D] text-white'}`}>
                      {user.initial || "U"}
                    </AvatarFallback>
                  </Avatar>
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">{user.name}</h1>
                    {isPremium && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-500 text-stone-950 text-[10px] font-black uppercase tracking-wider rounded-full shadow-sm">
                        <Crown className="w-2.5 h-2.5 fill-current" /> Premium
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-stone-400 font-light mt-0.5 break-all">{user.email}</p>
                </div>
              </div>

              <Button
                variant="outline"
                className="text-stone-500 hover:text-red-600 hover:bg-red-50/50 border-stone-200 rounded-xl sm:w-auto w-full transition-colors h-10 text-xs font-semibold tracking-wider uppercase"
                onClick={handleLogout}
              >
                <LogOut className="h-3.5 w-3.5 mr-2" /> Log out
              </Button>
            </div>
          </section>

          {/* DYNAMIC PLAN AND METRICS CARD */}
          <section className="grid md:grid-cols-3 gap-4">
            <Card className={`md:col-span-2 bg-white border shadow-sm rounded-[24px] overflow-hidden transition-all ${isPremium ? 'border-amber-500/40 shadow-amber-500/[0.02]' : 'border-stone-200/70'}`}>
              <CardContent className="p-6 flex flex-col justify-between h-full min-h-[140px]">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-bold mb-1">Membership Plan</p>
                  <h3 className={`text-xl font-serif font-bold flex items-center gap-2 ${isPremium ? 'text-amber-700' : 'text-stone-800'}`}>
                    {isPremium ? "KAAL AI - Founding Member" : "Free Seeker Tier"}
                  </h3>
                  <p className="text-xs text-stone-500 font-light mt-1.5 leading-relaxed">
                    {isPremium 
                      ? "Unrestricted conversation space & immersive high-fidelity ElevenLabs audio streams activated." 
                      : "Upgrade to break routine character limits and access specialized deep focus soundscapes."}
                  </p>
                </div>

                {isPremium ? (
                  user.premium_expires_at && (
                    <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-2 rounded-xl mt-4 w-full sm:w-fit">
                      <Calendar className="w-4 h-4 shrink-0" />
                      <span className="text-xs font-medium">Valid Until: {new Date(user.premium_expires_at).toLocaleDateString()}</span>
                    </div>
                  )
                ) : (
                  <Button
                    className="bg-[#E9B87D] hover:bg-[#d4a55d] text-white w-full sm:w-auto rounded-xl px-4 h-10 text-xs font-bold uppercase tracking-wider transition-all mt-4"
                    onClick={() => router.push('/pricing')}
                  >
                    Upgrade Framework <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-stone-900 to-stone-950 text-stone-100 border-none shadow-md rounded-[24px] overflow-hidden p-6 flex flex-col justify-between">
              <div>
                <p className="text-[9px] uppercase tracking-[0.2em] text-stone-400 font-bold mb-1">Voice Core</p>
                <h4 className="text-base font-serif font-bold text-amber-400 flex items-center gap-1.5">
                  Krishna Engine v2
                </h4>
              </div>
              <div className="mt-4 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-light text-stone-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 fill-amber-500/10" /> {isPremium ? "HD Audio Active" : "Standard Quality"}
                </div>
                <div className="flex items-center gap-2 text-xs font-light text-stone-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 fill-amber-500/10" /> {isPremium ? "No Token Throttling" : "Daily Limit Active"}
                </div>
              </div>
            </Card>
          </section>

          {/* STATS ACCENTS */}
          <section className="space-y-3">
            <h2 className="text-xs uppercase tracking-widest text-stone-400 font-bold flex items-center gap-2">
              <Zap className="h-3.5 w-3.5 text-amber-500" /> Metrics Tracking
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-white border border-stone-200/70 shadow-sm rounded-xl">
                <CardContent className="p-4 flex items-center gap-3.5">
                  <div className="p-2.5 bg-amber-500/5 rounded-xl text-amber-600"><Flame className="w-5 h-5" /></div>
                  <div>
                    <p className="text-xl font-bold text-stone-800">{progress.sessions}</p>
                    <p className="text-[10px] uppercase text-stone-400 font-bold tracking-wider">Sessions</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white border border-stone-200/70 shadow-sm rounded-xl">
                <CardContent className="p-4 flex items-center gap-3.5">
                  <div className="p-2.5 bg-emerald-500/5 rounded-xl text-emerald-600"><Clock className="w-5 h-5" /></div>
                  <div>
                    <p className="text-xl font-bold text-stone-800">{progress.minutes}</p>
                    <p className="text-[10px] uppercase text-stone-400 font-bold tracking-wider">Minutes</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* CHAT ARCHIVE */}
          <section className="space-y-3">
            <h2 className="text-xs uppercase tracking-widest text-stone-400 font-bold flex items-center gap-2">
              <MessageSquare className="h-3.5 w-3.5 text-stone-500" /> Saved Conversations ({savedChats.length})
            </h2>

            {loading ? (
              <div className="text-center py-8 bg-white rounded-[24px] border border-stone-200/70 shadow-sm">
                <p className="text-xs text-stone-400 animate-pulse">Decrypting safe entries...</p>
              </div>
            ) : savedChats.length > 0 ? (
              <div className="space-y-2.5">
                {savedChats.map((chat) => (
                  <Card
                    key={chat.id}
                    onClick={() => router.push(`/chat?session=${chat.id}`)}
                    className="bg-white border border-stone-200/70 hover:border-amber-500/50 hover:shadow-sm transition-all duration-200 cursor-pointer rounded-xl overflow-hidden group"
                  >
                    <CardContent className="p-4 flex justify-between items-center gap-4">
                      <div className="min-w-0 flex-1">
                        <p className="font-serif font-bold text-stone-800 text-sm group-hover:text-amber-800 transition-colors truncate">
                          {chat.title}
                        </p>
                        <p className="text-xs text-stone-400 font-light mt-0.5 line-clamp-1">{chat.preview}</p>
                        <p className="text-[10px] text-stone-400 font-mono mt-1.5">{formatChatDate(chat.timestamp)}</p>
                      </div>
                      <Button variant="ghost" size="sm" className="rounded-lg border border-stone-100 hover:bg-stone-50 text-stone-600 text-xs h-7 px-2.5">
                        Open
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-white border border-stone-200/70 shadow-sm rounded-[24px]">
                <CardContent className="py-10 text-center">
                  <p className="text-xs text-stone-400 font-light">No archive configurations established yet.</p>
                </CardContent>
              </Card>
            )}
          </section>

        </div>
      </div>
    </main>
  )
}