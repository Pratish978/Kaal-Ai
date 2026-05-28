# KAAL AI Frontend Architecture

## Overview

This document describes the frontend architecture and its integration with the FastAPI backend.

## Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    React Components                          │
│        (ChatInterface, MeditationCards, EventCard, etc)      │
└─────────────────┬───────────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────────┐
│              Custom React Hooks                              │
│  (useChat, useMeditation, useEvents, usePsychologist, etc)  │
└─────────────────┬───────────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────────┐
│          Next.js API Routes (/api/*)                         │
│     (Forward requests to FastAPI backend)                    │
└─────────────────┬───────────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────────┐
│           FastAPI Backend                                    │
│  (MongoDB, AI services, authentication, etc)                │
└─────────────────────────────────────────────────────────────┘
```

## Project Structure

```
app/
  ├── api/
  │   ├── chat/route.ts              # POST/GET /api/chat
  │   ├── events/route.ts            # GET/POST /api/events
  │   ├── meditations/route.ts       # GET /api/meditations
  │   ├── psychologist/route.ts      # GET/POST /api/psychologist
  │   ├── reflection/route.ts        # POST/GET /api/reflection
  │   ├── gita/daily-verse/route.ts  # GET /api/gita/daily-verse
  │   └── saved-chats/route.ts       # GET/POST /api/saved-chats
  ├── chat/page.tsx
  ├── meditation/page.tsx
  ├── events/page.tsx
  ├── profile/page.tsx
  └── layout.tsx

components/
  ├── chat-interface.tsx
  ├── meditation-cards.tsx
  ├── breathing-exercise.tsx
  ├── event-card.tsx
  ├── daily-gita-wisdom.tsx
  └── ... (other components)

hooks/
  ├── useChat.ts              # Chat message handling
  ├── useMeditations.ts       # Meditation data fetching
  ├── useEvents.ts            # Events data fetching
  ├── usePsychologist.ts      # Psychologist booking
  ├── useReflectionQuestions.ts # Reflection assessment
  ├── useGitaVerse.ts         # Daily Gita wisdom
  └── useSavedChats.ts        # Saved conversations

lib/
  ├── api.ts                  # Centralized API client and endpoint helpers
  └── utils.ts

contexts/
  └── auth-context.tsx        # Authentication state management

```

## API Integration Flow

### Example: Chat Flow

1. **User sends message in ChatInterface component**
   ```tsx
   const { messages, sendMessage } = useChat()
   await sendMessage("Hello KAAL")
   ```

2. **Hook makes request to Next.js API route**
   ```typescript
   fetch("/api/chat", {
     method: "POST",
     body: JSON.stringify({ message: "Hello KAAL" })
   })
   ```

3. **Next.js API route forwards to FastAPI backend**
   ```typescript
   // /app/api/chat/route.ts
   const response = await fetch("http://localhost:8000/chat", {
     method: "POST",
     headers: { "X-API-Key": "andai" },
     body: JSON.stringify(body)
   })
   ```

4. **FastAPI processes request and returns response**
   ```python
   # FastAPI backend
   @app.post("/chat")
   async def chat(message: str):
       # Process with AI
       return { "response": "..." }
   ```

5. **Response flows back to component**
   - Next.js API route → Hook → Component state → UI update

## API Endpoints

### Chat (`/api/chat`)
- `POST /api/chat` - Send message to AI
- `GET /api/chat` - Get chat history

### Events (`/api/events`)
- `GET /api/events` - List all events
- `POST /api/events` - Create new event
- `GET /api/events/{id}` - Get event details
- `POST /api/events/{id}/register` - Register for event

### Meditation (`/api/meditations`)
- `GET /api/meditations` - List all meditations
- `GET /api/meditations/{id}` - Get meditation details
- `POST /api/meditations/session` - Record session completion

### Psychologist (`/api/psychologist`)
- `GET /api/psychologist` - List available psychologists
- `POST /api/psychologist` - Book session with psychologist
- `GET /api/psychologist/{id}/availability` - Get availability

### Self-Reflection (`/api/reflection`)
- `POST /api/reflection` - Submit assessment answers
- `GET /api/reflection` - Get reflection history
- `GET /api/reflection/{id}/analysis` - Get analysis of reflection

### Gita Wisdom (`/api/gita`)
- `GET /api/gita/daily-verse` - Get daily Gita verse

### Saved Chats (`/api/saved-chats`)
- `GET /api/saved-chats` - List saved conversations
- `POST /api/saved-chats` - Save new conversation
- `GET /api/saved-chats/{id}` - Get specific conversation
- `DELETE /api/saved-chats/{id}` - Delete conversation

## Environment Variables

```env
# Backend URL
FASTAPI_BASE_URL=http://localhost:8000

# API Key
API_KEY=andai

# Next.js API base (frontend only, do not expose backend directly)
NEXT_PUBLIC_API_URL=
```

## Key Design Principles

1. **Separation of Concerns**
   - Components handle UI only
   - Hooks handle data fetching and state
   - API routes handle backend communication

2. **Reusable API Layer**
   - All endpoints have corresponding helpers in `lib/api.ts`
   - Easy to test and modify API logic in one place

3. **Type Safety**
   - TypeScript interfaces for all data structures
   - Strongly typed hook returns

4. **Error Handling**
   - Try-catch blocks in all API calls
   - Error states in hooks
   - User-friendly error messages

5. **Production Ready**
   - Environment variable configuration
   - No hardcoded URLs or secrets
   - Proper logging for debugging

## Using the API

### In Components

**Never do this:**
```tsx
// ❌ Don't fetch directly in components
const ChatInterface = () => {
  const [messages, setMessages] = useState([])
  
  useEffect(() => {
    fetch("/api/chat").then(...)  // Wrong!
  }, [])
}
```

**Do this instead:**
```tsx
// ✅ Use hooks
const ChatInterface = () => {
  const { messages, sendMessage } = useChat()
}
```

### Creating New Hooks

```typescript
import { useState, useEffect, useCallback } from "react"

export function useNewFeature() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/new-feature")
        const result = await response.json()
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return { data, loading, error }
}
```

### Adding New API Endpoints

1. **Create Next.js API route**
   ```typescript
   // app/api/new-feature/route.ts
   import { NextRequest, NextResponse } from "next/server"

   const FASTAPI_BASE_URL = process.env.FASTAPI_BASE_URL || "http://localhost:8000"
   const API_KEY = process.env.API_KEY || "andai"

   export async function GET(request: NextRequest) {
     const response = await fetch(`${FASTAPI_BASE_URL}/new-feature`, {
       headers: { "X-API-Key": API_KEY }
     })
     return NextResponse.json(await response.json())
   }
   ```

2. **Add helper to lib/api.ts**
   ```typescript
   export const newFeatureApi = {
     getAll: () => api.get("/new-feature"),
   }
   ```

3. **Create hook**
   ```typescript
   export function useNewFeature() {
     // ... implementation
   }
   ```

4. **Use in component**
   ```typescript
   const MyComponent = () => {
     const { data } = useNewFeature()
     return <div>{data}</div>
   }
   ```

## Authentication

The X-API-Key header is automatically added to all requests:
- Key: `andai`
- Location: Added by Next.js API routes before forwarding to FastAPI
- Not exposed to frontend (kept secret in .env)

## Debugging

Enable logging by checking browser console:
- API client logs errors to console
- Hooks log errors to console
- API routes log errors to server console

Add custom logging:
```typescript
console.error("[useChat] Error:", error)
console.log("[API] Request to:", endpoint)
```

## Performance Considerations

1. **Caching**
   - Use SWR hooks for automatic caching where appropriate
   - Implement stale-while-revalidate pattern for frequently accessed data

2. **Request Optimization**
   - Batch requests when possible
   - Debounce rapid API calls
   - Use pagination for large datasets

3. **State Management**
   - Keep state close to where it's used
   - Use context only for global state (auth, preferences)
   - Prefer local state in components

## Testing

Test API routes independently:
```bash
# Test chat endpoint
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello"}'
```

Test hooks with mock data:
```typescript
jest.mock("/api/chat", () => ({
  sendMessage: jest.fn()
}))
```

## Common Issues & Solutions

### Issue: CORS errors
**Solution:** All requests go through Next.js API routes, which run on same origin. No CORS issues.

### Issue: Missing X-API-Key header
**Solution:** Added automatically by API routes. Check `API_KEY` environment variable.

### Issue: Stale data
**Solution:** Use `useEffect` dependency arrays correctly or implement cache invalidation.

### Issue: Slow requests
**Solution:** Check network tab, implement request debouncing, use pagination.

## Future Improvements

1. Implement SWR for better caching
2. Add request queuing for offline support
3. Implement optimistic updates
4. Add request interceptors for logging
5. Create API response validation with Zod
6. Add rate limiting protection
