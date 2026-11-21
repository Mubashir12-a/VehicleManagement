import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim() || ''
const supabaseKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() ||
  import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() ||
  ''

const isPlaceholder = (value) =>
  !value ||
  value.includes('your-project-id') ||
  value.includes('your-supabase-anon-key') ||
  value.includes('your-supabase-publishable-key')

export const isSupabaseConfigured =
  !isPlaceholder(supabaseUrl) && !isPlaceholder(supabaseKey)

export const supabaseConfigStatus = {
  hasUrl: !isPlaceholder(supabaseUrl),
  hasApiKey: !isPlaceholder(supabaseKey),
  isConfigured: isSupabaseConfigured,
  mode: isSupabaseConfigured ? 'ready' : 'mock',
}

/**
 * Supabase client instance.
 * Supports both VITE_SUPABASE_PUBLISHABLE_KEY (new Supabase format)
 * and VITE_SUPABASE_ANON_KEY (legacy format).
 */
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null
