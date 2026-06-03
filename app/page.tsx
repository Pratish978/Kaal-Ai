"use client"

import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { FeatureCards } from "@/components/feature-cards"
import { useAuth } from "@/contexts/auth-context" // Authenticate state lane ke liye import kiya
import { Crown, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

export default function HomePage() {
  const router = useRouter()
  const { isLoggedIn, user } = useAuth()

  // STRICT PREMIUM USER CHECK (Synced with your testing profile & bypass rules)
  const isPremium = isLoggedIn && user && (
    user.email === "bhonglepratish@gmail.com" ||
    user?.premium === true || 
    user?.plan === "founding" || 
    user?.plan === "plus" ||
    user?.plan === "annual"
  );

  // ── First file's logic (updated to enforce New Chat rule) ──
  const handleStartConversation = () => {
    // DESTROY old session to guarantee a fresh MongoDB document
    localStorage.removeItem("kaal_session")
    router.push("/chat")
  }

  return (
    <main className="min-h-screen bg-[#FBF9F6] flex flex-col">

      {/* First file's Navbar — unchanged */}
      <Navbar />

      {/* Hero Section — Enhanced with conditional premium layout wrapper */}
      <section className="grow flex justify-center px-4 py-10 md:py-12">
        <div 
          className={cn(
            "bg-[#F6F2ED] max-w-2xl w-full rounded-[30px] md:rounded-[40px] p-6 md:p-12 text-center relative overflow-hidden h-fit transition-all duration-500",
            isPremium 
              ? "border-2 border-[#E9B96E]/40 shadow-[0_0_40px_rgba(233,185,110,0.15)] shadow-inner" 
              : "shadow-inner"
          )}
        >
          {/* Subtle Golden Glow / Sparks Background Decoration for Premium */}
          {isPremium && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-[#E9B96E] to-transparent opacity-60" />
          )}

          {/* Premium Badge Component */}
          {isPremium && (
            <div className="absolute top-4 right-4 md:top-6 md:right-8 animate-in fade-in slide-in-from-top-3 duration-700">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#E9B96E]/15 text-[#bd8d43] text-[10px] md:text-[11px] font-black uppercase tracking-widest rounded-full border border-[#E9B96E]/30 shadow-sm">
                <Crown className="w-3 h-3 fill-current" />
              </span>
            </div>
          )}

          <h1 className="text-3xl md:text-4xl font-serif text-gray-800 mt-10 md:mt-12 mb-6 md:mb-10 px-2 leading-tight">
            {isPremium ? (
              <span className="flex flex-col items-center justify-center gap-2">
                <span className="inline-flex items-center gap-2 text-xs font-sans text-[#E9B96E] font-bold uppercase tracking-[0.2em] mb-1">
                  <Sparkles className="w-3.5 h-3.5 fill-current" /> Welcome Back
                </span>
                How are you feeling right now?
              </span>
            ) : (
              "How are you feeling right now?"
            )}
          </h1>

          <p className="text-gray-400 text-xs md:text-sm mb-8 md:mb-10 italic">
            (Take a moment, there's no rush.)
          </p>

          <div className="space-y-4 mb-8 md:mb-10 text-gray-500 text-xs md:text-sm px-4">
            <p>
              You can take your time.<br className="hidden md:block" />
              This is a safe, calm space to talk freely.
            </p>
          </div>

          <div className="px-4">
            {/* First file's handler wired to second file's button — enhanced dynamic UI */}
            <button
              onClick={handleStartConversation}
              className={cn(
                "w-full md:w-auto px-10 py-3.5 rounded-full font-medium transition cursor-pointer active:scale-95 text-white shadow-md",
                isPremium 
                  ? "bg-gradient-to-r from-[#E9B96E] to-[#d4a55d] hover:brightness-105 hover:shadow-lg hover:shadow-[#E9B96E]/20 font-bold uppercase tracking-wider text-xs md:text-sm"
                  : "bg-[#E9B96E] hover:bg-[#d4a55d]"
              )}
            >
              {isPremium ? "Start Conversation" : "Start conversation"}
            </button>
          </div>

          <div className="mt-10 md:mt-16 mb-4 md:mb-8 text-[9px] md:text-[12px] text-gray-400 leading-tight tracking-widest px-6">
            KAAL AI is not a doctor.<br />
            It listens with care and may suggest professional help when needed.
          </div>

        </div>
      </section>

      {/* First file's FeatureCards — kept as-is */}
      <FeatureCards />

    </main>
  )
}