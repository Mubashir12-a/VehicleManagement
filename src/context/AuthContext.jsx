import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import { AuthContext } from './AuthContextCore'

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(
    () => Boolean(isSupabaseConfigured && supabase),
  )

  // Modals state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authModalTab, setAuthModalTab] = useState('signin')
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)

  const openAuthModal = useCallback((tab = 'signin') => {
    setAuthModalTab(tab)
    setIsAuthModalOpen(true)
  }, [])

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false)
  }, [])

  const openProfileModal = useCallback(() => {
    setIsProfileModalOpen(true)
  }, [])

  const closeProfileModal = useCallback(() => {
    setIsProfileModalOpen(false)
  }, [])

  // Helper to fetch or create a user profile from Supabase
  const loadProfile = useCallback(async (currentUser) => {
    if (!currentUser || !isSupabaseConfigured || !supabase) {
      setProfile(null)
      return null
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .maybeSingle()

      if (error && error.code !== 'PGRST116') {
        console.warn('Error fetching user profile:', error.message)
      }

      if (data) {
        setProfile(data)
        return data
      }

      // Profile doesn't exist yet, create default profile
      const newProfile = {
        id: currentUser.id,
        email: currentUser.email,
        full_name:
          currentUser.user_metadata?.full_name ||
          currentUser.email?.split('@')[0] ||
          'Rider',
        phone: currentUser.user_metadata?.phone || '',
        bio: currentUser.user_metadata?.bio || 'Enthusiast & Rider',
        preferences: {
          currency: '₹',
          distanceUnit: 'km',
          fuelUnit: 'L',
        },
      }

      const { data: inserted, error: insertError } = await supabase
        .from('profiles')
        .insert([newProfile])
        .select()
        .single()

      if (!insertError && inserted) {
        setProfile(inserted)
        return inserted
      } else {
        setProfile(newProfile)
        return newProfile
      }
    } catch (err) {
      console.warn('Exception during profile load:', err)
      return null
    }
  }, [])

  // Initial session loader
  useEffect(() => {
    let mounted = true

    if (!isSupabaseConfigured || !supabase) {
      return
    }

    supabase.auth
      .getSession()
      .then(async ({ data: { session: initialSession } }) => {
        if (!mounted) return
        setSession(initialSession)
        const currentUser = initialSession?.user ?? null
        setUser(currentUser)
        if (currentUser) {
          await loadProfile(currentUser)
        }
        setLoading(false)
      })
      .catch((err) => {
        console.warn('Error fetching initial auth session:', err)
        if (mounted) setLoading(false)
      })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!mounted) return
      setSession(newSession)
      const currentUser = newSession?.user ?? null
      setUser(currentUser)

      if (currentUser) {
        await loadProfile(currentUser)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })

    return () => {
      mounted = false
      subscription?.unsubscribe()
    }
  }, [loadProfile])

  // Sign In with email & password
  const signInWithEmail = useCallback(
    async (email, password) => {
      if (!isSupabaseConfigured || !supabase) {
        throw new Error(
          'Supabase is not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your Cloudflare Environment Variables or .env.local',
        )
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (error) throw error

      if (data?.user) {
        await loadProfile(data.user)
      }

      return data
    },
    [loadProfile],
  )

  // Sign Up with email, password, and profile metadata
  const signUpWithEmail = useCallback(
    async (email, password, metadata = {}) => {
      if (!isSupabaseConfigured || !supabase) {
        throw new Error(
          'Supabase is not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your Cloudflare Environment Variables or .env.local',
        )
      }

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: metadata.fullName || 'xyz',
            phone: metadata.phone || '9123456789',
            vehicle_name: metadata.vehicleName || 'Enter Vehicle Name',
            vehicle_brand: metadata.vehicleBrand || 'None',
            vehicle_model: metadata.vehicleModel || 'None',
            vehicle_plate: metadata.vehiclePlate || 'None',
          },
        },
      })

      if (error) {
        const msg = (error.message || '').toLowerCase()
        if (
          msg.includes('already') ||
          msg.includes('registered') ||
          msg.includes('exists') ||
          error.status === 400 ||
          error.code === 'user_already_exists'
        ) {
          const customErr = new Error(
            'This email is already registered. Please sign in instead.',
          )
          customErr.code = 'EMAIL_ALREADY_EXISTS'
          throw customErr
        }
        throw error
      }

      // Supabase returns an empty identities array when signing up with an already registered email
      if (
        data?.user &&
        Array.isArray(data.user.identities) &&
        data.user.identities.length === 0
      ) {
        const customErr = new Error(
          'This email is already registered. Please sign in instead.',
        )
        customErr.code = 'EMAIL_ALREADY_EXISTS'
        throw customErr
      }

      if (data?.user) {
        const initialProfile = {
          id: data.user.id,
          email: data.user.email,
          full_name: metadata.fullName || 'xyz',
          phone: metadata.phone || '9123456789',
          bio: 'Vehicle Owner & Rider',
          preferences: {
            currency: '₹',
            distanceUnit: 'km',
            fuelUnit: 'L',
          },
        }

        await supabase
          .from('profiles')
          .upsert(initialProfile, { onConflict: 'id' })
        setProfile(initialProfile)
      }

      return data
    },
    [],
  )

  // Sign Out
  const signOut = useCallback(async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut()
    }
    setUser(null)
    setSession(null)
    setProfile(null)
  }, [])

  // Send password reset email
  const resetPassword = useCallback(async (email) => {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured.')
    }
    const { data, error } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      {
        redirectTo: window.location.origin,
      },
    )
    if (error) throw error
    return data
  }, [])

  // Update profile details
  const updateProfile = useCallback(
    async (updates) => {
      if (!user) throw new Error('No authenticated user.')
      const merged = {
        ...profile,
        ...updates,
        updated_at: new Date().toISOString(),
      }

      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase
          .from('profiles')
          .upsert(merged, { onConflict: 'id' })

        if (error) throw error
      }

      setProfile(merged)
      return merged
    },
    [user, profile],
  )

  const value = useMemo(
    () => ({
      user,
      session,
      profile,
      loading,
      isGuest: !user,
      isSupabaseConnected: isSupabaseConfigured,
      isAuthModalOpen,
      authModalTab,
      isProfileModalOpen,
      openAuthModal,
      closeAuthModal,
      openProfileModal,
      closeProfileModal,
      signInWithEmail,
      signUpWithEmail,
      signOut,
      resetPassword,
      updateProfile,
    }),
    [
      user,
      session,
      profile,
      loading,
      isAuthModalOpen,
      authModalTab,
      isProfileModalOpen,
      openAuthModal,
      closeAuthModal,
      openProfileModal,
      closeProfileModal,
      signInWithEmail,
      signUpWithEmail,
      signOut,
      resetPassword,
      updateProfile,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
