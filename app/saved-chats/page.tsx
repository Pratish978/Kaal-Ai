"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"

export default function SavedChatsPage() {

  const router = useRouter()

  useEffect(() => {
    router.replace("/chat")
  }, [router])

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <Navbar showBackButton />

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <p className="text-sm text-muted-foreground">
          Redirecting...
        </p>
      </div>
    </main>
  )
}
