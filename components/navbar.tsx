"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, usePathname } from "next/navigation"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ArrowLeft, LogOut, User, Sparkles, Menu, X, History } from "lucide-react"
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

  const handleBackNavigation = () => {
    if (customBackAction) {
      customBackAction()
    } else {
      router.back()
    }
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

          {/* Core Action Toggle Point: Back Icon vs Brand Logo Logo */}
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
                <button className="flex items-center gap-3 outline-none group bg-transparent border-none cursor-pointer">
                  <span className="hidden sm:block text-sm italic text-gray-600 group-hover:text-black transition-colors">
                    Hi, {user.name}
                  </span>
                  <Avatar className="h-9 w-9 shadow-sm group-hover:scale-105 transition-transform">
                    <AvatarFallback className="bg-[#E9B87D] text-white font-bold text-sm">
                      {user.initial}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="w-64 bg-[#D9D9D9] rounded-2xl shadow-xl border border-gray-200 py-5 px-2 animate-in fade-in slide-in-from-top-2 duration-200"
              >
                {/* PROFILE */}
                <DropdownMenuItem asChild className="cursor-pointer rounded-lg">
                  <Link href="/profile" className="flex items-center text-[#6B5E4C] font-medium hover:text-black">
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </Link>
                </DropdownMenuItem>

                {/* HISTORY */}
                <DropdownMenuItem asChild className="cursor-pointer rounded-lg">
                  <Link href="/history" className="flex items-center text-[#6B5E4C] font-medium hover:text-black">
                    <History className="h-4 w-4 mr-2" />
                    History
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-gray-300 my-2" />

                {/* FEATURES */}
                <div className="px-2 py-1.5">
                  <p className="text-xs font-medium text-[#6B5E4C] uppercase tracking-widest mb-2">
                    Features
                  </p>
                  <div className="space-y-1">
                    <DropdownMenuItem asChild className="cursor-pointer rounded-lg">
                      <Link href="/meditation" className="flex items-center text-sm text-[#6B5E4C] font-medium hover:text-black">
                        <Sparkles className="h-3 w-3 mr-2" />
                        Meditation
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild className="cursor-pointer rounded-lg">
                      <Link href="/reflection" className="flex items-center text-sm text-[#6B5E4C] font-medium hover:text-black">
                        <Sparkles className="h-3 w-3 mr-2" />
                        Reflect &amp; Connect
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild className="cursor-pointer rounded-lg">
                      <Link href="/events" className="flex items-center text-sm text-[#6B5E4C] font-medium hover:text-black">
                        <Sparkles className="h-3 w-3 mr-2" />
                        Events
                      </Link>
                    </DropdownMenuItem>
                  </div>
                </div>

                <DropdownMenuSeparator className="bg-gray-300 my-2" />

                {/* LOGOUT */}
                <DropdownMenuItem
                  onClick={logout}          
                  className="cursor-pointer rounded-lg text-[#6B5E4C] font-medium hover:text-red-600"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <button
              onClick={() => setShowLoginModal(true)}   
              className="text-sm font-medium text-gray-600 hover:text-black tracking-widest hover:underline underline-offset-8 transition-colors cursor-pointer bg-transparent border-none"
            >
              Log in
            </button>
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
                <div>
                  <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Welcome back</p>
                  <h2 className="text-3xl font-serif text-gray-800">Hi, {user.name}</h2>
                </div>

                <nav className="flex flex-col gap-6">
                  <Link href="/meditation" onClick={() => setIsMobileOpen(false)} className="text-xl text-gray-700">
                    Meditation
                  </Link>
                  <Link href="/reflection" onClick={() => setIsMobileOpen(false)} className="text-xl text-gray-700">
                    Reflect &amp; Connect
                  </Link>
                  <Link href="/events" onClick={() => setIsMobileOpen(false)} className="text-xl text-gray-700">
                    Events
                  </Link>
                  <Link href="/history" onClick={() => setIsMobileOpen(false)} className="text-xl text-gray-700">
                    History
                  </Link>
                  <Link href="/profile" onClick={() => setIsMobileOpen(false)} className="text-xl text-gray-700">
                    Profile
                  </Link>
                </nav>
              </div>
            ) : (
              <button
                className="text-left text-4xl font-serif text-gray-800 bg-transparent cursor-pointer border-none"
                onClick={() => {
                  setIsMobileOpen(false)
                  setShowLoginModal(true)
                }}
              >
                Log in
              </button>
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