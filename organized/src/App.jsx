import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { supabase } from './lib/supabase'
import Landing from './pages/Landing'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import ClientPage from './pages/ClientPage'

function SplashScreen() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0908',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      position: 'relative',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400&display=swap');

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes dotPulse {
          0%, 100% { opacity: 1;   transform: scale(1); }
          50%       { opacity: 0.25; transform: scale(0.55); }
        }
        @keyframes lineExpand {
          from { transform: scaleX(0); opacity: 0; }
          to   { transform: scaleX(1); opacity: 1; }
        }
        @keyframes grainMove {
          0%,100% { transform: translate(0,0); }
          10%     { transform: translate(-1%,-1%); }
          30%     { transform: translate(1%,-2%); }
          50%     { transform: translate(-1%,1%); }
          70%     { transform: translate(2%,1%); }
          90%     { transform: translate(-2%,2%); }
        }

        .sp-word {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: clamp(3.5rem, 11vw, 7rem);
          font-weight: 400;
          letter-spacing: -0.02em;
          line-height: 1;
          color: #f0ede8;
          animation: fadeUp .85s cubic-bezier(.22,1,.36,1) both;
        }
        .sp-dot {
          color: #b5893a;
          display: inline-block;
          animation:
            fadeUp .85s cubic-bezier(.22,1,.36,1) both,
            dotPulse 2.2s ease-in-out 1.1s infinite;
        }
        .sp-line {
          width: 44px;
          height: 1px;
          background: linear-gradient(90deg, transparent, #b5893a, transparent);
          transform-origin: center;
          animation: lineExpand .75s cubic-bezier(.22,1,.36,1) .55s both;
          margin: 1.8rem auto 1.65rem;
        }
        .sp-sub {
          font-family: 'Playfair Display', serif;
          font-style: italic;
          font-size: clamp(.68rem, 2vw, .82rem);
          font-weight: 400;
          letter-spacing: .24em;
          text-transform: uppercase;
          color: rgba(181,137,58,.5);
          animation: fadeIn .9s ease .95s both;
        }
        .sp-grain {
          position: fixed;
          inset: -50%;
          width: 200%;
          height: 200%;
          opacity: .04;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 160px;
          animation: grainMove 9s steps(10) infinite;
          pointer-events: none;
          z-index: 0;
        }
        .sp-glow {
          position: absolute;
          width: 520px;
          height: 520px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(181,137,58,.065) 0%, transparent 68%);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
          animation: fadeIn 1.4s ease .2s both;
        }
      `}</style>

      <div className="sp-grain"/>
      <div className="sp-glow"/>

      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
        <div className="sp-word">
          Organized<span className="sp-dot">.</span>
        </div>
        <div className="sp-line"/>
        <div className="sp-sub">pour les professionnels du beau</div>
      </div>
    </div>
  )
}

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const initialLoad = useRef(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
      initialLoad.current = false
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)

      if (event === 'SIGNED_IN' && !initialLoad.current) {
        window.location.replace('/dashboard')
      }

      if (event === 'SIGNED_OUT') {
        window.location.replace('/')
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) return <SplashScreen />

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
            ? <Dashboard key={session.user.id} session={session} />
            : <Navigate to="/auth" replace />
        }
      />
      <Route path="/:slug" element={<ClientPage />} />
    </Routes>
  )
}
