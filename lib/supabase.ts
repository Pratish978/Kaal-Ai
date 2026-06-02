import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('[Supabase] Missing environment variables - Auth will use localStorage fallback')
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
)

/**
 * Generate anonymous session ID
 */
export function generateSessionId(): string {
  if (typeof window !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  // Fallback for environments without crypto.randomUUID
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Get or create anonymous session
 */
export function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') {
    return ''
  }

  const existing = localStorage.getItem('kaal_session')
  if (existing) {
    return existing
  }

  const newSessionId = generateSessionId()
  localStorage.setItem('kaal_session', newSessionId)
  return newSessionId
}