"use client"

import { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { Crown, Sparkles } from "lucide-react"
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
  isPremium?: boolean // Premium pipeline hook integrated cleanly
}

const patterns: BreathingPattern[] = [
  { name: "Gentle", pattern: "4-4-4", inhale: 4, hold: 4, exhale: 4 },
  { name: "Deep",   pattern: "5-5-8", inhale: 5, hold: 5, exhale: 8 },
  { name: "Power",  pattern: "4-7-8", inhale: 4, hold: 7, exhale: 8 },
]

export function BreathingExercise({ onSessionComplete, isPremium = false }: BreathingExerciseProps) {

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

      <div 
        className={cn(
          "rounded-[40px] md:rounded-[50px] w-full max-w-[900px] py-8 md:py-10 px-3 md:px-10 flex flex-col items-center overflow-hidden relative shadow-sm border transition-all duration-700",
          isPremium 
            ? "bg-gradient-to-b from-white to-[#F9F6F0] border-amber-500/20 shadow-[0_4px_30px_rgba(233,185,110,0.05)]" 
            : "bg-white border-neutral-100/40"
        )}
      >
        {/* Micro Golden Backdrop Glow Filter Loop strictly for Premium Seekers */}
        {isPremium && (
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-72 h-40 bg-gradient-to-b from-amber-400/5 to-transparent blur-2xl pointer-events-none rounded-full" />
        )}

        {/* HEADER */}
        <div className="text-center mb-6 relative z-10">
          <h2 className={cn(
            "text-lg md:text-xl font-bold mb-1 flex items-center justify-center gap-1.5",
            isPremium ? "text-stone-700" : "text-neutral-500"
          )}>
            {isPremium && <Crown className="w-4 h-4 text-amber-500 fill-amber-500/10 shrink-0" />}
            Breathe with intention.
          </h2>
          <p className={cn(
            "text-[11px] md:text-sm",
            isPremium ? "text-stone-400 font-serif italic" : "text-neutral-400"
          )}>
            A guided breathing experience designed to reset your nervous system.
          </p>
        </div>

        {/* PATTERN SELECT */}
        <div className="flex justify-center gap-1.5 md:gap-3 mb-8 w-full max-w-full overflow-x-auto no-scrollbar relative z-10">
          {patterns.map((pattern, idx) => {
            const isChosen = selectedPattern === pattern
            return (
              <button
                key={idx}
                disabled={isSettingsLocked}
                onClick={() => setSelectedPattern(pattern)}
                className={cn(
                  "whitespace-nowrap text-[9px] md:text-[12px] py-2 md:py-2.5 px-3 md:px-8 rounded-full border transition-all flex-shrink-0 font-medium",
                  isChosen
                    ? isPremium 
                      ? "bg-gradient-to-r from-[#E9B96E] to-[#d4a55d] border-transparent text-white shadow-sm font-bold"
                      : "bg-[#C7D2FE] border-transparent text-white"
                    : isPremium
                      ? "bg-white border-amber-500/10 text-stone-500 hover:bg-amber-500/[0.02]"
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
          "flex items-center gap-4 md:gap-6 mb-8 transition-opacity relative z-10",
          isSettingsLocked ? "opacity-30" : "opacity-100"
        )}>
          <button
            disabled={isSettingsLocked}
            onClick={() => setBreathCount((p) => Math.max(1, p - 1))}
            className={cn(
              "w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-xl border text-neutral-400 transition-colors disabled:cursor-not-allowed cursor-pointer font-bold",
              isPremium ? "border-amber-500/10 hover:bg-amber-500/5 text-amber-700" : "border-neutral-200 hover:bg-neutral-50"
            )}
          >-</button>
          <span className={cn(
            "text-xs md:text-sm font-bold",
            isPremium ? "text-stone-600 tracking-wide" : "text-neutral-600"
          )}>
            {breathCount} Breaths
          </span>
          <button
            disabled={isSettingsLocked}
            onClick={() => setBreathCount((p) => p + 1)}
            className={cn(
              "w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-xl border text-neutral-400 transition-colors disabled:cursor-not-allowed cursor-pointer font-bold",
              isPremium ? "border-amber-500/10 hover:bg-amber-500/5 text-amber-700" : "border-neutral-200 hover:bg-neutral-50"
            )}
          >+</button>
        </div>

        {/* BREATHING CIRCLE */}
        <div className="relative w-full flex flex-col items-center justify-center mb-10 overflow-visible min-h-[220px] md:min-h-[280px]">
          
          {/* Ambient Background Radial Wave Aura Ring exclusively for Premium Accounts */}
          {isPremium && isActive && (
            <div 
              className={cn(
                "absolute inset-0 m-auto rounded-full border border-amber-400/20 bg-amber-500/[0.01] blur-sm transition-all ease-in-out pointer-events-none",
                phase === "inhale" && "w-[280px] h-[280px] md:w-[360px] md:h-[360px] duration-[4000ms] scale-105 opacity-100",
                phase === "hold" && "w-[260px] h-[260px] md:w-[320px] md:h-[320px] duration-[1000ms] scale-100 opacity-60",
                phase === "exhale" && "w-[220px] h-[220px] md:w-[280px] md:h-[280px] duration-[4000ms] scale-95 opacity-20",
                phase === "idle" && "w-0 h-0 opacity-0"
              )}
            />
          )}

          <div className={cn(
            "relative z-10 transition-transform duration-[4000ms] ease-in-out",
            (isActive || omPlaying) ? "breathing-active" : "scale-100"
          )}>
            <div className={cn(
              "w-[200px] h-[200px] md:w-[260px] md:h-[260px] relative rounded-full overflow-hidden transition-all duration-500",
              isPremium ? "border-2 border-amber-500/20 shadow-lg shadow-amber-500/5" : ""
            )}>
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
            <div className="text-4xl md:text-xl font-bold text-white drop-shadow font-sans">
              {currentBreath}/{breathCount}
            </div>
            <div className="text-[10px] md:text-xs font-bold text-white uppercase tracking-[0.3em] md:tracking-[0.5em] mt-1 drop-shadow flex items-center gap-1">
              {isActive && isPremium && phase === "inhale" && <Sparkles className="w-3 h-3 text-amber-300 animate-pulse fill-current" />}
              {isActive
                ? `${phase} ${timeLeft}s`
                : phase === "idle" ? "READY" : "DONE!"}
            </div>
          </div>
        </div>

        {/* CONTROLS */}
        <div className="flex flex-col items-center gap-3 w-full max-w-[280px] md:max-w-xs relative z-10">

          {/* OM button */}
          <button
            onClick={toggleOmSound}
            className={cn(
              "w-full flex items-center justify-center gap-2 border rounded-2xl py-4 md:py-6 transition-all cursor-pointer shadow-2xs",
              isPremium 
                ? "bg-white border-amber-500/10 hover:bg-amber-500/[0.02]" 
                : "bg-white border-neutral-100 hover:bg-neutral-50"
            )}
          >
            <div className={cn(
              "w-6 h-6 md:w-8 md:h-8 flex items-center justify-center rounded-full transition-colors",
              isPremium ? "bg-amber-500/10 text-amber-700" : "bg-amber-50"
            )}>
              <Image src="/image.png" alt="Ohm" width={20} height={20} className="w-4 h-4 md:w-5 md:h-5" />
            </div>
            <span className={cn(
              "text-lg md:text-xl font-bold",
              isPremium ? "text-stone-700 tracking-tight" : "text-neutral-700"
            )}>
              {omPlaying ? "Stop Ohm" : "Play Ohm"}
            </span>
          </button>

          {/* Start / Stop */}
          {!showReflection && (
            <button
              onClick={isActive ? resetSession : startSession}
              className="w-full py-4 rounded-2xl md:rounded-3xl text-white font-bold text-xs md:text-sm active:scale-95 transition-all uppercase tracking-widest cursor-pointer shadow-md"
              style={{ 
                background: isPremium 
                  ? "linear-gradient(to right, #E9B96E, #d4a55d)" 
                  : "linear-gradient(to right, #6D7EB3, #7FB1E9)" 
              }}
            >
              {isActive ? "Stop Session" : "Start Session"}
            </button>
          )}
        </div>

        {/* REFLECTION */}
        {showReflection && (
          <div className="mt-10 w-full max-w-xl relative z-10">
            <ReflectionPrompt onClose={resetSession} isPremium={isPremium} />
          </div>
        )}

      </div>
    </div>
  )
}

/* ─── REFLECTION COMPONENT (Preserved) ─── */
function ReflectionPrompt({ onClose, isPremium }: { onClose: () => void; isPremium: boolean }) {
  const [displayGitaView, setDisplayGitaView] = useState(false)

  return (
    <>
      {displayGitaView ? (
        <div className="animate-in fade-in duration-300">
          <DailyGitaWisdom onReflectionSubmit={() => setDisplayGitaView(false)} />
          <button
            onClick={onClose}
            className="text-xs text-neutral-400 underline mt-4 cursor-pointer block mx-auto hover:text-neutral-600 transition-colors"
          >
            Continue to home
          </button>
        </div>
      ) : (
        <div 
          className={cn(
            "rounded-[32px] p-8 flex flex-col items-center text-center shadow-xs border animate-in fade-in slide-in-from-bottom-4 duration-500",
            isPremium 
              ? "bg-[#FAF8F5] border-amber-500/10 shadow-sm" 
              : "bg-[#F5F5F5] border-transparent"
          )}
        >
          <h3 className={cn(
            "text-[16px] md:text-[18px] font-semibold mb-1",
            isPremium ? "text-stone-700 font-serif" : "text-[#4A4A4A]"
          )}>
            Session Complete
          </h3>
          <p className="text-[#8E8E8E] text-[11px] md:text-[12px] mb-8 leading-relaxed">
            Notice how your body feels.
          </p>
          <div className="flex flex-wrap justify-center gap-3 w-full">
            <button
              onClick={() => setDisplayGitaView(true)}
              className={cn(
                "px-6 py-2.5 rounded-full text-[12px] md:text-[13px] font-bold tracking-wide text-white transition-all shadow-sm cursor-pointer",
                isPremium 
                  ? "bg-gradient-to-r from-[#E9B96E] to-[#d4a55d] hover:brightness-105 uppercase" 
                  : "bg-[#E9B87D] hover:bg-[#dfa96b]"
              )}
            >
              Explore Gita Wisdom
            </button>
            <button
              onClick={onClose}
              className={cn(
                "px-6 py-2.5 rounded-full text-[12px] md:text-[13px] font-medium transition-all cursor-pointer border",
                isPremium 
                  ? "border-amber-500/20 text-stone-500 bg-white hover:bg-amber-500/[0.02]" 
                  : "border-[#D1C7BD] text-[#7A7A7A] hover:bg-[#ebe5df]"
              )}
            >
              Skip for now
            </button>
          </div>
        </div>
      )}
    </>
  )
}