"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/contexts/auth-context"

import { useMeditations } from "@/hooks/useMeditations"
import Image from "next/image"
import { X, Play, Pause, SkipBack, SkipForward } from "lucide-react"
import AuthModal from "./login-modal"

/* ═══════════════════════════════════════════
   MEDITATION PLAYER  (file 3 — full code)
═══════════════════════════════════════════ */
interface PlayerProps {
  onClose: () => void
  title: string
  audioSrc: string
}

function MeditationPlayer({ onClose, title, audioSrc }: PlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isMounted, setIsMounted] = useState(false)

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00"
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`
  }

  // Handle client-side mounting guardrail
  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted) return
    const audio = audioRef.current
    if (!audio) return

    const setAudioData = () => {
      if (audio.duration) setDuration(audio.duration)
    }
    const setAudioTime = () => {
      if (!isNaN(audio.currentTime)) setCurrentTime(audio.currentTime)
    }
    const handleAudioError = (e: any) => {
      console.error("Audio engine failed to load resource path:", audioSrc, e)
    }

    audio.addEventListener("loadedmetadata", setAudioData)
    audio.addEventListener("timeupdate", setAudioTime)
    audio.addEventListener("error", handleAudioError)

    // Reset UI state before loading new file
    setCurrentTime(0)
    setDuration(0)
    
    audio.load()
    
    // Explicit user action context execution safe trigger
    const playPromise = audio.play()
    if (playPromise !== undefined) {
      playPromise
        .then(() => setIsPlaying(true))
        .catch((e) => console.log("Autoplay context managed safely:", e))
    }

    return () => {
      audio.removeEventListener("loadedmetadata", setAudioData)
      audio.removeEventListener("timeupdate", setAudioTime)
      audio.removeEventListener("error", handleAudioError)
    }
  }, [audioSrc, isMounted])

  const togglePlay = () => {
    if (!audioRef.current) return
    if (audioRef.current.paused) {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch((e) => console.error("Playback engine contextual fail:", e))
    } else {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const clickedValue = (x / rect.width) * duration
    audioRef.current.currentTime = clickedValue
  }

  if (!isMounted) return null

  return (
    <div className="fixed inset-0 z-[999] bg-[#6B6B6B]/90 backdrop-blur-sm flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="w-full max-w-4xl flex justify-center items-center relative mb-6">
        <div className="text-center text-white">
          <h2 className="text-[18px] font-medium">{title}</h2>
          <p className="text-[12px] opacity-80">Listening Now</p>
        </div>
        <button onClick={onClose} className="absolute right-0 text-white p-2 cursor-pointer hover:opacity-80 transition-opacity">
          <X size={28} />
        </button>
      </div>

      {/* Image + controls container */}
      <div className="relative w-full max-w-[850px] h-[50vh] md:h-auto md:aspect-[16/10] rounded-3xl overflow-hidden shadow-2xl bg-neutral-900">
        <Image 
          src="/meditate.png" 
          alt="Meditation" 
          fill
          className="object-cover opacity-90"
          sizes="(max-width: 850px) 100vw, 850px"
          priority
        />

        <div className="absolute bottom-0 left-0 right-0 px-6 pb-8 pt-24 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
          <audio ref={audioRef} src={audioSrc} preload="auto" crossOrigin="anonymous" />

          {/* Progress Bar */}
          <div className="w-full mb-6">
            <div className="flex justify-between text-white text-[13px] mb-3">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
            <div
              onClick={handleSeek}
              className="relative w-full h-1 bg-white/20 rounded-full cursor-pointer group py-2 flex items-center"
            >
              <div className="w-full h-1 bg-white/20 rounded-full relative">
                <div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#5E5CE6] to-[#BF5AF2] rounded-full"
                  style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between px-4 text-white">
            <button className="cursor-pointer hover:opacity-80 transition-opacity">
              <SkipBack size={26} fill="currentColor" />
            </button>
            <button
              onClick={togglePlay}
              className="bg-white/20 hover:bg-white/30 p-4 rounded-full backdrop-blur-md cursor-pointer transition-all active:scale-95"
            >
              {isPlaying
                ? <Pause size={32} fill="currentColor" />
                : <Play size={32} fill="currentColor" />}
            </button>
            <button className="cursor-pointer hover:opacity-80 transition-opacity">
              <SkipForward size={26} fill="currentColor" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════
   MEDITATION CARD  (file 1 logic + file 2 UI)
═══════════════════════════════════════════ */
interface MeditationCardProps {
  id: string
  title: string
  description: string
  duration: string
  isLocked?: boolean
  isFree?: boolean
  audioSrc?: string
  onLockedClick?: () => void
}

function MeditationCard({
  id,
  title,
  description,
  duration,
  isLocked = false,
  isFree = false,
  audioSrc = "",
  onLockedClick,
}: MeditationCardProps) {
  const { isLoggedIn } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  const isUnlocked = isFree || isLoggedIn

  const handleClick = () => {
    if (!isUnlocked) {
      onLockedClick?.()
      return
    }
    setIsOpen(true)
  }

  return (
    <>
      <div
        onClick={handleClick}
        className={`bg-white rounded-[32px] p-7 text-left flex flex-col min-h-[240px] w-full transition-all duration-300 ${
          isUnlocked
            ? "shadow-[0_20px_50px_rgba(0,0,0,0.1)] cursor-pointer active:scale-[0.98]"
            : "shadow-[0_10px_30px_rgba(0,0,0,0.04)] opacity-90 cursor-pointer hover:shadow-md"
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 relative flex-shrink-0">
              <Image src="/Home1.png" alt="Icon" width={32} height={32} className="object-contain" sizes="32px" priority />
            </div>
            <h4 className="font-bold text-[#333333] text-[17px] tracking-tight">{title}</h4>
          </div>

          {!isUnlocked && (
            <span className="text-[12px] font-bold text-neutral-400 bg-neutral-100/70 px-2.5 py-1 rounded-xl">
              🔒 Locked
            </span>
          )}
        </div>

        <div className="grow">
          <p className="text-[#7D7D7D] text-[14px] leading-relaxed font-medium max-w-[90%]">
            {description}
          </p>
        </div>

        <div className="flex justify-between items-center mt-6">
          <div className={`px-5 py-2 rounded-2xl text-[13px] font-bold ${
            isUnlocked ? "bg-[#E8F9E9] text-[#5CC489]" : "bg-[#FEF0E3] text-[#D48D5E]"
          }`}>
            {isUnlocked ? "Free" : "Locked"}
          </div>
          <span className="text-[13px] text-[#A5C683] font-bold">{duration}</span>
        </div>
      </div>

      {isOpen && (
        <MeditationPlayer
          title={title}
          audioSrc={audioSrc}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  )
}

/* ═══════════════════════════════════════════
   MEDITATION CARDS  (file 1 logic — untouched)
═══════════════════════════════════════════ */
export function MeditationCards() {
  const [showLoginModal, setShowLoginModal] = useState(false)
  const { isLoggedIn } = useAuth()
  const { meditations: rawMeditations, loading } = useMeditations()

  const defaultMeditations = [
    {
      id: "morning-energy",
      title: "Morning Energy",
      description: "Start your day with vitality and clarity.",
      duration: "8 mins",
      isFree: true,
      isLocked: false,
      audioSrc: "/Music/morning.mp3",
    },
    {
      id: "stress-relief",
      title: "Stress Relief",
      description: "Release tension and find inner peace.",
      duration: "12 mins",
      isFree: false,
      isLocked: true,
      audioSrc: "/Music/stress.mp3",
    },
    {
      id: "deep-calm",
      title: "Deep Calm",
      description: "Enter a state of profound tranquility.",
      duration: "15 mins",
      isFree: false,
      isLocked: true,
      audioSrc: "/Music/deep.mp3",
    },
  ]

  const dataSources = rawMeditations && rawMeditations.length > 0 ? rawMeditations : defaultMeditations

  const meditations = dataSources
    .filter((med: any) => med.id !== "breathing-calm")
    .map((med: any, idx: number) => {
      const isFree = idx === 0
      const isLocked = !isFree && !isLoggedIn
      
      // Strict layout fallback parser mapping strategy
      let finalAudioSrc = med.audioSrc
      if (!finalAudioSrc) {
        if (med.id === "stress-relief") {
          finalAudioSrc = "/Music/stress.mp3"
        } else if (med.id === "deep-calm") {
          finalAudioSrc = "/Music/deep.mp3"
        } else if (med.id === "morning-energy") {
          finalAudioSrc = "/Music/morning.mp3"
        } else {
          finalAudioSrc = `/Music/${med.id}.mp3`
        }
      }

      return {
        ...med,
        isFree,
        isLocked,
        audioSrc: finalAudioSrc,
      }
    })

  return (
    <>
      <div className="w-full bg-[#FBF9F6] py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xl font-semibold text-center text-[#333] mb-2">
            Guided Meditations
          </h2>
          <p className="text-center text-[#7D7D7D] text-sm mb-8">
            Choose a meditation to practice mindfulness and calm
          </p>

          {!loading && meditations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {meditations.map((meditation: any) => (
                <MeditationCard
                  key={meditation.id}
                  {...meditation}
                  onLockedClick={() => setShowLoginModal(true)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-[#7D7D7D]">
                {loading ? "Loading meditations..." : "No meditations available"}
              </p>
            </div>
          )}
        </div>
      </div>

      <AuthModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        title="Unlock Premium Meditations"
        message="Sign in to access all meditation sessions, save your progress, and track your wellness journey."
      />
    </>
  )
}