// src/lib/supabase/client.ts
// Browser-side Supabase client (for client components)
// Uses the public anon key — safe to expose in browser

import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!url || !key) {
    console.error('Missing Supabase environment variables! Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
    // Return a dummy client or throw an error so the app can catch it gracefully
    throw new Error('Missing Supabase environment variables');
  }

  return createBrowserClient(url, key);
}
