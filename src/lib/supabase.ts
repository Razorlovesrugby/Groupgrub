import { createClient, SupabaseClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const isConfigured = !!(
  url &&
  typeof url === 'string' &&
  url.startsWith('https://') &&
  key &&
  typeof key === 'string' &&
  key.length > 10
)

export const supabase: SupabaseClient = isConfigured
  ? createClient(url!, key!)
  : ({} as SupabaseClient)
