import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'

// ─── Global Styles ────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400;1,500&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { overflow-x: hidden; }

  .cp-nav-book { transition: background .2s, transform .15s; }
  .cp-nav-book:hover { background: #d4b55c !important; transform: translateY(-1px); }

  .cp-tab-btn { transition: color .15s; }
  .cp-tab-btn:hover { color: #C9A84C !important; }

  .cp-social { transition: opacity .2s; }
  .cp-social:hover { opacity: 0.5 !important; }

  .cp-service-card { transition: background .25s; cursor: pointer; }
  .cp-service-card:hover { background: #1a1a1a !important; }
  .cp-service-card:hover .cp-service-line { transform: scaleX(1) !important; }
  .cp-service-line { transition: transform .3s ease; }

  .cp-product-card { transition: border-color .2s; cursor: pointer; }
  .cp-product-card:hover { border-color: rgba(201,168,76,0.3) !important; }

  .cp-faq-row { transition: background .15s; cursor: pointer; }
  .cp-faq-row:hover { background: rgba(255,255,255,0.02) !important; }

  .cp-portfolio-item { overflow: hidden; }
  .cp-portfolio-item img { transition: transform .4s ease; display: block; width: 100%; height: 100%; object-fit: cover; }
  .cp-portfolio-item:hover img { transform: scale(1.04); }

  @keyframes cpFadeUp { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }
  @keyframes cpPulse  { 0%,100%{opacity:1} 50%{opacity:.25} }
  @keyframes cpSpin   { to{transform:rotate(360deg)} }

  .cp-a1 { animation: cpFadeUp .75s .05s ease forwards; opacity: 0; }
  .cp-a2 { animation: cpFadeUp .75s .2s  ease forwards; opacity: 0; }
  .cp-a3 { animation: cpFadeUp .75s .35s ease forwards; opacity: 0; }
  .cp-a4 { animation: cpFadeUp .75s .5s  ease forwards; opacity: 0; }

  @media (max-width: 760px) {
    .cp-services-grid { grid-template-columns: 1fr !important; }
    .cp-products-grid  { grid-template-columns: 1fr 1fr !important; }
    .cp-reviews-grid   { grid-template-columns: 1fr !important; }
    .cp-portfolio-grid { grid-template-columns: repeat(2,1fr) !important; }
    .cp-hero-content   { padding: 56px 24px 72px !important; }
    .cp-main-pad       { padding: 52px 20px 100px !important; }
    .cp-nav-inner      { padding: 18px 20px !important; }
    .cp-footer-inner   { flex-direction: column; gap: 10px; text-align: center; padding: 24px !important; }
  }
  @media (max-width: 480px) {
    .cp-products-grid { grid-template-columns: 1fr !important; }
  }
`

// ─── Shader Background ────────────────────────────────────────────────────────
function ShaderBg() {
  const ref = useRef(null)
  const raf = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    if (!gl) return

    const vs = `attribute vec2 a;void main(){gl_Position=vec4(a,0,1);}`
    const fs = `
      precision mediump float;
      uniform float t; uniform vec2 r;
      float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float n(vec2 p){
        vec2 i=floor(p),f=fract(p),u=f*f*(3.-2.*f);
        return mix(mix(h(i),h(i+vec2(1,0)),u.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),u.x),u.y);
      }
      float fbm(vec2 p){
        float v=0.,a=.5;
        mat2 m=mat2(.8,.6,-.6,.8);
        for(int i=0;i<6;i++){v+=a*n(p);p=m*p*2.+vec2(100);a*=.5;}
        return v;
      }
      void main(){
        vec2 uv=gl_FragCoord.xy/r;
        vec2 q=vec2(fbm(uv+.016*t),fbm(uv+vec2(1.)));
        vec2 s=vec2(fbm(uv+q+vec2(1.7,9.2)+.11*t),fbm(uv+q+vec2(8.3,2.8)+.09*t));
        float f=fbm(uv+s);
        vec3 dark=vec3(.04,.03,.02),mid=vec3(.44,.35,.24),lite=vec3(.68,.57,.41);
        vec3 c=mix(dark,mid,clamp(f*f*3.5,0.,1.));
        c=mix(c,lite,clamp(length(q)*.55,0.,1.));
        c=(f*f*f+.5*f*f+.4*f)*c;
        vec2 vig=uv*(1.-uv.yx); c*=pow(vig.x*vig.y*13.,.18);
        gl_FragColor=vec4(c,1.);
      }
    `
    function sh(type, src) {
      const s = gl.createShader(type)
      gl.shaderSource(s, src); gl.compileShader(s); return s
    }
    const prog = gl.createProgram()
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, vs))
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, fs))
    gl.linkProgram(prog); gl.useProgram(prog)

    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(prog, 'a')
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)

    const uT = gl.getUniformLocation(prog, 't')
    const uR = gl.getUniformLocation(prog, 'r')

    function resize() {
      canvas.width  = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      gl.viewport(0, 0, canvas.width, canvas.height)
    }
    resize()
    window.addEventListener('resize', resize)

    const t0 = performance.now()
    function draw() {
      gl.uniform1f(uT, (performance.now() - t0) / 1000)
      gl.uniform2f(uR, canvas.width, canvas.height)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      raf.current = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(raf.current); window.removeEventListener('resize', resize) }
  }, [])

  return <canvas ref={ref} style={{ position:'absolute',inset:0,width:'100%',height:'100%',display:'block' }} />
}

// ─── Social Icons ─────────────────────────────────────────────────────────────
const IconIG = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5"/>
    <circle cx="12" cy="12" r="4"/>
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
  </svg>
)
const IconX = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.733-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
)
const IconTikTok = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z"/>
  </svg>
)
const IconFB = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
)

// ─── FAQ Data ─────────────────────────────────────────────────────────────────
const FAQ_ITEMS = [
  {
    q: 'How do I reschedule or cancel my appointment?',
    a: 'Contact the studio directly by phone or message. Cancellations made less than 24 hours before the appointment may be subject to a fee at the studio\'s discretion.',
  },
  {
    q: 'What should I prepare before arriving?',
    a: 'Arrive with clean, dry hair unless your service requires otherwise. If you have a reference photo, bring it — it makes the consultation faster and the result more accurate.',
  },
  {
    q: 'Are consultations available before booking?',
    a: 'Yes. A consultation can be booked as a standalone appointment and is strongly recommended for first-time clients or complex colour work.',
  },
  {
    q: 'What payment methods are accepted?',
    a: 'Cash, debit, and all major credit cards. E-transfer may be available depending on the studio. Confirm at the time of booking.',
  },
  {
    q: 'How far in advance should I book?',
    a: 'Standard services: 1 to 2 weeks ahead. Colour, bridal, or multi-step services: 3 to 4 weeks minimum to secure your preferred time slot.',
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
function SectionHeader({ label, title, italic }) {
  return (
    <div style={{ marginBottom: 40 }}>
      <div style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: 12 }}>
        {label}
      </div>
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(28px,4vw,44px)', fontWeight: 500, lineHeight: 1.15 }}>
        {title}
        {italic && <em style={{ fontStyle: 'italic', color: '#C9A84C' }}> {italic}</em>}
      </h2>
    </div>
  )
}

function Stars({ n = 5 }) {
  return <span style={{ fontSize: 11, color: '#C9A84C', letterSpacing: 2 }}>{'★'.repeat(Math.min(5, n))}</span>
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ClientPage() {
  const { slug } = useParams()

  const [ws,           setWs]           = useState(null)
  const [services,     setServices]     = useState([])
  const [products,     setProducts]     = useState([])
  const [offerings,    setOfferings]    = useState([])
  const [reviews,      setReviews]      = useState([])
  const [portfolio,    setPortfolio]    = useState([])
  const [tab,          setTab]          = useState('book')
  const [bookModal,    setBookModal]    = useState(null)
  const [productModal, setProductModal] = useState(null)
  const [learnModal,   setLearnModal]   = useState(null)
  const [faqOpen,      setFaqOpen]      = useState(null)
  const [loading,      setLoading]      = useState(true)
  const [notFound,     setNotFound]     = useState(false)
  const [toast,        setToast]        = useState('')
  const [bookForm,     setBookForm]     = useState({ name:'', email:'', phone:'', date:'', time:'', notes:'' })
  const [booking,      setBooking]      = useState(false)
  const [booked,       setBooked]       = useState(false)

  const gold  = '#C9A84C'
  const muted = 'rgba(245,240,232,0.35)'
  const soft  = 'rgba(245,240,232,0.55)'

  function notify(msg) { setToast(msg); setTimeout(() => setToast(''), 3500) }

  useEffect(() => {
    const id = 'cp-global-css'
    if (!document.getElementById(id)) {
      const s = document.createElement('style'); s.id = id; s.textContent = CSS
      document.head.appendChild(s)
    }
    load()
  }, [slug])

  async function load() {
    const { data: w } = await supabase.from('workspaces').select('*').eq('slug', slug).single()
    if (!w) { setNotFound(true); setLoading(false); return }
    setWs(w)

    const [s, p, o, r, ph] = await Promise.all([
      supabase.from('services').select('*').eq('workspace_id', w.id).eq('is_active', true).order('display_order'),
      supabase.from('products').select('*').eq('workspace_id', w.id).eq('is_active', true),
      supabase.from('offerings').select('*').eq('workspace_id', w.id),
      supabase.from('reviews').select('*').eq('workspace_id', w.id).eq('is_approved', true).order('created_at', { ascending: false }).limit(12),
      supabase.from('portfolio_photos').select('*').eq('workspace_id', w.id).order('display_order').limit(9),
    ])
    setServices(s.data   || [])
    setProducts(p.data   || [])
    setOfferings(o.data  || [])
    setReviews(r.data    || [])
    setPortfolio(ph.data || [])
    setLoading(false)
  }

  async function submitBooking(e) {
    e.preventDefault()
    if (!bookForm.name || !bookForm.date || !bookForm.time) return
    setBooking(true)
    const { error } = await supabase.from('appointments').insert({
      workspace_id: ws.id,
      client_name:  bookForm.name,
      client_phone: bookForm.phone,
      notes: `Service: ${bookModal.name}.${bookForm.notes ? ' ' + bookForm.notes : ''}`,
      scheduled_at: new Date(`${bookForm.date}T${bookForm.time}:00`).toISOString(),
      amount: bookModal.price,
      status: 'pending',
    })
    if (error) { notify('Something went wrong. Please try again.'); setBooking(false); return }
    setBooked(true); setBooking(false)
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ background: '#0A0A0A', color: '#F5F0E8', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <style>{CSS}</style>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
        <div style={{ width: 26, height: 26, border: `1.5px solid ${gold}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'cpSpin .8s linear infinite' }} />
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 14, color: gold, letterSpacing: '0.08em' }}>Organized.</div>
      </div>
    </div>
  )

  // ── 404 ───────────────────────────────────────────────────────────────────
  if (notFound) return (
    <div style={{ background: '#0A0A0A', color: '#F5F0E8', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem', fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '3.5rem', color: gold, marginBottom: 12 }}>404</div>
      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', marginBottom: 8 }}>Studio not found</div>
      <div style={{ fontSize: 13, color: muted }}>Double-check the link and try again.</div>
    </div>
  )

  const socials = [
    { key: 'instagram_url', Icon: IconIG,     label: 'Instagram' },
    { key: 'twitter_url',   Icon: IconX,      label: 'X'         },
    { key: 'tiktok_url',    Icon: IconTikTok, label: 'TikTok'    },
    { key: 'facebook_url',  Icon: IconFB,     label: 'Facebook'  },
  ].filter(s => ws[s.key])

  const base = {
    background: '#0A0A0A',
    color: '#F5F0E8',
    fontFamily: "'DM Sans', system-ui, sans-serif",
    minHeight: '100vh',
  }

  return (
    <div style={base}>

      {/* ══ HERO ══════════════════════════════════════════════════════════ */}
      <div style={{ position: 'relative' }}>
        <ShaderBg />

        {/* Gradient overlay */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'linear-gradient(to bottom, rgba(10,10,10,0.78) 0%, rgba(10,10,10,0.1) 40%, rgba(10,10,10,0.78) 100%)',
        }} />

        {/* Film grain */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.3,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E")`,
        }} />

        {/* NAV */}
        <nav className="cp-nav-inner" style={{
          position: 'relative', zIndex: 2,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 40px',
        }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 19, color: gold, letterSpacing: '0.05em' }}>
            Organized.
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 300, color: muted, marginLeft: 6 }}>
              by {ws.name}
            </span>
          </div>
          <button
            className="cp-nav-book"
            onClick={() => { setTab('book'); setTimeout(() => document.getElementById('cp-tabs')?.scrollIntoView({ behavior: 'smooth' }), 50) }}
            style={{ background: gold, color: '#0A0A0A', border: 'none', padding: '10px 22px', fontSize: 12, fontWeight: 500, letterSpacing: '0.06em', cursor: 'pointer', borderRadius: 2, fontFamily: 'inherit' }}
          >
            Book Now
          </button>
        </nav>

        {/* HERO CONTENT */}
        <div className="cp-hero-content" style={{
          position: 'relative', zIndex: 2,
          display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
          padding: '60px 40px 96px',
        }}>
          {/* Location badge */}
          <div className="cp-a1" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.18)',
            borderRadius: 100, padding: '6px 16px',
            fontSize: 10, color: '#E8C97A', letterSpacing: '0.14em', textTransform: 'uppercase',
            marginBottom: 28,
          }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: gold, animation: 'cpPulse 2s infinite', flexShrink: 0 }} />
            {ws.city || ws.location || 'Hair Studio'}
          </div>

          {/* Studio name */}
          <h1 className="cp-a2" style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(48px, 7vw, 80px)',
            fontWeight: 500, lineHeight: 1.05, marginBottom: 12,
          }}>
            {ws.name}
          </h1>

          {/* Tagline */}
          {ws.tagline && (
            <p className="cp-a3" style={{
              fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase',
              color: muted, marginBottom: 28,
            }}>
              {ws.tagline}
            </p>
          )}

          {/* Bio */}
          {(ws.bio || ws.description) && (
            <p className="cp-a3" style={{
              fontSize: 15, lineHeight: 1.9, color: soft,
              maxWidth: 440, marginBottom: 36, fontWeight: 300,
            }}>
              {ws.bio || ws.description}
            </p>
          )}

          {/* Socials */}
          {socials.length > 0 && (
            <div className="cp-a4" style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
              {socials.map(({ key, Icon, label }) => (
                <a
                  key={key}
                  href={ws[key]}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="cp-social"
                  style={{ color: 'rgba(245,240,232,0.4)', display: 'flex', lineHeight: 0 }}
                >
                  <Icon />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ══ TABS ══════════════════════════════════════════════════════════ */}
      <div id="cp-tabs" style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: '#111111', borderBottom: '1px solid #1e1e1e',
        display: 'flex', justifyContent: 'center',
        boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
      }}>
        {[['book','Booking'], ['shop','Shop'], ['learn','Learn']].map(([k, l]) => (
          <button
            key={k}
            className="cp-tab-btn"
            onClick={() => setTab(k)}
            style={{
              background: 'none', border: 'none',
              padding: '16px 32px',
              fontSize: 11, fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase',
              color: tab === k ? gold : muted,
              cursor: 'pointer', fontFamily: 'inherit',
              borderBottom: tab === k ? `2px solid ${gold}` : '2px solid transparent',
            }}
          >
            {l}
          </button>
        ))}
      </div>

      {/* ══ CONTENT ═══════════════════════════════════════════════════════ */}
      <div className="cp-main-pad" style={{ maxWidth: 1100, margin: '0 auto', padding: '80px 40px 140px' }}>

        {/* ── BOOKING TAB ─────────────────────────────────────────────── */}
        {tab === 'book' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 96 }}>

            {/* Portfolio — visible only when photos exist */}
            {portfolio.length > 0 && (
              <section>
                <SectionHeader label="Portfolio" title="The" italic="work" />
                <div className="cp-portfolio-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  {portfolio.map((ph, i) => (
                    <div key={ph.id || i} className="cp-portfolio-item"
                      style={{ aspectRatio: '1', borderRadius: 2, background: '#1a1a1a' }}>
                      <img src={ph.url} alt="" />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Services */}
            <section>
              <SectionHeader label="What We Offer" title="Services" />
              {services.length === 0 ? (
                <p style={{ color: muted, fontSize: 13 }}>No services listed yet.</p>
              ) : (
                <div className="cp-services-grid" style={{
                  display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '1px', background: '#1e1e1e', border: '1px solid #1e1e1e',
                }}>
                  {services.map((svc, i) => (
                    <div
                      key={svc.id || i}
                      className="cp-service-card"
                      style={{ background: '#111111', padding: '36px 28px', position: 'relative', overflow: 'hidden' }}
                      onClick={() => {
                        setBookModal(svc); setBooked(false)
                        setBookForm({ name:'', email:'', phone:'', date:'', time:'', notes:'' })
                      }}
                    >
                      <div className="cp-service-line" style={{
                        position: 'absolute', bottom: 0, left: 0, right: 0,
                        height: 2, background: gold, transform: 'scaleX(0)', transformOrigin: 'left',
                      }} />
                      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 19, fontWeight: 500, marginBottom: 8 }}>
                        {svc.name}
                      </div>
                      <div style={{ fontSize: 11, color: muted, letterSpacing: '0.08em', marginBottom: 20 }}>
                        {svc.duration_min ? `${svc.duration_min} min` : '\u00A0'}
                      </div>
                      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, color: gold }}>
                        {svc.is_free ? 'Free' : `$${svc.price}`}
                      </div>
                      <div style={{ marginTop: 18, fontSize: 10, letterSpacing: '0.12em', color: muted, textTransform: 'uppercase' }}>
                        Book &rarr;
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Reviews */}
            <section>
              <SectionHeader label="Client Love" title="What they" italic="say" />
              {reviews.length === 0 ? (
                <div style={{ padding: '48px 40px', border: '1px solid #1a1a1a', textAlign: 'center' }}>
                  <p style={{ fontSize: 13, color: muted, lineHeight: 1.9 }}>
                    Reviews from clients will appear here.<br />
                    After each appointment, clients receive an invitation to share their experience.
                  </p>
                </div>
              ) : (
                <div className="cp-reviews-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                  {reviews.map((rv, i) => (
                    <div key={rv.id || i} style={{ background: '#111', border: '1px solid #1e1e1e', padding: '28px 28px 24px', borderRadius: 2 }}>
                      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 44, color: 'rgba(201,168,76,0.12)', lineHeight: 1, marginBottom: 12 }}>
                        &ldquo;
                      </div>
                      <p style={{ fontSize: 13, lineHeight: 1.9, color: soft, fontWeight: 300, marginBottom: 20 }}>
                        {rv.body || rv.text || rv.comment}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 34, height: 34, borderRadius: '50%',
                          background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 12, color: gold, fontWeight: 500,
                        }}>
                          {(rv.client_name || rv.name || '?')[0].toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 500 }}>{rv.client_name || rv.name}</div>
                          <Stars n={rv.rating || 5} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Good to Know — FAQ */}
            <section>
              <SectionHeader label="Good to Know" title="FAQ" />
              <div style={{ borderTop: '1px solid #1e1e1e' }}>
                {FAQ_ITEMS.map((item, i) => (
                  <div
                    key={i}
                    className="cp-faq-row"
                    style={{ borderBottom: '1px solid #1e1e1e' }}
                    onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  >
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '22px 4px', gap: 16,
                    }}>
                      <div style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.4 }}>{item.q}</div>
                      <div style={{
                        fontSize: 22, color: gold, flexShrink: 0, fontWeight: 300, lineHeight: 1,
                        transform: faqOpen === i ? 'rotate(45deg)' : 'none',
                        transition: 'transform .2s',
                      }}>+</div>
                    </div>
                    {faqOpen === i && (
                      <div style={{
                        paddingBottom: 24, paddingRight: 32,
                        fontSize: 13, lineHeight: 1.9, color: muted, fontWeight: 300,
                      }}>
                        {item.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* ── SHOP TAB ────────────────────────────────────────────────── */}
        {tab === 'shop' && (
          <div>
            <SectionHeader label="Available Now" title="Products" />
            {products.length === 0 ? (
              <p style={{ color: muted, fontSize: 13 }}>No products listed yet.</p>
            ) : (
              <div className="cp-products-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {products.map(p => (
                  <div
                    key={p.id}
                    className="cp-product-card"
                    style={{ border: '1px solid #1e1e1e', background: '#111', borderRadius: 2 }}
                    onClick={() => setProductModal(p)}
                  >
                    {p.image_url ? (
                      <img src={p.image_url} alt={p.name} style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', display: 'block' }} />
                    ) : (
                      <div style={{
                        width: '100%', aspectRatio: '1', background: '#1a1a1a',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 10, color: 'rgba(245,240,232,0.1)', letterSpacing: '0.12em', textTransform: 'uppercase',
                      }}>No photo</div>
                    )}
                    <div style={{ padding: '20px 20px 24px' }}>
                      <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 6 }}>{p.name}</div>
                      {p.description && (
                        <div style={{ fontSize: 12, color: muted, lineHeight: 1.7, marginBottom: 14, fontWeight: 300 }}>
                          {p.description.slice(0, 90)}{p.description.length > 90 ? '...' : ''}
                        </div>
                      )}
                      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: gold }}>${p.price}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── LEARN TAB ───────────────────────────────────────────────── */}
        {tab === 'learn' && (
          <div>
            <SectionHeader label="Formations" title="Learn" />
            {offerings.length === 0 ? (
              <p style={{ color: muted, fontSize: 13 }}>No formations available yet.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {offerings.map(o => (
                  <div
                    key={o.id}
                    className="cp-product-card"
                    style={{ border: '1px solid #1e1e1e', background: '#111', borderRadius: 2 }}
                    onClick={() => setLearnModal(o)}
                  >
                    {o.image_url ? (
                      <img src={o.image_url} alt={o.name || o.title} style={{ width: '100%', aspectRatio: '1.75', objectFit: 'cover', display: 'block' }} />
                    ) : (
                      <div style={{
                        width: '100%', aspectRatio: '1.75', background: '#1a1a1a',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 10, color: 'rgba(245,240,232,0.1)', letterSpacing: '0.12em', textTransform: 'uppercase',
                      }}>No photo</div>
                    )}
                    <div style={{ padding: '20px 20px 24px' }}>
                      <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 6 }}>{o.name || o.title}</div>
                      {o.description && (
                        <div style={{ fontSize: 12, color: muted, lineHeight: 1.7, marginBottom: 14, fontWeight: 300 }}>
                          {o.description.slice(0, 90)}{o.description.length > 90 ? '...' : ''}
                        </div>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        {o.price && <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: gold }}>${o.price}</div>}
                        {(o.duration || o.duration_min) && (
                          <div style={{ fontSize: 11, color: muted, letterSpacing: '0.08em' }}>
                            {o.duration || `${o.duration_min} min`}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ══ FOOTER ════════════════════════════════════════════════════════ */}
      <div className="cp-footer-inner" style={{
        borderTop: '1px solid #1a1a1a', padding: '28px 40px',
        background: '#0A0A0A',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, color: gold }}>Organized.</div>
        <div style={{ fontSize: 11, color: muted }}>
          Powered by{' '}
          <a href="https://beorganized.io" target="_blank" rel="noopener noreferrer"
            style={{ color: 'rgba(245,240,232,0.4)', textDecoration: 'none' }}>
            beorganized.io
          </a>
        </div>
      </div>

      {/* ══ BOOKING MODAL ═════════════════════════════════════════════════ */}
      {bookModal && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(5px)', zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
          onClick={() => setBookModal(null)}
        >
          <div
            style={{ background: '#111', width: '100%', maxWidth: 520, borderRadius: '12px 12px 0 0', padding: '2rem 1.75rem', maxHeight: '92vh', overflowY: 'auto', border: '1px solid #1e1e1e', borderBottom: 'none' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ width: 30, height: 3, borderRadius: 2, background: '#2a2a2a', margin: '-0.25rem auto 1.75rem' }} />
            {booked ? (
              <div style={{ textAlign: 'center', padding: '2rem 0 1rem' }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', border: `1px solid rgba(201,168,76,0.3)`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: gold, fontSize: 20 }}>
                  &#10003;
                </div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.4rem', marginBottom: 8 }}>Request sent</div>
                <div style={{ fontSize: 13, color: muted, lineHeight: 1.8, maxWidth: 280, margin: '0 auto' }}>
                  Your request for <strong style={{ color: soft }}>{bookModal.name}</strong> has been sent. The studio will confirm shortly.
                </div>
                <button onClick={() => setBookModal(null)}
                  style={{ marginTop: 28, background: gold, color: '#0A0A0A', border: 'none', padding: '12px 28px', fontSize: 13, fontWeight: 500, cursor: 'pointer', borderRadius: 2, fontFamily: 'inherit', letterSpacing: '0.05em' }}>
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={submitBooking}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.4rem', marginBottom: 4 }}>{bookModal.name}</div>
                <div style={{ fontSize: 12, color: muted, marginBottom: 24, display: 'flex', gap: 12 }}>
                  {bookModal.duration_min && <span>{bookModal.duration_min} min</span>}
                  {bookModal.price > 0 && <span>&mdash; ${bookModal.price}</span>}
                </div>
                {[
                  ['name',  'Full name',       'text',  true ],
                  ['email', 'Email',            'email', false],
                  ['phone', 'Phone',            'tel',   false],
                  ['date',  'Preferred date',   'date',  true ],
                  ['time',  'Preferred time',   'time',  true ],
                  ['notes', 'Notes (optional)', 'text',  false],
                ].map(([k, l, t, req]) => (
                  <div key={k} style={{ marginBottom: 12 }}>
                    <label style={{ display: 'block', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: muted, marginBottom: 6 }}>{l}</label>
                    <input type={t} value={bookForm[k]} onChange={e => setBookForm(f => ({ ...f, [k]: e.target.value }))} required={req}
                      style={{ width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#F5F0E8', padding: '12px 14px', fontSize: 14, fontFamily: 'inherit', borderRadius: 2, outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                ))}
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 20 }}>
                  <button type="button" onClick={() => setBookModal(null)}
                    style={{ padding: '12px 20px', border: '1px solid #2a2a2a', background: 'none', color: muted, fontSize: 13, cursor: 'pointer', borderRadius: 2, fontFamily: 'inherit' }}>
                    Cancel
                  </button>
                  <button type="submit" disabled={booking}
                    style={{ background: gold, color: '#0A0A0A', border: 'none', padding: '12px 24px', fontSize: 13, fontWeight: 500, cursor: 'pointer', borderRadius: 2, fontFamily: 'inherit', letterSpacing: '0.04em', opacity: booking ? 0.6 : 1 }}>
                    {booking ? 'Sending...' : 'Send request \u2192'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ══ PRODUCT MODAL ═════════════════════════════════════════════════ */}
      {productModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(5px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={() => setProductModal(null)}>
          <div style={{ background: '#111', border: '1px solid #1e1e1e', width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto', borderRadius: 4 }}
            onClick={e => e.stopPropagation()}>
            {productModal.image_url && (
              <img src={productModal.image_url} alt={productModal.name}
                style={{ width: '100%', aspectRatio: '1.4', objectFit: 'cover', display: 'block' }} />
            )}
            <div style={{ padding: 28 }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 500, marginBottom: 8 }}>{productModal.name}</div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, color: gold, marginBottom: 20 }}>${productModal.price}</div>
              {productModal.description && (
                <p style={{ fontSize: 13, lineHeight: 1.9, color: muted, fontWeight: 300, marginBottom: 24 }}>{productModal.description}</p>
              )}
              <button
                onClick={() => { notify(`Contact the studio to order ${productModal.name}.`); setProductModal(null) }}
                style={{ width: '100%', background: gold, color: '#0A0A0A', border: 'none', padding: 14, fontSize: 13, fontWeight: 500, cursor: 'pointer', borderRadius: 2, fontFamily: 'inherit', letterSpacing: '0.05em' }}>
                Enquire to Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ LEARN MODAL ═══════════════════════════════════════════════════ */}
      {learnModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(5px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={() => setLearnModal(null)}>
          <div style={{ background: '#111', border: '1px solid #1e1e1e', width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto', borderRadius: 4 }}
            onClick={e => e.stopPropagation()}>
            {learnModal.image_url && (
              <img src={learnModal.image_url} alt={learnModal.name || learnModal.title}
                style={{ width: '100%', aspectRatio: '1.75', objectFit: 'cover', display: 'block' }} />
            )}
            <div style={{ padding: 28 }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 500, marginBottom: 8 }}>{learnModal.name || learnModal.title}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                {learnModal.price && <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, color: gold }}>${learnModal.price}</div>}
                {(learnModal.duration || learnModal.duration_min) && (
                  <div style={{ fontSize: 11, color: muted, letterSpacing: '0.08em' }}>
                    {learnModal.duration || `${learnModal.duration_min} min`}
                  </div>
                )}
              </div>
              {learnModal.description && (
                <p style={{ fontSize: 13, lineHeight: 1.9, color: muted, fontWeight: 300, marginBottom: 24 }}>{learnModal.description}</p>
              )}
              <button
                onClick={() => { notify('Contact the studio to enroll in this formation.'); setLearnModal(null) }}
                style={{ width: '100%', background: gold, color: '#0A0A0A', border: 'none', padding: 14, fontSize: 13, fontWeight: 500, cursor: 'pointer', borderRadius: 2, fontFamily: 'inherit', letterSpacing: '0.05em' }}>
                Enquire to Enroll
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ TOAST ═════════════════════════════════════════════════════════ */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 28, right: 24,
          background: '#111', color: '#F5F0E8',
          padding: '12px 20px', borderRadius: 2,
          fontSize: 13, zIndex: 300,
          borderLeft: `2px solid ${gold}`,
          boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
          maxWidth: 'calc(100vw - 3rem)',
        }}>
          {toast}
        </div>
      )}
    </div>
  )
}
