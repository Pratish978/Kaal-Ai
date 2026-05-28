"use client"

import { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { Volume2 } from "lucide-react"
import { DailyGitaWisdom } from "@/components/daily-gita-wisdom"
import Image from "next/image"

// ── First file's types & data (untouched) ──
type BreathingPattern = {
  name: string
  pattern: string
  indigo?: string // optional field template
  inhale: number
  hold: number
  exhale: number
}

type BreathingExerciseProps = {
  onSessionComplete?: () => void
}

const patterns: BreathingPattern[] = [
  { name: "Gentle", pattern: "4-4-4", inhale: 4, hold: 4, exhale: 4 },
  { name: "Deep",   pattern: "5-5-8", inhale: 5, hold: 5, exhale: 8 },
  { name: "Power",  pattern: "4-7-8", inhale: 4, hold: 7, exhale: 8 },
]

export function BreathingExercise({ onSessionComplete }: BreathingExerciseProps) {

  // ── First file's state (untouched) ──
  const [selectedPattern, setSelectedPattern] = useState(patterns[0])
  const [breathCount,     setBreathCount]     = useState(6)
  const [currentBreath,   setCurrentBreath]   = useState(0)
  const [phase, setPhase]                     = useState<"idle" | "inhale" | "hold" | "exhale">("idle")
  const [isActive,         setIsActive]        = useState(false)
  const [showReflection,   setShowReflection]  = useState(false)
  const [omPlaying,       setOmPlaying]       = useState(false)

  // Second file's timeLeft for display
  const [timeLeft, setTimeLeft] = useState(0)

  const audioRef     = useRef<HTMLAudioElement | null>(null)
  const timerRef     = useRef<NodeJS.Timeout | null>(null)
  const countdownRef = useRef<NodeJS.Timeout | null>(null)

  /* ── OM SOUND LOGIC ── */
  const toggleOmSound = () => {
    if (!audioRef.current) return
    
    if (omPlaying) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setOmPlaying(false)
    } else {
      audioRef.current.play()
        .then(() => {
          setOmPlaying(true)
        })
        .catch((error) => {
          console.error("Audio playback failed:", error)
        })
    }
  }

  const stopOm = () => {
    if (!audioRef.current) return
    audioRef.current.pause()
    audioRef.current.currentTime = 0
    setOmPlaying(false)
  }

  /* ── BREATHING ENGINE ── */
  const startSession = () => {
    setIsActive(true)
    setCurrentBreath(0)
    setShowReflection(false)
    runCycle()
  }

  const runCycle = () => {
    const runPhase = (
      p: "inhale" | "hold" | "exhale",
      duration: number,
      next?: () => void
    ) => {
      setPhase(p)
      setTimeLeft(duration)
      countdownRef.current = setInterval(
        () => setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0)),
        1000
      )
      timerRef.current = setTimeout(() => {
        if (countdownRef.current) clearInterval(countdownRef.current)
        if (next) next()
      }, duration * 1000)
    }

    runPhase("inhale", selectedPattern.inhale, () => {
      runPhase("hold", selectedPattern.hold, () => {
        runPhase("exhale", selectedPattern.exhale, () => {
          setCurrentBreath((prev) => {
            const next = prev + 1
            if (next >= breathCount) {
              setIsActive(false)
              setShowReflection(true)
              setPhase("idle")
              stopOm()
              if (onSessionComplete) onSessionComplete()
              return next
            }
            runCycle()
            return next
          })
        })
      })
    })
  }

  const resetSession = () => {
    setIsActive(false)
    setPhase("idle")
    setCurrentBreath(0)
    setShowReflection(false)
    if (timerRef.current)     clearTimeout(timerRef.current)
    if (countdownRef.current) clearInterval(countdownRef.current)
    stopOm()
  }

  /* ── CLEANUP ── */
  useEffect(() => {
    return () => {
      if (timerRef.current)     clearTimeout(timerRef.current)
      if (countdownRef.current) clearInterval(countdownRef.current)
    }
  }, [])

  const isSettingsLocked = isActive

  /* ────────────────────── RENDER ────────────────────── */
  return (
    <div
      /* FIXED: Changed 'min-h-screen' to 'w-full flex flex-col items-center' 
         so it gracefully snaps right below your navigation layouts. */
      className="w-full flex flex-col items-center justify-start p-2 md:p-4"
      suppressHydrationWarning
    >
      {/* Hidden audio element */}
      <audio 
        ref={audioRef} 
        src="/Music/om.mp3" 
        preload="auto" 
        loop 
      />

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes custom-pulse {
          0%, 100% { transform: scale(1); }
          50%       { transform: scale(1.08); }
        }
        .breathing-active { animation: custom-pulse 8s ease-in-out infinite; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      ` }} />

      <div className="bg-white rounded-[40px] md:rounded-[50px] w-full max-w-[900px] py-8 md:py-10 px-3 md:px-10 flex flex-col items-center overflow-hidden relative shadow-sm border border-neutral-100/40">

        {/* HEADER */}
        <div className="text-center mb-6">
          <h2 className="text-lg md:text-xl font-bold text-neutral-500 mb-1">
            Breathe with intention.
          </h2>
          <p className="text-[11px] md:text-sm text-neutral-400">
            A guided breathing experience designed to reset your nervous system.
          </p>
        </div>

        {/* PATTERN SELECT */}
        <div className="flex justify-center gap-1.5 md:gap-3 mb-8 w-full max-w-full overflow-x-auto no-scrollbar">
          {patterns.map((pattern, idx) => {
            const isChosen = selectedPattern === pattern
            return (
              <button
                key={idx}
                disabled={isSettingsLocked}
                onClick={() => setSelectedPattern(pattern)}
                className={cn(
                  "whitespace-nowrap text-[9px] md:text-[12px] py-2 md:py-2.5 px-3 md:px-8 rounded-full border transition-all flex-shrink-0",
                  isChosen
                    ? "bg-[#C7D2FE] border-transparent text-white"
                    : "bg-white border-neutral-200 text-neutral-400 hover:bg-neutral-50",
                  isSettingsLocked && "opacity-30 cursor-not-allowed"
                )}
              >
                {pattern.name} ({pattern.pattern})
              </button>
            )
          })}
        </div>

        {/* BREATH COUNT */}
        <div className={cn(
          "flex items-center gap-4 md:gap-6 mb-8 transition-opacity",
          isSettingsLocked ? "opacity-30" : "opacity-100"
        )}>
          <button
            disabled={isSettingsLocked}
            onClick={() => setBreathCount((p) => Math.max(1, p - 1))}
            className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-xl border border-neutral-200 text-neutral-400 hover:bg-neutral-50 disabled:cursor-not-allowed cursor-pointer"
          >-</button>
          <span className="text-xs md:text-sm font-bold text-neutral-600">
            {breathCount} Breaths
          </span>
          <button
            disabled={isSettingsLocked}
            onClick={() => setBreathCount((p) => p + 1)}
            className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-xl border border-neutral-200 text-neutral-400 hover:bg-neutral-50 disabled:cursor-not-allowed cursor-pointer"
          >+</button>
        </div>

        {/* BREATHING CIRCLE */}
        <div className="relative w-full flex flex-col items-center justify-center mb-10 overflow-visible min-h-[220px] md:min-h-[280px]">
          <div className={cn(
            "relative z-10 transition-transform duration-[4000ms] ease-in-out",
            (isActive || omPlaying) ? "breathing-active" : "scale-100"
          )}>
            <div className="w-[200px] h-[200px] md:w-[260px] md:h-[260px] relative rounded-full overflow-hidden">
              <Image
                src="/meditation.png"
                alt="Meditation"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 200px, 260px"
                priority
              />
            </div>
          </div>

          {/* Counter overlay */}
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none translate-y-13 md:translate-y-22">
            <div className="text-4xl md:text-xl font-bold text-white drop-shadow">
              {currentBreath}/{breathCount}
            </div>
            <div className="text-[10px] md:text-xs font-bold text-white uppercase tracking-[0.3em] md:tracking-[0.5em] mt-1 drop-shadow">
              {isActive
                ? `${phase} ${timeLeft}s`
                : phase === "idle" ? "READY" : "DONE!"}
            </div>
          </div>
        </div>

        {/* CONTROLS */}
        <div className="flex flex-col items-center gap-3 w-full max-w-[280px] md:max-w-xs">

          {/* OM button */}
          <button
            onClick={toggleOmSound}
            className="w-full flex items-center justify-center gap-2 bg-white border border-neutral-100 rounded-2xl py-4 md:py-6 transition-all hover:bg-neutral-50 cursor-pointer"
          >
            <div className="w-6 h-6 md:w-8 md:h-8 flex items-center justify-center bg-amber-50 rounded-full">
              <Image src="/image.png" alt="Ohm" width={20} height={20} className="w-4 h-4 md:w-5 md:h-5" />
            </div>
            <span className="text-lg md:text-xl font-bold text-neutral-700">
              {omPlaying ? "Stop Ohm" : "Play Ohm"}
            </span>
          </button>

          {/* Start / Stop */}
          {!showReflection && (
            <button
              onClick={isActive ? resetSession : startSession}
              className="w-full py-4 rounded-2xl md:rounded-3xl text-white font-bold text-xs md:text-sm active:scale-95 transition-all uppercase tracking-widest cursor-pointer"
              style={{ background: "linear-gradient(to right, #6D7EB3, #7FB1E9)" }}
            >
              {isActive ? "Stop Session" : "Start Session"}
            </button>
          )}
        </div>

        {/* REFLECTION */}
        {showReflection && (
          <div className="mt-10 w-full max-w-xl">
            <ReflectionPrompt onClose={resetSession} />
          </div>
        )}

      </div>
    </div>
  )
}

/* ─── REFLECTION COMOPONENT (Preserved) ─── */
function ReflectionPrompt({ onClose }: { onClose: () => void }) {
  const [displayGitaView, setDisplayGitaView] = useState(false)

  return (
    <>
      {displayGitaView ? (
        <div>
          <DailyGitaWisdom onReflectionSubmit={() => setDisplayGitaView(false)} />
          <button
            onClick={onClose}
            className="text-xs text-neutral-400 underline mt-4 cursor-pointer"
          >
            Continue to home
          </button>
        </div>
      ) : (
        <div className="bg-[#F5F5F5] rounded-[32px] p-8 flex flex-col items-center text-center shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h3 className="text-[#4A4A4A] text-[16px] md:text-[18px] font-medium mb-1">
            Session Complete
          </h3>
          <p className="text-[#8E8E8E] text-[11px] md:text-[12px] mb-8 leading-relaxed">
            Notice how your body feels.
          </p>
          <div className="flex flex-wrap justify-center gap-3 w-full">
            <button
              onClick={() => setDisplayGitaView(true)}
              className="bg-[#E9B87D] text-white px-6 py-2.5 rounded-full text-[12px] md:text-[13px] font-medium hover:bg-[#dfa96b] transition-all shadow-sm cursor-pointer"
            >
              Explore Gita Wisdom
            </button>
            <button
              onClick={onClose}
              className="border border-[#D1C7BD] text-[#7A7A7A] px-6 py-2.5 rounded-full text-[12px] md:text-[13px] font-medium hover:bg-[#ebe5df] transition-all cursor-pointer"
            >
              Skip for now
            </button>
          </div>
        </div>
      )}
    </>
  )
}