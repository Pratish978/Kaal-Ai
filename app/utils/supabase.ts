import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 1. Alert yourself in the browser console if Next.js isn't reading the keys
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "🚨 SUPABASE CONFIG ERROR: Environment variables are missing! " +
    "Check your .env.local file and make sure you restarted your npm run dev terminal."
  );
}

// 2. Fallback to an empty string instead of crashing instantly with '!'
export const supabase = createClient(
  supabaseUrl || 'https://missing-url.supabase.co', 
  supabaseAnonKey || 'missing-key'
);