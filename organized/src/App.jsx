import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Landing from './pages/Landing'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import ClientPage from './pages/ClientPage'

// FIX: lit le cache Supabase synchronement AVANT le premier render
// Si une session est déjà en localStorage → loading démarre à false → zéro flash
function hasCachedSession() {
  try {
    const key = Object.keys(localStorage).find(k => k.startsWith('sb-') && k.endsWith('-auth-token'))
    if (!key) return false
    const raw = localStorage.getItem(key)
    const parsed = JSON.parse(raw)
    // Vérifie que le token n'est pas expiré
    const expiresAt = parsed?.expires_at
    if (expiresAt && Date.now() / 1000 > expiresAt) return false
    return !!parsed?.access_token
  } catch {
    return false
  }
}

export default function App() {
  const [session, setSession] = useState(null)
  // Si session en cache → loading = false dès le départ → pas de splash
  const [loading, setLoading] = useState(() => !hasCachedSession())

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
      if (event === 'SIGNED_IN' && session) {
        window.location.href = '/dashboard'
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
      background: '#ffffff',
    }}>
      <div style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: '1.75rem',
        fontWeight: 500,
        color: '#111110',
      }}>
        Organized<span style={{ color: '#b5893a' }}>.</span>
      </div>
    </div>
  )

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/auth" element={session ? <Navigate to="/dashboard" /> : <Auth onAuth={setSession} />} />
      <Route path="/dashboard/*" element={session ? <Dashboard session={session} /> : <Navigate to="/" />} />
      <Route path="/:slug" element={<ClientPage />} />
    </Routes>
  )
}
