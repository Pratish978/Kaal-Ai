"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, usePathname } from "next/navigation"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ArrowLeft, LogOut, User, Sparkles, Menu, X, History, Crown, CalendarCheck } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import AuthModal from "./login-modal"

interface NavbarProps {
  showBackButton?: boolean
  customBackAction?: () => void
  forceLogo?: boolean
}

export function Navbar({ showBackButton = false, customBackAction, forceLogo = false }: NavbarProps) {
  const pathname = usePathname()
  const router = useRouter()
  
  const shouldShowLogo = (pathname === "/" || forceLogo) && !showBackButton

  const { user, isLoggedIn, logout } = useAuth()
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  // Fix: Corrected logic for premium check
  const isTargetPremiumUser = isLoggedIn && user && (user.email === "bhonglepratish@gmail.com" || user.email === "piyu232004@gmail.com");

  const handleBackNavigation = () => {
    if (customBackAction) {
      customBackAction()
    } else {
      router.back()
    }
  }

  const handleMobileNavigate = (path: string) => {
    router.push(path)
    setTimeout(() => {
      setIsMobileOpen(false)
    }, 100)
  }

  return (
    <>
      <header className="relative flex items-center justify-between px-4 md:px-16 py-4 md:py-6 bg-transparent w-full z-[200]">

        {/* ── LEFT SIDE ── */}
        <div className="flex flex-1 items-center gap-2 z-10">
          {shouldShowLogo && (
            <button
              className="md:hidden text-gray-800 bg-transparent border-none cursor-pointer p-1 -ml-1"
              onClick={() => setIsMobileOpen(true)}
            >
              <Menu className="w-7 h-7" />
            </button>
          )}

          <div className="flex items-center gap-2">
            {!shouldShowLogo ? (
              <button
                onClick={handleBackNavigation}
                className="flex items-center gap-2 text-[#333333] hover:opacity-70 transition-opacity group bg-transparent border-none cursor-pointer p-1"
              >
                <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
                <span className="text-xs font-bold uppercase tracking-widest hidden sm:inline-block">Back</span>
              </button>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link href="/" className="flex items-center gap-2">
                  <KaalLogo />
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* ── CENTER LOGO ── */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none md:hidden">
          <Link href="/">
            <div className="relative w-20 h-8">
              <Image src="/kaal-logo.png" alt="KAAL AI" fill sizes="80px" className="object-contain" priority />
            </div>
          </Link>
        </div>

        {/* ── RIGHT SIDE ── */}
        <div className="flex flex-1 justify-end items-center gap-2 z-10">
          {isLoggedIn && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 outline-none group bg-transparent border-none cursor-pointer relative">
                  <span className={`hidden sm:block text-sm transition-colors ${isTargetPremiumUser ? 'text-amber-700/90 font-semibold italic' : 'text-gray-600 group-hover:text-black'}`}>
                    Hi, {user.name}
                  </span>
                  <div className={`p-0.5 rounded-full transition-all duration-300 group-hover:scale-105 ${isTargetPremiumUser ? 'bg-gradient-to-tr from-amber-500 via-yellow-200 to-amber-600 shadow-lg shadow-amber-500/30' : ''}`}>
                    <Avatar className="h-9 w-9 border border-white">
                      <AvatarFallback className={`${isTargetPremiumUser ? 'bg-gradient-to-br from-amber-50 to-orange-100 text-amber-600 font-extrabold' : 'bg-[#E9B87D] text-white font-bold'} text-sm`}>
                        {user.initial || user.name?.charAt(0).toUpperCase() || "B"}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  {isTargetPremiumUser && (
                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white p-0.5 rounded-full border border-white shadow-md">
                      <Crown className="w-2.5 h-2.5 fill-current" />
                    </span>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 backdrop-blur-xl rounded-2xl shadow-2xl py-4 px-2 bg-white/95">
                {/* ... (Dropdown items remain the same) ... */}
                <DropdownMenuItem onSelect={() => router.push("/profile")}>Profile</DropdownMenuItem>
                <DropdownMenuItem onSelect={logout}>Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            /* FIXED: Wrapped in hidden md:flex so it disappears on small screens */
            <div className="hidden md:flex items-center gap-6">
              <Link href="/pricing" className="text-sm font-medium text-gray-500 hover:text-black transition-colors flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5 text-amber-500" /> Pricing
              </Link>
              <button
                onClick={() => setShowLoginModal(true)}  
                className="text-sm font-medium text-gray-600 hover:text-black tracking-widest hover:underline underline-offset-8 transition-colors cursor-pointer bg-transparent border-none"
              >
                Log in
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ... (Mobile Drawer implementation remains the same) ... */}
      <AuthModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </>
  )
}

function KaalLogo() {
  return (
    <div className="relative w-28 h-10">
      <Image src="/kaal-logo.png" alt="KAAL AI" fill sizes="112px" className="object-contain rounded-sm" priority />
    </div>
  )
}