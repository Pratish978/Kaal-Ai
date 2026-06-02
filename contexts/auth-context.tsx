"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react"

import {
  supabase,
  getOrCreateSessionId,
} from "@/lib/supabase"

export type PlanType = "free" | "plus" | "annual" | "founding";

export interface User {
  id: string
  email: string
  name?: string
  initial?: string
  plan?: PlanType 
  isFoundingMember?: boolean 
  premium?: boolean 
  premium_expires_at?: string 
}

interface UserPreferences {
  guidancePreference?: "gita" | "no-preference"
  preferenceSet?: boolean
}

interface AuthContextType {
  user: User | null
  isLoggedIn: boolean
  isLoading: boolean
  sessionId: string
  preferences: UserPreferences

  loginWithGoogle: () => Promise<void>
  loginWithEmail: (email: string) => Promise<void>
  logout: () => Promise<void>
  updateUserPreference: (preference: "gita" | "no-preference") => void
  isPremiumUser: () => boolean 
  refreshAuth: () => Promise<void> 
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [sessionId, setSessionId] = useState("")
  const [preferences, setPreferences] = useState<UserPreferences>({})

  const extractUserName = (sessionUser: any) => {
    const meta = sessionUser?.user_metadata || {}
    let name = meta.full_name || meta.name || meta.given_name || ""

    if (!name) {
      const emailPrefix = sessionUser?.email?.split("@")[0] || "User"
      const clean = emailPrefix.replace(/[0-9]/g, "")
      const shortName = clean.slice(0, 8)
      name = shortName || "User"
    }
    return name.charAt(0).toUpperCase() + name.slice(1)
  }

  /* ---------------- ASYNC PREMIUM SYNCHRONIZATION LOOP ---------------- */
  const refreshAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.user) {
        setUser(null)
        return
      }

      const name = extractUserName(session.user)
      const userEmail = session.user.email || ""

      let currentPlan: PlanType = "free"
      let isFoundingMember = false
      let isPremium = false
      let premiumExpiresAt: string | undefined = undefined

      // Local Cache Fallback Check
      if (typeof window !== "undefined") {
        const localCacheActive = localStorage.getItem("kaal_premium") === "true"
        if (localCacheActive) {
          currentPlan = "founding"
          isFoundingMember = true
          isPremium = true
        }
      }

      if (userEmail) {
        try {
          const targetUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/profile?email=${encodeURIComponent(userEmail)}`;

          const profileResponse = await fetch(targetUrl, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "X-API-Key": process.env.NEXT_PUBLIC_API_KEY || "",
            },
          })

          if (profileResponse.ok) {
            const rawJsonData = await profileResponse.json()
            
            // Defensive Unpacking: Extract target configuration fields
            const mongoData = rawJsonData.user || rawJsonData.data || rawJsonData;
            
            // Required Diagnostic Log
            console.log("PROFILE RESPONSE:", mongoData);

            isPremium = mongoData.premium === true || mongoData.premium === "true"
            currentPlan = mongoData.plan || "free"
            premiumExpiresAt = mongoData.premium_expires_at
            isFoundingMember = currentPlan === "founding" || mongoData.isFoundingMember === true || isPremium
            
            if (typeof window !== "undefined") {
              if (isPremium) {
                localStorage.setItem("kaal_premium", "true")
              } else {
                localStorage.removeItem("kaal_premium")
              }
            }
          }
        } catch (apiError) {
          console.error("[Auth Context] MongoDB user profile synchronization failed:", apiError)
        }
      }

      const updatedUserPayload: User = {
        id: session.user.id,
        email: userEmail,
        name,
        initial: name?.[0]?.toUpperCase() || "U",
        plan: currentPlan,
        isFoundingMember,
        premium: isPremium,
        premium_expires_at: premiumExpiresAt
      };

      // Required Diagnostic Logs
      console.log("AUTH STATE:", updatedUserPayload);
      console.log("PREMIUM STATUS:", isPremium);

      setUser(updatedUserPayload)

    } catch (error) {
      console.error("[Auth Context] Unexpected crash inside synchronization flow:", error)
    }
  }

  /* ---------------- INIT AUTH ---------------- */
  useEffect(() => {
    const initAuth = async () => {
      try {
        const anonymousSessionId = getOrCreateSessionId()
        setSessionId(anonymousSessionId)
        await refreshAuth()

        const storedPreferences = localStorage.getItem("kaal-preferences")
        if (storedPreferences) {
          setPreferences(JSON.parse(storedPreferences))
        }
      } catch (error) {
        console.error("[Auth] Initialization error:", error)
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()

    const { data: { subscription }, } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          await refreshAuth()
        } else {
          setUser(null)
        }
      }
    )

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  /* ---------------- GOOGLE LOGIN ---------------- */
  const loginWithGoogle = async () => {
    try {
      setIsLoading(true)
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${typeof window !== "undefined" ? window.location.origin : ""}/auth/callback`,
        },
      })
      if (error) throw error
    } catch (error) {
      console.error("[Auth] Google login error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  /* ---------------- EMAIL LOGIN ---------------- */
  const loginWithEmail = async (email: string) => {
    try {
      setIsLoading(true)
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${typeof window !== "undefined" ? window.location.origin : ""}/auth/callback`,
        },
      })
      if (error) throw error
    } catch (error) {
      console.error("[Auth] Email login error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  /* ---------------- LOGOUT ---------------- */
  const logout = async () => {
    try {
      setIsLoading(true)
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setUser(null)
      localStorage.removeItem("kaal_guest_mode")
      localStorage.removeItem("kaal_premium")
    } catch (error) {
      console.error("[Auth] Logout error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  /* ---------------- USER PREF ---------------- */
  const updateUserPreference = (preference: "gita" | "no-preference") => {
    const updatedPreferences = { guidancePreference: preference, preferenceSet: true }
    setPreferences(updatedPreferences)
    localStorage.setItem("kaal-preferences", JSON.stringify(updatedPreferences))
  }

  /* ---------------- PREMIUM GATE CHECK ---------------- */
  const isPremiumUser = (): boolean => {
    if (!user) return false;
    
    const now = new Date();
    const hasPremiumAttributes = 
      user.premium === true ||
      user.plan === "founding" ||
      user.plan === "plus" ||
      user.plan === "annual" ||
      user.isFoundingMember === true;

    const isTimelineValid = user.premium_expires_at 
      ? new Date(user.premium_expires_at) > now 
      : true;

    return hasPremiumAttributes && isTimelineValid;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        isLoading,
        sessionId,
        preferences,
        loginWithGoogle,
        loginWithEmail,
        logout,
        updateUserPreference,
        isPremiumUser,
        refreshAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}