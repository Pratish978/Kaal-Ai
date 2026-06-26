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
  
  // Render desktop-specific conditional rendering logic
  const shouldShowLogo = (pathname === "/" || forceLogo) && !showBackButton

  const { user, isLoggedIn, logout } = useAuth()
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isPremium, setIsPremium] = useState(false)

  // Baseline database/localStorage check logic remains running fine in background
  useEffect(() => {
    if (typeof window !== "undefined") {
      const premiumStatus = localStorage.getItem("kaal_premium") === "true"
      setIsPremium(premiumStatus)
    }
  }, [user, isLoggedIn])

  // STRICT TESTING RULE: Only your exact email gets premium layout token override
  const isTargetPremiumUser = isLoggedIn && user && user.email === "bhonglepratish@gmail.com";

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
      {/* ───────────────────────── HEADER ───────────────────────── */}
      <header className="relative flex items-center justify-between px-4 md:px-16 py-4 md:py-6 bg-transparent w-full z-[200]">

        {/* ── LEFT SIDE ── */}
        <div className="flex flex-1 items-center gap-2 z-10">

          {/* Mobile hamburger — visible when logo setup requires drawer support */}
          {shouldShowLogo && (
            <button
              className="md:hidden text-gray-800 bg-transparent border-none cursor-pointer p-1 -ml-1"
              onClick={() => setIsMobileOpen(true)}
            >
              <Menu className="w-7 h-7" />
            </button>
          )}

          {/* Core Action Toggle Point: Back Icon vs Brand Logo */}
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

        {/* ── CENTER LOGO (Always rendered & centered on all mobile/responsive sub-views) ── */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto md:hidden">
          <Link href="/">
            <div className="relative w-20 h-8">
              <Image
                src="/kaal-logo.png"
                alt="KAAL AI"
                fill
                sizes="80px"
                className="object-contain"
                priority
              />
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
                  
                  {/* Premium Gold Glow Aura Ring ONLY for your account */}
                  <div className={`p-0.5 rounded-full transition-all duration-300 group-hover:scale-105 ${isTargetPremiumUser ? 'bg-gradient-to-tr from-amber-500 via-yellow-200 to-amber-600 shadow-lg shadow-amber-500/30' : ''}`}>
                    <Avatar className="h-9 w-9 border border-white">
                      <AvatarFallback className={`${isTargetPremiumUser ? 'bg-gradient-to-br from-amber-50 to-orange-100 text-amber-600 font-extrabold' : 'bg-[#E9B87D] text-white font-bold'} text-sm`}>
                        {user.initial || user.name?.charAt(0).toUpperCase() || "B"}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  {/* Micro Crown Token for your account */}
                  {isTargetPremiumUser && (
                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white p-0.5 rounded-full border border-white shadow-md">
                      <Crown className="w-2.5 h-2.5 fill-current" />
                    </span>
                  )}
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className={`w-64 backdrop-blur-xl rounded-2xl shadow-2xl py-4 px-2 animate-in fade-in slide-in-from-top-2 duration-200 bg-white/95 ${isTargetPremiumUser ? 'border border-amber-200/80' : 'border border-stone-200/60'}`}
              >
                {/* User Context Heading Status */}
                <div className={`px-3 py-2.5 mb-2 rounded-xl flex items-center justify-between ${isTargetPremiumUser ? 'bg-gradient-to-r from-amber-500/10 to-orange-500/5 border border-amber-200/40' : 'bg-stone-50'}`}>
                  <div className="truncate pr-2">
                    <p className={`text-xs font-bold truncate ${isTargetPremiumUser ? 'text-amber-900' : 'text-stone-800'}`}>{user.name}</p>
                    <p className={`text-[10px] truncate ${isTargetPremiumUser ? 'text-amber-700/70' : 'text-stone-400'}`}>{user.email}</p>
                  </div>
                  {isTargetPremiumUser ? (
                    <span className="px-2 py-0.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[9px] font-black uppercase tracking-wider rounded-md flex items-center gap-1 shrink-0 shadow-sm">
                      <Crown className="w-2.5 h-2.5 fill-current" /> Premium
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-stone-100 text-stone-500 text-[9px] font-medium uppercase tracking-wider rounded-md shrink-0">
                      Free Tier
                    </span>
                  )}
                </div>

                {/* PROFILE */}
                <DropdownMenuItem 
                  onSelect={() => router.push("/profile")} 
                  className={`cursor-pointer rounded-lg flex items-center text-sm font-medium ${isTargetPremiumUser ? 'text-amber-900/80 hover:text-amber-950 hover:bg-amber-500/10' : 'text-stone-600 hover:text-stone-950 hover:bg-stone-50'}`}
                >
                  <User className={`h-4 w-4 mr-2 ${isTargetPremiumUser ? 'text-amber-500' : 'text-stone-400'}`} />
                  Profile
                </DropdownMenuItem>

                {/* HISTORY */}
                <DropdownMenuItem 
                  onSelect={() => router.push("/history")} 
                  className={`cursor-pointer rounded-lg flex items-center text-sm font-medium ${isTargetPremiumUser ? 'text-amber-900/80 hover:text-amber-950 hover:bg-amber-500/10' : 'text-stone-600 hover:text-stone-950 hover:bg-stone-50'}`}
                >
                  <History className={`h-4 w-4 mr-2 ${isTargetPremiumUser ? 'text-amber-500' : 'text-stone-400'}`} />
                  History
                </DropdownMenuItem>

                <DropdownMenuSeparator className={isTargetPremiumUser ? 'bg-amber-100 my-2' : 'bg-stone-100 my-2'} />

                {/* FEATURES */}
                <div className="px-2 py-1">
                  <p className={`text-[10px] font-bold uppercase tracking-widest mb-1.5 px-1 ${isTargetPremiumUser ? 'text-amber-700/60' : 'text-stone-400'}`}>
                    Features
                  </p>
                  <div className="space-y-0.5">
                    <DropdownMenuItem 
                      onSelect={() => router.push("/meditation")} 
                      className={`cursor-pointer rounded-lg flex items-center text-sm font-medium ${isTargetPremiumUser ? 'text-amber-950 hover:bg-amber-500/10' : 'text-stone-600 hover:text-stone-950 hover:bg-stone-50'}`}
                    >
                      <Sparkles className={`h-3.5 w-3.5 mr-2 ${isTargetPremiumUser ? 'text-amber-500' : 'text-stone-400'}`} />
                      Meditation
                    </DropdownMenuItem>

                    <DropdownMenuItem 
                      onSelect={() => router.push("/reflection")} 
                      className={`cursor-pointer rounded-lg flex items-center text-sm font-medium ${isTargetPremiumUser ? 'text-amber-950 hover:bg-amber-500/10' : 'text-stone-600 hover:text-stone-950 hover:bg-stone-50'}`}
                    >
                      <Sparkles className={`h-3.5 w-3.5 mr-2 ${isTargetPremiumUser ? 'text-amber-500' : 'text-stone-400'}`} />
                      Reflect &amp; Connect
                    </DropdownMenuItem>

                    <DropdownMenuItem 
                      onSelect={() => router.push("/events")} 
                      className={`cursor-pointer rounded-lg flex items-center text-sm font-medium ${isTargetPremiumUser ? 'text-amber-950 hover:bg-amber-500/10' : 'text-stone-600 hover:text-stone-950 hover:bg-stone-50'}`}
                    >
                      <Sparkles className={`h-3.5 w-3.5 mr-2 ${isTargetPremiumUser ? 'text-amber-500' : 'text-stone-400'}`} />
                      Events
                    </DropdownMenuItem>

                    <DropdownMenuSeparator className={isTargetPremiumUser ? 'bg-amber-100/60 my-1' : 'bg-stone-100/60 my-1'} />

                    {!isTargetPremiumUser ? (
                      <DropdownMenuItem 
                        onSelect={() => router.push("/pricing")} 
                        className="cursor-pointer rounded-lg flex items-center text-sm text-amber-600 font-bold bg-amber-500/5 hover:bg-amber-500/10 mt-1"
                      >
                        <Crown className="h-3.5 w-3.5 mr-2 text-amber-500" />
                        Upgrade to Plus
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem 
                        onSelect={() => router.push("/pricing")} 
                        className="cursor-pointer rounded-lg flex items-center text-sm text-amber-700 font-bold bg-gradient-to-r from-amber-500/10 to-orange-500/10 hover:from-amber-500/20 mt-1 border border-amber-200/50"
                      >
                        <CalendarCheck className="h-3.5 w-3.5 mr-2 text-amber-600 shrink-0" />
                        Check Validity &amp; Plans
                      </DropdownMenuItem>
                    )}
                  </div>
                </div>

                <DropdownMenuSeparator className={isTargetPremiumUser ? 'bg-amber-100 my-2' : 'bg-stone-100 my-2'} />

                {/* LOGOUT */}
                <DropdownMenuItem
                  onSelect={logout}          
                  className="cursor-pointer rounded-lg flex items-center text-stone-500 hover:text-red-600 hover:bg-red-50/50"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-6">
              <Link 
                href="/pricing" 
                className="text-sm font-medium text-gray-500 hover:text-black transition-colors flex items-center gap-1.5"
              >
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

      {/* ───────────── MOBILE DRAWER ───────────── */}
      <div
        className={`
          fixed top-0 left-0 h-full w-[85%] bg-[#FBF9F6] shadow-2xl z-[300]
          transform transition-transform duration-500 ease-in-out md:hidden
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex flex-col h-full p-8">
          <button
            onClick={() => setIsMobileOpen(false)}
            className="self-end p-2 text-gray-400 cursor-pointer bg-transparent border-none"
          >
            <X className="w-8 h-8" />
          </button>

          <div className="mt-12 flex-1">
            {isLoggedIn && user ? (
              <div className="space-y-8">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Welcome back</p>
                    <h2 className={`text-3xl font-serif ${isTargetPremiumUser ? 'text-amber-900' : 'text-gray-800'}`}>Hi, {user.name}</h2>
                  </div>
                  {isTargetPremiumUser && (
                    <span className="px-3 py-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[10px] font-black uppercase tracking-wider rounded-full flex items-center gap-1 shadow-md mt-1">
                      <Crown className="w-3 h-3 fill-current" /> Premium
                    </span>
                  )}
                </div>

                <nav className="flex flex-col gap-6">
                  <button 
                    onClick={() => handleMobileNavigate("/meditation")} 
                    className={`text-left text-xl bg-transparent border-none cursor-pointer font-normal w-full flex items-center justify-between group ${isTargetPremiumUser ? 'text-amber-900/90' : 'text-gray-700'}`}
                  >
                    <span>Meditation</span>
                  </button>
                  <button 
                    onClick={() => handleMobileNavigate("/reflection")} 
                    className={`text-left text-xl bg-transparent border-none cursor-pointer font-normal w-full ${isTargetPremiumUser ? 'text-amber-900/90' : 'text-gray-700'}`}
                  >
                    Reflect &amp; Connect
                  </button>
                  <button 
                    onClick={() => handleMobileNavigate("/events")} 
                    className={`text-left text-xl bg-transparent border-none cursor-pointer font-normal w-full ${isTargetPremiumUser ? 'text-amber-900/90' : 'text-gray-700'}`}
                  >
                    Events
                  </button>
                  <button 
                    onClick={() => handleMobileNavigate("/history")} 
                    className={`text-left text-xl bg-transparent border-none cursor-pointer font-normal w-full ${isTargetPremiumUser ? 'text-amber-900/90' : 'text-gray-700'}`}
                  >
                    History
                  </button>
                  <button 
                    onClick={() => handleMobileNavigate("/profile")} 
                    className={`text-left text-xl bg-transparent border-none cursor-pointer font-normal w-full ${isTargetPremiumUser ? 'text-amber-900/90' : 'text-gray-700'}`}
                  >
                    Profile
                  </button>
                  <hr className={isTargetPremiumUser ? 'border-amber-200/60 my-2' : 'border-gray-200 my-2'} />
                  
                  {/* HIDDEN IN MOBILE DRAWER: Wrapped with 'hidden md:flex' */}
                  <div className="hidden md:flex">
                    {!isTargetPremiumUser ? (
                      <button 
                        onClick={() => handleMobileNavigate("/pricing")} 
                        className="text-left text-xl text-amber-600 bg-amber-500/5 p-3 rounded-xl border border-amber-500/10 font-bold w-full flex items-center gap-2"
                      >
                        <Crown className="w-5 h-5 text-amber-500" /> Plans &amp; Pricing
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleMobileNavigate("/pricing")} 
                        className="text-left text-xl text-amber-800 bg-gradient-to-r from-amber-50 via-orange-50/50 to-amber-100 p-4 rounded-xl border border-amber-200 shadow-sm font-bold w-full flex items-center gap-2"
                      >
                        <CalendarCheck className="w-5 h-5 text-amber-600" /> Check Validity &amp; Plans
                      </button>
                    )}
                  </div>
                </nav>
              </div>
            ) : (
              <div className="flex flex-col gap-8 items-start">
                <button
                  className="text-left text-4xl font-serif text-gray-800 bg-transparent cursor-pointer border-none"
                  onClick={() => {
                    setIsMobileOpen(false)
                    setShowLoginModal(true)
                  }}
                >
                  Log in
                </button>
                {/* HIDDEN IN MOBILE DRAWER: Wrapped with 'hidden md:flex' */}
                <div className="hidden md:flex">
                  <button 
                    onClick={() => handleMobileNavigate("/pricing")} 
                    className="text-left text-xl text-amber-600 bg-transparent border-none cursor-pointer font-bold flex items-center gap-2"
                  >
                    <Crown className="w-5 h-5 text-amber-500" /> Plans &amp; Pricing
                  </button>
                </div>
              </div>
            )}
          </div>

          {isLoggedIn && user && (
            <button
              onClick={() => {
                logout()
                setIsMobileOpen(false)
              }}
              className="flex items-center gap-2 text-red-500 font-bold text-sm tracking-widest cursor-pointer mt-auto border-none bg-transparent"
            >
              <LogOut size={18} /> LOGOUT
            </button>
          )}
        </div>
      </div>

      {/* Drawer backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[250] md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <AuthModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </>
  )
}

/* ─────────────────────── LOGO ─────────────────────── */
function KaalLogo() {
  return (
    <div className="relative w-28 h-10">
      <Image
        src="/kaal-logo.png"
        alt="KAAL AI"
        fill
        sizes="112px"
        className="object-contain rounded-sm"
        priority
      />
    </div>
  )
}