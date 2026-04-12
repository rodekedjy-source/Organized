import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { supabase } from './lib/supabase'
import Landing from './pages/Landing'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import ClientPage from './pages/ClientPage'

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  // Track if this is the very first sign-in (email confirmation link)
  // vs a session restore on page refresh — to avoid redirect loop on mobile
  const initialLoad = useRef(true)

  useEffect(() => {
    // 1. Get existing session first (synchronous restore — no redirect)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
      initialLoad.current = false
    })

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)

      // Only redirect on a genuine new sign-in (email confirmation link click),
      // NOT on INITIAL_SESSION (page refresh restoring an existing session)
      // This is the fix for the mobile splash page loop
      if (event === 'SIGNED_IN' && !initialLoad.current) {
        // Use replace to avoid adding to browser history
        window.location.replace('/dashboard')
      }

      // On sign out, go back to home
      if (event === 'SIGNED_OUT') {
        window.location.replace('/')
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f7f5f0'
    }}>
      <div style={{
        fontFamily: 'Playfair Display, serif',
        fontSize: '1.5rem',
        color: '#b5893a'
      }}>
        Organized.
      </div>
    </div>
  )

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route
        path="/auth"
        element={session ? <Navigate to="/dashboard" replace /> : <Auth onAuth={setSession} />}
      />
      <Route
        path="/dashboard/*"
        element={
          session
            // key={session.user.id} forces Dashboard to fully remount when the
            // user changes (sign out + sign in as different/same user) — fixes
            // the "data shows 0 after reconnect" bug
            ? <Dashboard key={session.user.id} session={session} />
            : <Navigate to="/auth" replace />
        }
      />
      <Route path="/:slug" element={<ClientPage />} />
    </Routes>
  )
}
