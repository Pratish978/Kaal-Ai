"use client"

import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { FeatureCards } from "@/components/feature-cards"

export default function HomePage() {
  const router = useRouter()

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

      {/* Hero Section — second file's UI */}
      <section className="grow flex justify-center px-4 py-10 md:py-12">
        <div className="bg-[#F6F2ED] max-w-2xl w-full rounded-[30px] md:rounded-[40px] p-6 md:p-12 text-center shadow-inner relative overflow-hidden h-fit">

          <h1 className="text-3xl md:text-4xl font-serif text-gray-800 mt-10 md:mt-12 mb-6 md:mb-10 px-2 leading-tight">
            How are you feeling right now?
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
            {/* First file's handler wired to second file's button */}
            <button
              onClick={handleStartConversation}
              className="w-full md:w-auto bg-[#E9B96E] hover:bg-[#d4a55d] text-white px-10 py-3.5 rounded-full font-medium shadow-md transition cursor-pointer active:scale-95"
            >
              Start conversation
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