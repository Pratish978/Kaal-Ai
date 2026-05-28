import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"

interface FeatureLockOptions {
  feature: "save_chat" | "registration" | "reflection" | "progress" | "memory"
  onLocked?: () => void
}

interface UseFeatureLockReturn {
  isLocked: boolean
  canAccess: boolean
  attemptAccess: (callback: () => void | Promise<void>) => Promise<void>
}

/**
 * Hook to check if a feature is locked behind authentication
 * Use this to lock features that require a logged-in user
 */
export function useFeatureLock({
  feature,
  onLocked,
}: FeatureLockOptions): UseFeatureLockReturn {
  const { isLoggedIn } = useAuth()
  const [isLocked, setIsLocked] = useState(!isLoggedIn)

  // Features that are locked without authentication
  const lockedFeatures = {
    save_chat: true,
    registration: true,
    reflection: true,
    progress: true,
    memory: true,
  }

  const canAccess = isLoggedIn || !lockedFeatures[feature]

  const attemptAccess = async (callback: () => void | Promise<void>) => {
    if (!canAccess) {
      setIsLocked(true)
      onLocked?.()
      return
    }

    try {
      await callback()
    } catch (error) {
      console.error(`[Feature] ${feature} access error:`, error)
      throw error
    }
  }

  return {
    isLocked,
    canAccess,
    attemptAccess,
  }
}
