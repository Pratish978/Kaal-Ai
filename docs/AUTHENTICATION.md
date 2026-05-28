# KAAL AI - Authentication System

## Overview

The KAAL AI application implements a **soft authentication system** that allows users to:
- Use the app anonymously without signing in
- Optionally log in to unlock premium features
- Choose between Google OAuth and Email Magic Link authentication

## Architecture

### Authentication Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    User Access Patterns                         │
├──────────────────────┬────────────────────────────────────────┤
│  Anonymous Users     │  Authenticated Users                   │
├──────────────────────┼────────────────────────────────────────┤
│ • Chat KAAL          │ • All anonymous features              │
│ • View meditations   │ • Save conversations                  │
│ • View events        │ • Track meditation progress           │
│ • View reflections   │ • Save reflection history             │
│ • View Gita wisdom   │ • Register for events                 │
│                      │ • Personal memory                     │
│                      │ • Psychologist bookings               │
└──────────────────────┴────────────────────────────────────────┘
```

## Setup Instructions

### 1. Configure Supabase

1. Create a Supabase account at https://app.supabase.com
2. Create a new project
3. Get your credentials from Project Settings > API
4. Update `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 2. Enable Google OAuth (Optional)

1. In Supabase dashboard, go to Authentication > Providers
2. Enable Google
3. Configure OAuth credentials with your Google Cloud project
4. Add redirect URL: `https://your-domain/auth/callback`

### 3. Enable Email Magic Links

1. In Supabase dashboard, go to Authentication > Providers
2. Email provider is enabled by default
3. Customize email templates if needed

### 4. Configure RLS Policies (Optional)

Create Row Level Security policies to protect user data:

```sql
-- Allow users to read their own data
CREATE POLICY "Users can read own data" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Allow users to update their own data
CREATE POLICY "Users can update own data" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);
```

## Implementation Details

### Anonymous Sessions

Anonymous users get a unique session ID stored in localStorage:

```typescript
// Session ID stored as: localStorage.getItem('kaal_session')
// Used in header as: X-Session-ID
// Generated via: crypto.randomUUID()
```

### Authentication Context

The `AuthProvider` manages all authentication state:

```typescript
interface AuthContextType {
  user: User | null              // Current logged-in user
  isLoggedIn: boolean            // Auth status
  isLoading: boolean             // Loading state
  sessionId: string              // Anonymous session ID
  preferences: UserPreferences   // User preferences
  loginWithGoogle: () => Promise<void>
  loginWithEmail: (email: string) => Promise<void>
  logout: () => Promise<void>
  updateUserPreference: (preference: string) => void
}
```

### API Headers

All requests include these headers:

```typescript
{
  "Content-Type": "application/json",
  "X-API-Key": "andai",           // Always included
  "X-Session-ID": "<session_id>"  // For anonymous users
}
```

## Usage Examples

### Using Authentication in Components

```typescript
import { useAuth } from "@/contexts/auth-context"

export function MyComponent() {
  const { user, isLoggedIn, sessionId } = useAuth()

  return (
    <div>
      {isLoggedIn ? (
        <p>Welcome, {user?.email}</p>
      ) : (
        <p>Anonymous session: {sessionId}</p>
      )}
    </div>
  )
}
```

### Locking Features Behind Authentication

```typescript
import { useFeatureLock } from "@/hooks/useFeatureLock"

export function SaveChatButton() {
  const { isLocked, canAccess, attemptAccess } = useFeatureLock({
    feature: "save_chat",
    onLocked: () => showLoginModal(),
  })

  const handleSaveChat = async () => {
    await attemptAccess(async () => {
      // Save chat logic here
    })
  }

  return (
    <button disabled={isLocked} onClick={handleSaveChat}>
      {isLocked ? "Sign in to save" : "Save chat"}
    </button>
  )
}
```

### Logging In

