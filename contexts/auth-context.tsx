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
  premium_expires_at?: string // Added to capture real-time time bounds
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

  updateUserPreference: (
    preference: "gita" | "no-preference"
  ) => void
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
    console.log("=== [AUTH SYNCHRONIZATION LOOP START] ===");
    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.user) {
        console.log("[Auth Audit] No active Supabase session found. Setting user to null.");
        setUser(null)
        return
      }

      const name = extractUserName(session.user)
      const userEmail = session.user.email || ""
      console.log(`[Auth Audit] Supabase authenticated user detected: ${userEmail}`);

      let currentPlan: PlanType = "free"
      let isFoundingMember = false
      let isPremium = false
      let premiumExpiresAt: string | undefined = undefined

      // Local Cache Fallback Check
      if (typeof window !== "undefined") {
        const localCacheActive = localStorage.getItem("kaal_premium") === "true"
        console.log(`[Auth Audit] LocalStorage cache flag status: ${localCacheActive}`);
        if (localCacheActive) {
          currentPlan = "founding"
          isFoundingMember = true
          isPremium = true
        }
      }

      if (userEmail) {
        try {
          const targetUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/profile?email=${encodeURIComponent(userEmail)}`;
          console.log(`[Auth Audit] Dispatching profile request to backend URL: ${targetUrl}`);

          const profileResponse = await fetch(targetUrl, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "X-API-Key": process.env.NEXT_PUBLIC_API_KEY || "",
            },
          })

          console.log(`[Auth Audit] HTTP response status code: ${profileResponse.status}`);

          if (profileResponse.ok) {
            const rawJsonData = await profileResponse.json()
            console.log("[Auth Audit] Raw JSON payload compiled from endpoint:", rawJsonData);
            
            // Defensive Parsing: Extract fields safely if payload is nested under a user wrapper object
            const mongoData = rawJsonData.user || rawJsonData.data || rawJsonData;
            console.log("[Auth Audit] Unpacked target configuration fields:", mongoData);

            isPremium = mongoData.premium === true || mongoData.premium === "true"
            currentPlan = mongoData.plan || "free"
            premiumExpiresAt = mongoData.premium_expires_at
            isFoundingMember = currentPlan === "founding" || mongoData.isFoundingMember === true || isPremium
            
            console.log(`[Auth Audit] State variables extracted -> premium: ${isPremium}, plan: ${currentPlan}, premium_expires_at: ${premiumExpiresAt}`);

            if (typeof window !== "undefined") {
              if (isPremium) {
                localStorage.setItem("kaal_premium", "true")
              } else {
                localStorage.removeItem("kaal_premium")
              }
            }
          } else {
            console.warn(`[Auth Audit] Non-200 profile response received. Status: ${profileResponse.status}`);
          }
        } catch (apiError) {
          console.error("[Auth Audit] MongoDB user profile synchronization failed completely:", apiError)
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

      console.log("[Auth Audit] Committing user profile state payload to application memory:", updatedUserPayload);
      setUser(updatedUserPayload)

    } catch (error) {
      console.error("[Auth Audit] Unexpected crash inside execution synchronization flow block:", error)
    }
    console.log("=== [AUTH SYNCHRONIZATION LOOP END] ===");
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

    // Direct token validation gate factoring timeline expirations securely
    const isTimelineValid = user.premium_expires_at 
      ? new Date(user.premium_expires_at) > now 
      : true;

    const accessResolution = hasPremiumAttributes && isTimelineValid;
    console.log(`[Auth Audit Gate Check] User: ${user.email} | Qualified: ${hasPremiumAttributes} | Time Valid: ${isTimelineValid} -> Resolved Status: ${accessResolution}`);
    
    return accessResolution;
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