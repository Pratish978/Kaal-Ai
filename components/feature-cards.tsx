"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
  href: string
  buttonText?: string
}

function FeatureCard({ icon, title, description, href, buttonText = "Start" }: FeatureCardProps) {
  const router = useRouter()

  return (
    <div className="bg-white px-8 py-8 rounded-[2rem] shadow-lg shadow-gray-200/50 border border-gray-100 flex flex-col items-start">

      {/* Icon */}
      <div className="mb-4">
        {icon}
      </div>

      {/* Title */}
      <h3 className="font-bold text-[#333] text-lg mb-2 tracking-tight">
        {title}
      </h3>

      {/* Description */}
      <p className="font-serif text-[15px] text-gray-400 mb-6 leading-snug min-h-[60px]">
        {description}
      </p>

      {/* Button — first file's Link/href logic preserved */}
      <button
        onClick={() => router.push(href)}
        className="w-full bg-[#E9B666] hover:bg-[#dfa755] text-white py-3 rounded-full font-bold text-base transition-colors shadow-sm active:scale-95 cursor-pointer"
      >
        {buttonText}
      </button>

    </div>
  )
}

export function FeatureCards() {
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

      {/* Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((feature) => (
          <FeatureCard key={feature.title} {...feature} />
        ))}
      </div>

    </section>
  )
}