```typescript
import { useAuth } from "@/contexts/auth-context"

export function LoginForm() {
  const { loginWithGoogle, loginWithEmail } = useAuth()

  return (
    <>
      <button onClick={() => loginWithGoogle()}>
        Login with Google
      </button>
      <button onClick={() => loginWithEmail("user@example.com")}>
        Login with Email
      </button>
    </>
  )
}
```

## Backend Integration

### Chat Endpoint

```typescript
POST /api/chat
Headers:
  - X-Session-ID: <session_id>  (for anonymous users)
  - X-API-Key: andai

Body:
{
  message: "user message",
  chat_history: [],
  user_id: "uuid" (optional, if logged in),
  session_id: "uuid" (always included)
}
```

### Save Chat Endpoint

```typescript
POST /api/saved-chats
Headers:
  - Authorization: Bearer <jwt_token>  (for authenticated users)
  - X-API-Key: andai

Body:
{
  title: "Chat Title",
  messages: [...],
  timestamp: "2024-01-01T00:00:00Z"
}
```

## Feature Access Rules

| Feature | Anonymous | Authenticated |
|---------|-----------|---------------|
| Chat | ✅ Yes | ✅ Yes |
| Meditation | ✅ Yes (1 free) | ✅ All |
| Events | ✅ View | ✅ Register |
| Reflection | ✅ Yes | ✅ + History |
| Gita Wisdom | ✅ Yes | ✅ Yes |
| Memory | ❌ No | ✅ Yes |
| Progress | ❌ No | ✅ Yes |
| Psychologist | ❌ No | ✅ Book |

## Supabase Tables (Reference)

```sql
-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat sessions
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  session_id TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Saved conversations
CREATE TABLE IF NOT EXISTS saved_chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  messages JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Error Handling

The authentication system gracefully handles errors:

```typescript
try {
  await loginWithGoogle()
} catch (error) {
  console.error('Login failed:', error.message)
  // Show error to user
}
```

## Security Considerations

1. **Environment Variables**: Never commit `.env.local` - use `.env.example` as template
2. **ANON_KEY**: The Supabase anon key is safe to expose (it's public in the browser)
3. **RLS Policies**: Always use Row Level Security in Supabase for sensitive data
4. **Session Storage**: Anonymous session IDs are stored in localStorage - not sensitive
5. **API Key**: The X-API-Key header is used for backend authentication

## Troubleshooting

### Users can't log in
- Check Supabase credentials in `.env.local`
- Verify OAuth provider is configured (if using Google)
- Check auth callback URL in Supabase: `https://your-domain/auth/callback`

### Anonymous users can't chat
- Verify X-Session-ID header is being sent
- Check backend is handling anonymous sessions correctly
- Verify crypto.randomUUID() is available (or fallback is working)

### Features not locked correctly
- Check useFeatureLock hook is used in the component
- Verify onLocked callback is triggering login modal
- Check isLoggedIn state is updating correctly

## Files Structure

```
├── contexts/
│   └── auth-context.tsx          # Authentication context & provider
├── hooks/
│   ├── useChat.ts                # Chat hook with session support
│   ├── useFeatureLock.ts         # Feature locking hook
│   └── ...other hooks
├── lib/
│   ├── supabase.ts               # Supabase client setup
│   └── api.ts                    # API client with auth headers
├── app/
│   ├── auth/
│   │   └── callback/page.tsx      # OAuth callback handler
│   └── ...other routes
├── components/
│   ├── login-modal.tsx           # Login UI component
│   └── ...other components
└── .env.example                  # Environment variables template
```

## Next Steps

1. Set up Supabase project
2. Configure OAuth providers (Google)
3. Add environment variables to Vercel/deployment
4. Test login flow in development
5. Deploy authentication system
6. Monitor user adoption

## Support

For issues with Supabase, visit: https://supabase.com/docs
For Next.js authentication patterns: https://nextjs.org/docs/authentication
