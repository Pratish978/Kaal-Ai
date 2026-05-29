"use client"

import { useState, useEffect, useRef, use } from "react"
import { useRouter } from "next/navigation"
import { X, Play, Pause, SkipBack, SkipForward } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"
import Image from "next/image"

const meditationData: Record<
  string,
  { title: string; duration: number; image: string; sound: string }
> = {
  "morning-energy": {
    title: "Morning Energy",
    duration: 240,
    image: "/meditate.png",
    sound: "/sounds/morning.mp3",
  },
  "stress-relief": {
    title: "Stress Relief",
    duration: 720,
    image: "/meditate.png",
    sound: "/sounds/stress.mp3",
  },
  "deep-calm": {
    title: "Deep Calm",
    duration: 264,
    image: "/meditate.png",
    sound: "/sounds/deep.mp3",
  },
}

export default function MeditationSessionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const { user } = useAuth()

  const meditation = meditationData[id] || meditationData["breathing-calm"]

  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [breathPhase, setBreathPhase] = useState<"inhale" | "hold" | "exhale">("inhale")
  const [tracked, setTracked] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const breathIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const breathTimeoutRefs = useRef<NodeJS.Timeout[]>([])

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const omRef = useRef<HTMLAudioElement | null>(null)

  // Guard hydration mismatch states
  useEffect(() => {
    setIsMounted(true)
    return () => {
      // Direct clean teardown on component unmount
      audioRef.current?.pause()
      omRef.current?.pause()
    }
  }, [])

  /* ---------------- TRACK MEDITATION ---------------- */
  const trackMeditation = async () => {
    try {
      await fetch("/api/meditation", {
        headers: {
          "x-user-name": user?.name || "",
          "x-user-email": user?.email || "",
        },
      })
      setTracked(true)
    } catch (error) {
      console.error("Meditation tracking failed", error)
    }
  }

  /* ---------------- LOAD AUDIO ---------------- */
  useEffect(() => {
    if (!isMounted) return

    // Clean up old audio instances if id changes
    if (audioRef.current) audioRef.current.pause()
    if (omRef.current) omRef.current.pause()

    audioRef.current = new Audio(meditation.sound)
    audioRef.current.loop = true
    audioRef.current.volume = 0.45

    omRef.current = new Audio("/sounds/om.mp3")
    omRef.current.volume = 0.6

    // Sync audio seek position if time modified manually while paused
    if (audioRef.current) {
      audioRef.current.currentTime = currentTime
    }

    return () => {
      audioRef.current?.pause()
      omRef.current?.pause()
    }
  }, [meditation.sound, isMounted])

  /* ---------------- TIMER + BREATHING ---------------- */
  useEffect(() => {
    if (!isPlaying || !isMounted) {
      // Clear timers when paused
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (breathIntervalRef.current) clearInterval(breathIntervalRef.current)
      breathTimeoutRefs.current.forEach(clearTimeout)
      breathTimeoutRefs.current = []
      return
    }

    // Main clock increment tracking loop
    intervalRef.current = setInterval(() => {
      setCurrentTime((prev) => {
        if (prev >= meditation.duration) {
          setIsPlaying(false)
          audioRef.current?.pause()
          omRef.current?.pause()
          return meditation.duration
        }
        // Keep HTML audio element timeline perfectly in sync with state tracker clock
        if (audioRef.current && Math.abs(audioRef.current.currentTime - prev) > 2) {
          audioRef.current.currentTime = prev
        }
        return prev + 1
      })
    }, 1000)

    // Breathing engine logic
    const breathCycle = () => {
      setBreathPhase("inhale")

      if (id === "breathing-calm" && omRef.current) {
        omRef.current.currentTime = 0
        omRef.current.play().catch((e) => console.log("Om play blocked:", e))
      }

      const holdTimeout = setTimeout(() => setBreathPhase("hold"), 4000)
      const exhaleTimeout = setTimeout(() => setBreathPhase("exhale"), 8000)

      breathTimeoutRefs.current = [holdTimeout, exhaleTimeout]
    }

    breathCycle()
    breathIntervalRef.current = setInterval(breathCycle, 12000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (breathIntervalRef.current) clearInterval(breathIntervalRef.current)
      breathTimeoutRefs.current.forEach(clearTimeout)
      breathTimeoutRefs.current = []
    }
  }, [isPlaying, meditation.duration, id, isMounted])

  const progress = (currentTime / meditation.duration) * 100

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  /* ---------------- PLAY / PAUSE / CONTROLS ---------------- */
  const togglePlay = () => {
    if (!audioRef.current) return

    if (!isPlaying) {
      if (!tracked) {
        trackMeditation()
      }
      audioRef.current.play().catch((e) => console.log("Audio play blocked:", e))
      setIsPlaying(true)
    } else {
      audioRef.current.pause()
      omRef.current?.pause()
      setIsPlaying(false)
    }
  }

  const handleClose = () => {
    audioRef.current?.pause()
    omRef.current?.pause()
    setIsPlaying(false)
    router.push("/meditation")
  }

  const handleSkipBack = () => {
    const targetTime = Math.max(0, currentTime - 30)
    setCurrentTime(targetTime)
    if (audioRef.current) audioRef.current.currentTime = targetTime
  }

  const handleSkipForward = () => {
    const targetTime = Math.min(meditation.duration, currentTime + 30)
    setCurrentTime(targetTime)
    if (audioRef.current) audioRef.current.currentTime = targetTime
  }

  const handleTimelineScrub = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const scrubPercentage = Math.min(Math.max(x / rect.width, 0), 1)
    const targetTime = scrubPercentage * meditation.duration
    
    setCurrentTime(targetTime)
    if (audioRef.current) audioRef.current.currentTime = targetTime
  }

  if (!isMounted) return null

  return (
    <div className="fixed inset-0 bg-[#3a3a4a] flex flex-col z-[50]">
      {/* Top Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-black/10">
        <div className="flex-1" />
        <div className="text-center">
          <h1 className="text-white font-medium text-lg">{meditation.title}</h1>
          <p className="text-white/60 text-xs mt-0.5">Mindful Session</p>
        </div>
        <div className="flex-1 flex justify-end">
          <button onClick={handleClose} className="text-white/80 hover:text-white p-2 rounded-full hover:bg-white/5 transition-colors cursor-pointer">
            <X className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Main Canvas Viewport Area */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 max-w-4xl mx-auto w-full">
        
        {/* Aspect Controlled Background Image Frame */}
        <div className="relative w-full aspect-[4/3] rounded-[32px] overflow-hidden mb-10 shadow-2xl bg-neutral-900 border border-white/10">
          <Image 
            src={meditation.image} 
            alt={meditation.title}
            fill
            className="object-cover opacity-80 select-none"
            sizes="(max-width: 768px) 100vw, 650px"
            priority
          />

          {/* Breathing Circle Overlay Lens */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/10">
            <div
              className={cn(
                "rounded-full bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center transition-all ease-in-out select-none",
                (!isPlaying || breathPhase === "hold") && "w-36 h-36 scale-110 duration-[1000ms]",
                isPlaying && breathPhase === "inhale" && "w-44 h-44 scale-125 duration-[4000ms]",
                isPlaying && breathPhase === "exhale" && "w-28 h-28 scale-100 duration-[4000ms]"
              )}
            >
              <span className="text-white text-sm font-semibold tracking-widest uppercase drop-shadow-sm">
                {isPlaying ? breathPhase : "Ready"}
              </span>
            </div>
          </div>
        </div>

        {/* Scrub-able Playback Slider Track */}
        <div className="w-full mb-6">
          <div className="flex justify-between text-xs font-mono text-white/60 mb-2">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(meditation.duration)}</span>
          </div>
          <div 
            onClick={handleTimelineScrub}
            className="relative h-2 bg-white/10 rounded-full cursor-pointer group flex items-center"
          >
            <div className="absolute inset-0 h-1 my-auto bg-white/10 rounded-full" />
            <div
              className="absolute left-0 top-0 bottom-0 h-1 my-auto bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full transition-all duration-150"
              style={{ width: `${progress}%` }}
            />
            <div 
              className="absolute h-3 w-3 rounded-full bg-white shadow-md border border-purple-400 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ left: `${progress}%` }}
            />
          </div>
        </div>

        {/* Media Layout Navigation Bars */}
        <div className="flex items-center justify-center gap-10 mt-2">
          <button onClick={handleSkipBack} className="text-white/60 hover:text-white p-3 rounded-full hover:bg-white/5 transition-all active:scale-90 cursor-pointer">
            <SkipBack className="h-7 w-7" />
          </button>

          <button
            onClick={togglePlay}
            className="w-20 h-20 rounded-full bg-white text-neutral-900 flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            {isPlaying ? (
              <Pause className="h-8 w-8 fill-current text-neutral-900" />
            ) : (
              <Play className="h-8 w-8 fill-current text-neutral-900 ml-1" />
            )}
          </button>

          <button onClick={handleSkipForward} className="text-white/60 hover:text-white p-3 rounded-full hover:bg-white/5 transition-all active:scale-90 cursor-pointer">
            <SkipForward className="h-7 w-7" />
          </button>
        </div>

      </div>
    </div>
  )
}