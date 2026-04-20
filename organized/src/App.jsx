import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Landing    from './pages/Landing'
import Auth       from './pages/Auth'
import Dashboard  from './pages/Dashboard'
import ClientPage from './pages/ClientPage'

export default function App() {
  const [session,   setSession]   = useState(null)
  const [onboarded, setOnboarded] = useState(false)
  const [loading,   setLoading]   = useState(true)

  async function checkOnboarding(sess) {
    if (!sess) { setOnboarded(false); return }
    try {
      const { data } = await supabase
        .from('workspaces')
        .select('id')
        .eq('user_id', sess.user.id)
        .maybeSingle()
      setOnboarded(!!data)
    } catch {
      setOnboarded(false)
    }
  }

  useEffect(() => {
    // ── Init: getSession + finally guarantees loading always ends ──
    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setSession(session)
        await checkOnboarding(session)
      } catch (err) {
        console.error('App init error:', err)
      } finally {
        setLoading(false) // always called, no matter what
      }
    }
    init()

    // ── Listen for auth changes after init ──
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        if (event === 'SIGNED_IN')  await checkOnboarding(session)
        if (event === 'SIGNED_OUT') setOnboarded(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // ── Splash ───────────────────────────────────────────────────
  if (loading) return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f7f5f0',
    }}>
      <div style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: '1.5rem',
        color: '#b5893a',
      }}>
        Organized<span style={{ color: '#0d0c0a' }}>.</span>
      </div>
    </div>
  )

  // ── 3-state routing ──────────────────────────────────────────
  const isReady = !!(session && onboarded)

  return (
    <Routes>
      <Route path="/" element={<Landing />} />

      <Route
        path="/auth"
        element={
          isReady
            ? <Navigate to="/dashboard" replace />
            : <Auth
                onAuth={setSession}
                onOnboarded={() => setOnboarded(true)}
              />
        }
      />

      <Route
        path="/dashboard/*"
        element={
          !session   ? <Navigate to="/auth" replace /> :
          !onboarded ? <Navigate to="/auth" replace /> :
          <Dashboard session={session} />
        }
      />

      <Route path="/:slug" element={<ClientPage />} />
    </Routes>
  )
}
