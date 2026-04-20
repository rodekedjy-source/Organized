import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Landing    from './pages/Landing'
import Auth       from './pages/Auth'
import Dashboard  from './pages/Dashboard'
import ClientPage from './pages/ClientPage'

export default function App() {
  const [session, setSession] = useState(undefined) // undefined = still loading
  const [ready,   setReady]   = useState(false)

  useEffect(() => {
    // Simple session check — no extra queries, guaranteed to resolve
    supabase.auth.getSession().then(({ data }) => {
      setSession(data?.session ?? null)
      setReady(true)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // Only update session — no redirects, no extra queries
        // Route guards below handle all navigation logic
        setSession(session ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // ── Splash ───────────────────────────────────────────────────
  if (!ready) return (
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

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landing />} />
      <Route path="/:slug" element={<ClientPage />} />

      {/* Auth — Auth.jsx handles session detection and workspace routing internally */}
      <Route
        path="/auth"
        element={
          <Auth
            session={session}
            onAuth={setSession}
          />
        }
      />

      {/* Dashboard — only if session exists */}
      <Route
        path="/dashboard/*"
        element={
          session
            ? <Dashboard session={session} />
            : <Navigate to="/auth" replace />
        }
      />
    </Routes>
  )
}
