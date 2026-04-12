import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Landing from './pages/Landing'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import ClientPage from './pages/ClientPage'

const Loader = () => (
  <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f7f5f0' }}>
    <div style={{ fontFamily: 'Playfair Display,serif', fontSize: '1.5rem', color: '#b5893a' }}>Organized.</div>
  </div>
)

export default function App() {
  const [session, setSession]   = useState(null)
  const [profile, setProfile]   = useState(null)   // null = not loaded yet
  const [loading, setLoading]   = useState(true)

  // ── Fetch onboarding status from public.users ─────────────────
  async function fetchProfile(userId) {
    const { data } = await supabase
      .from('users')
      .select('onboarding_complete')
      .eq('id', userId)
      .single()
    // data can be null if the row doesn't exist yet (mid-onboarding)
    setProfile(data ?? { onboarding_complete: false })
  }

  useEffect(() => {
    // Initial load
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session)
      if (session?.user) await fetchProfile(session.user.id)
      setLoading(false)
    })

    // Listen to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        if (session?.user) {
          await fetchProfile(session.user.id)
        } else {
          setProfile(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  if (loading) return <Loader />

  // ── 3-state routing ──────────────────────────────────────────
  // State A : no session              → landing / auth
  // State B : session, not onboarded  → stay on /auth (onboarding flow)
  // State C : session, onboarded      → dashboard

  const onboarded = profile?.onboarding_complete === true

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landing />} />

      {/* Auth — redirect to dashboard only when fully onboarded */}
      <Route
        path="/auth"
        element={
          session && onboarded
            ? <Navigate to="/dashboard" replace />
            : <Auth onAuth={setSession} />
        }
      />

      {/* Dashboard — requires session AND completed onboarding */}
      <Route
        path="/dashboard/*"
        element={
          !session
            ? <Navigate to="/auth" replace />
            : !onboarded
              ? <Navigate to="/auth" replace />
              : <Dashboard session={session} />
        }
      />

      {/* Public client profile page */}
      <Route path="/:slug" element={<ClientPage />} />
    </Routes>
  )
}
