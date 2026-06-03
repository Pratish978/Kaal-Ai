"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context" // Auth state sync karne ke liye loop include kiya
import { Crown } from "lucide-react"
import { cn } from "@/lib/utils"

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
  href: string
  buttonText?: string
  isPremium: boolean // Premium state toggle control forward pipeline
}

function FeatureCard({ 
  icon, 
  title, 
  description, 
  href, 
  buttonText = "Start", 
  isPremium 
}: FeatureCardProps) {
  const router = useRouter()

  return (
    <div 
      className={cn(
        "px-8 py-8 rounded-[2rem] border transition-all duration-500 flex flex-col items-start relative overflow-hidden h-full",
        isPremium 
          ? "bg-gradient-to-b from-white to-[#FAF8F5] shadow-xl shadow-amber-500/[0.02] border-amber-500/20" 
          : "bg-white shadow-lg shadow-gray-200/50 border-gray-100"
      )}
    >
      {/* Decorative top micro border loop strictly for active premium users */}
      {isPremium && (
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-400 via-amber-200 to-amber-600" />
      )}

      {/* Icon Wrapper with luxury smooth token backdrop container */}
      <div 
        className={cn(
          "mb-4 p-2 rounded-2xl transition-all duration-300",
          isPremium ? "bg-amber-500/5 shadow-inner" : ""
        )}
      >
        {icon}
      </div>

      {/* Title */}
      <h3 className="font-bold text-[#333] text-lg mb-2 tracking-tight flex items-center gap-1.5">
        {title}
        {isPremium && (
          <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-500/10 shrink-0" />
        )}
      </h3>

      {/* Description */}
      <p 
        className={cn(
          "font-serif text-[15px] mb-6 leading-snug min-h-[60px]",
          isPremium ? "text-stone-500" : "text-gray-400"
        )}
      >
        {description}
      </p>

      {/* Button — Dynamic premium design injecting the functional click/href matrix */}
      <button
        onClick={() => router.push(href)}
        className={cn(
          "w-full py-3 rounded-full font-bold text-base transition-all shadow-sm active:scale-95 cursor-pointer border-none text-white",
          isPremium 
            ? "bg-gradient-to-r from-[#E9B666] to-[#dfa755] hover:brightness-105 font-black uppercase tracking-wider text-xs shadow-md shadow-amber-500/[0.08]"
            : "bg-[#E9B666] hover:bg-[#dfa755]"
        )}
      >
        {isPremium ? title : buttonText}
      </button>

    </div>
  )
}

export function FeatureCards() {
  const { isLoggedIn, user } = useAuth()

  // STRICT SYSTEM TESTING RULE: Dual bang conversion strictly ensures a clean boolean primitive matrix output
  const isPremium = !!(isLoggedIn && user && (
    user.email === "bhonglepratish@gmail.com" ||
    user?.premium === true || 
    user?.plan === "founding" || 
    user?.plan === "plus" ||
    user?.plan === "annual"
  ));

  // ── First file's data (routes, titles, descriptions) — untouched ──
  const features = [
    {
      icon: <img src="/Home1.png" alt="Meditation" className="w-10 h-10 object-contain" />,
      title: "Meditation",
      description: "Take a few gentle minutes to settle your thoughts and body.",
      href: "/meditation",
    },
    {
      icon: <img src="/Home2.png" alt="Reflect & Connect" className="w-10 h-10 object-contain" />,
      title: "Reflect & Connect",
      description: "Understand yourself better through guided reflections and connect with support.",
      href: "/reflection",
    },
    {
      icon: <img src="/Home3.png" alt="Events" className="w-10 h-10 object-contain" />,
      title: "Events",
      description: "Explore upcoming community events and wellness sessions.",
      href: "/events",
    },
  ]

  return (
    <section className="py-10 px-6">

      {/* Subtitle */}
      <p className="text-center text-[11px] md:text-sm text-gray-600 italic mb-10 max-w-xs mx-auto md:max-w-none leading-relaxed">
        If you&apos;d like additional support, these options are available.
      </p>

      {/* Grid wrapper architecture */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((feature) => (
          <FeatureCard 
            key={feature.title} 
            {...feature} 
            isPremium={isPremium} // Now guaranteed to be a solid boolean type primitive
          />
        ))}
      </div>

    </section>
  )
}