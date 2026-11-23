import { createClient } from '@supabase/supabase-js'

const DEFAULT_SUPABASE_URL = 'https://ahlgzfreribllikvouvv.supabase.co'
const DEFAULT_SUPABASE_KEY = 'sb_publishable_sA5RM1lnxDaPOaCO53ZQCA_qz28opor'

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL?.trim() || DEFAULT_SUPABASE_URL
const supabaseKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() ||
  import.meta.env.VITE_SUPABASE_PUBLISHA?.trim() ||
  import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() ||
  import.meta.env.VITE_SUPABASE_KEY?.trim() ||
  DEFAULT_SUPABASE_KEY

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
