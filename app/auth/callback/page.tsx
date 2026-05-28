'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the session from the URL
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session) {
          // User is authenticated, redirect to home
          router.push('/')
        } else {
          // No session, redirect to home anyway
          router.push('/')
        }
      } catch (error) {
        console.error('[Auth] Callback error:', error)
        router.push('/')
      }
    }

    handleCallback()
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center">
        <p className="text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  )
}
