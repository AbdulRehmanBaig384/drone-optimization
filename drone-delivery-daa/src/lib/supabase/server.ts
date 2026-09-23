// src/lib/supabase/server.ts
// Server-side Supabase client (for API routes and Server Components)
// Uses the service role key for elevated DB access

import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/**
 * createServerClient — returns a Supabase client with the service-role key.
 * Only use in API routes / server-side code — NEVER expose service key to browser.
 */
export function createServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!url || !key) {
    console.error('Missing Supabase environment variables! Check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
    throw new Error('Missing Supabase environment variables');
  }

  return createSupabaseClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
