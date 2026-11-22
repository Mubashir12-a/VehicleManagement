import { createContext, useContext } from 'react'

export const AuthContext = createContext({
  user: null,
  session: null,
  profile: null,
  loading: true,
  isGuest: true,
  isSupabaseConnected: false,
  isAuthModalOpen: false,
  authModalTab: 'signin',
  isProfileModalOpen: false,
  openAuthModal: () => {},
  closeAuthModal: () => {},
  openProfileModal: () => {},
  closeProfileModal: () => {},
  signInWithEmail: async () => {},
  signUpWithEmail: async () => {},
  signOut: async () => {},
  resetPassword: async () => {},
  updateProfile: async () => {},
})

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
