import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'

// ─── WebGL Shader Wave Background ────────────────────────────────────────────
function ShaderHero({ children }) {
  const canvasRef = useRef(null)
  const rafRef    = useRef(null)
  const glRef     = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    if (!gl) return
    glRef.current = gl

    const vert = `
      attribute vec2 a_position;
      void main() { gl_Position = vec4(a_position, 0.0, 1.0); }
    `
    const frag = `
      precision mediump float;
      uniform float u_time;
      uniform vec2  u_res;

      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
      }
      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(
          mix(hash(i), hash(i + vec2(1,0)), u.x),
          mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), u.x),
          u.y
        );
      }
      float fbm(vec2 p) {
        float v = 0.0; float a = 0.5;
        vec2  shift = vec2(100.0);
        mat2  rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
        for (int i = 0; i < 6; i++) {
          v += a * noise(p);
          p = rot * p * 2.0 + shift;
          a *= 0.5;
        }
        return v;
      }

      void main() {
        vec2 uv  = gl_FragCoord.xy / u_res;
        vec2 q   = vec2(fbm(uv + 0.02 * u_time), fbm(uv + vec2(1.0)));
        vec2 r   = vec2(
          fbm(uv + 1.0 * q + vec2(1.7, 9.2) + 0.15 * u_time),
          fbm(uv + 1.0 * q + vec2(8.3, 2.8) + 0.126 * u_time)
        );
        float f  = fbm(uv + r);

        // Warm palette: deep espresso → warm caramel → ivory champagne
        vec3 col = mix(
          vec3(0.07, 0.05, 0.03),   // espresso
          vec3(0.48, 0.33, 0.18),   // caramel
          clamp(f * f * 4.0, 0.0, 1.0)
        );
        col = mix(col, vec3(0.72, 0.60, 0.42), clamp(length(q), 0.0, 1.0));
        col = mix(col, vec3(0.91, 0.85, 0.72), clamp(length(r.x), 0.0, 1.0));
        col = (f * f * f + 0.6 * f * f + 0.5 * f) * col;

        // slight vignette
        vec2  vig = uv * (1.0 - uv.yx);
        float vf  = pow(vig.x * vig.y * 15.0, 0.25);
        col *= vf;

        gl_FragColor = vec4(col, 1.0);
      }
    `

    function compile(type, src) {
      const s = gl.createShader(type)
      gl.shaderSource(s, src)
      gl.compileShader(s)
      return s
    }
    const prog = gl.createProgram()
    gl.attachShader(prog, compile(gl.VERTEX_SHADER,   vert))
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, frag))
    gl.linkProgram(prog)
    gl.useProgram(prog)

    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER,
      new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW)

    const loc = gl.getAttribLocation(prog, 'a_position')
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)

    const uTime = gl.getUniformLocation(prog, 'u_time')
    const uRes  = gl.getUniformLocation(prog, 'u_res')

    function resize() {
      canvas.width  = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      gl.viewport(0, 0, canvas.width, canvas.height)
    }
    resize()
    window.addEventListener('resize', resize)

    const start = performance.now()
    function draw() {
      gl.uniform1f(uTime, (performance.now() - start) / 1000)
      gl.uniform2f(uRes, canvas.width, canvas.height)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      rafRef.current = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Shader canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          display: 'block',
        }}
      />
      {/* Gradient overlays for text readability */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to bottom, rgba(13,12,10,0.45) 0%, rgba(13,12,10,0.15) 40%, rgba(13,12,10,0.72) 100%)',
        pointerEvents: 'none',
      }} />
      {/* Content sits on top */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        {children}
      </div>
    </div>
  )
}

// ─── Main ClientPage ──────────────────────────────────────────────────────────
export default function ClientPage() {
  const { slug } = useParams()

  const [workspace, setWorkspace] = useState(null)
  const [services,  setServices]  = useState([])
  const [products,  setProducts]  = useState([])
  const [tab,       setTab]       = useState('book')
  const [modal,     setModal]     = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [notFound,  setNotFound]  = useState(false)
  const [toast,     setToast]     = useState('')
  const [bookForm,  setBookForm]  = useState({ name:'', phone:'', date:'', time:'', notes:'' })
  const [booking,   setBooking]   = useState(false)
  const [booked,    setBooked]    = useState(false)

  function notify(msg) { setToast(msg); setTimeout(() => setToast(''), 3500) }

  useEffect(() => { loadProfile() }, [slug])

  async function loadProfile() {
    const { data: ws } = await supabase
      .from('workspaces').select('*').eq('slug', slug).single()
    if (!ws) { setNotFound(true); setLoading(false); return }
    setWorkspace(ws)
    const [{ data: svc }, { data: prod }] = await Promise.all([
      supabase.from('services').select('*').eq('workspace_id', ws.id).eq('is_active', true).order('display_order'),
      supabase.from('products').select('*').eq('workspace_id', ws.id).eq('is_active', true),
    ])
    setServices(svc || [])
    setProducts(prod || [])
    setLoading(false)
  }

  async function submitBooking(e) {
    e.preventDefault()
    if (!bookForm.name || !bookForm.date || !bookForm.time) return
    setBooking(true)
    const scheduledAt = new Date(`${bookForm.date}T${bookForm.time}:00`)
    const { error } = await supabase.from('appointments').insert({
      workspace_id: workspace.id,
      client_name:  bookForm.name,
      client_phone: bookForm.phone,
      notes: `Service: ${modal.name}.${bookForm.notes ? ' ' + bookForm.notes : ''}`,
      scheduled_at: scheduledAt.toISOString(),
      amount: modal.price,
      status: 'pending',
    })
    if (error) { notify('Something went wrong. Please try again.'); setBooking(false); return }
    setBooked(true)
    setBooking(false)
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: '#0d0c0a',
    }}>
      <div style={{
        fontFamily: 'Playfair Display, Georgia, serif',
        fontSize: '1.6rem', color: '#b5893a',
        letterSpacing: '0.04em',
        animation: 'pulse 1.6s ease-in-out infinite',
      }}>Organized.</div>
      <style>{`@keyframes pulse{0%,100%{opacity:.4}50%{opacity:1}}`}</style>
    </div>
  )

  // ── 404 ────────────────────────────────────────────────────────────────────
  if (notFound) return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: '#0d0c0a', color: '#fff', textAlign: 'center', padding: '2rem',
    }}>
      <div style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: '3.5rem', color: '#b5893a', marginBottom: '1rem' }}>404</div>
      <div style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: '1.4rem', marginBottom: '.5rem' }}>Studio not found</div>
      <div style={{ fontSize: '.82rem', color: 'rgba(255,255,255,.35)' }}>Check the link and try again.</div>
    </div>
  )

  const initial = workspace.name?.[0]?.toUpperCase() || '?'

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ background: '#faf8f5', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>

      {/* ── HERO with Shader ─────────────────────────────────────────────── */}
      <ShaderHero>
        <div style={{
          padding: '3.5rem 2rem 3rem',
          textAlign: 'center',
          minHeight: '280px',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: '0.75rem',
        }}>
          {/* Avatar */}
          {workspace.logo_url ? (
            <img
              src={workspace.logo_url}
              alt={workspace.name}
              style={{
                width: 72, height: 72, borderRadius: '50%',
                border: '2px solid rgba(181,137,58,0.6)',
                objectFit: 'cover',
                boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
              }}
            />
          ) : (
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: 'rgba(255,255,255,0.08)',
              border: '1.5px solid rgba(181,137,58,0.5)',
              backdropFilter: 'blur(8px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'Playfair Display, Georgia, serif',
              fontSize: '1.8rem', color: '#e8d5a8',
              boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
            }}>
              {initial}
            </div>
          )}

          {/* Studio name */}
          <div style={{
            fontFamily: 'Playfair Display, Georgia, serif',
            fontSize: 'clamp(1.8rem, 6vw, 2.8rem)',
            color: '#fff',
            fontWeight: 400,
            letterSpacing: '-0.01em',
            lineHeight: 1.15,
            textShadow: '0 2px 16px rgba(0,0,0,0.4)',
          }}>
            {workspace.name}
          </div>

          {/* Tagline */}
          {(workspace.tagline || workspace.location) && (
            <div style={{
              fontSize: '.82rem',
              color: 'rgba(255,255,255,0.55)',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              maxWidth: 320,
            }}>
              {workspace.tagline || workspace.location}
            </div>
          )}

          {/* Divider dot */}
          <div style={{
            width: 6, height: 6, borderRadius: '50%',
            background: '#b5893a',
            marginTop: '0.25rem',
            boxShadow: '0 0 12px rgba(181,137,58,0.7)',
          }} />
        </div>
      </ShaderHero>

      {/* ── TABS ─────────────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex',
        background: '#fff',
        borderBottom: '1px solid #e8e4dd',
        justifyContent: 'center',
        position: 'sticky', top: 0,
        zIndex: 50,
        boxShadow: '0 1px 12px rgba(0,0,0,0.04)',
      }}>
        {[['book','Book a service'], ['shop','Shop']].map(([k, l]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            style={{
              padding: '.9rem 2rem',
              fontSize: '.8rem',
              fontWeight: 600,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              color: tab === k ? '#0d0c0a' : '#9a9490',
              cursor: 'pointer',
              border: 'none',
              background: 'none',
              borderBottom: tab === k ? '2px solid #b5893a' : '2px solid transparent',
              transition: 'all .15s',
              fontFamily: 'inherit',
            }}
          >
            {l}
          </button>
        ))}
      </div>

      {/* ── CONTENT ──────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '2.5rem 1.25rem 6rem' }}>

        {/* BOOK TAB */}
        {tab === 'book' && (
          <>
            <div style={{
              fontFamily: 'Playfair Display, Georgia, serif',
              fontSize: '1.25rem', fontWeight: 400,
              color: '#1a1814', marginBottom: '1.25rem',
              letterSpacing: '-0.01em',
            }}>
              Services
            </div>

            {services.length === 0 ? (
              <div style={{ color: '#9a9490', fontSize: '.85rem', textAlign: 'center', padding: '3rem 0' }}>
                No services listed yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '.7rem' }}>
                {services.map((svc, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '1rem',
                      padding: '1.1rem 1.25rem',
                      border: '1px solid #e8e4dd',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      background: '#fff',
                      transition: 'border-color .15s, box-shadow .15s',
                    }}
                    onClick={() => { setModal(svc); setBooked(false); setBookForm({ name:'', phone:'', date:'', time:'', notes:'' }) }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor='#b5893a'; e.currentTarget.style.boxShadow='0 2px 12px rgba(181,137,58,0.1)' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor='#e8e4dd'; e.currentTarget.style.boxShadow='none' }}
                  >
                    <div style={{ width: 3, height: 38, borderRadius: 2, background: '#e8d5a8', flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '.9rem', color: '#1a1814' }}>{svc.name}</div>
                      <div style={{ fontSize: '.74rem', color: '#9a9490', marginTop: '.1rem' }}>
                        {svc.duration_min ? `${svc.duration_min} min` : ''}
                        {svc.duration_min && svc.description ? ' · ' : ''}
                        {svc.description || ''}
                      </div>
                    </div>
                    <div style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: '1.15rem', color: '#1a1814', flexShrink: 0 }}>
                      {svc.is_free ? 'Free' : `$${svc.price}`}
                    </div>
                    <button style={{
                      background: '#0d0c0a', color: '#fff', border: 'none',
                      borderRadius: '7px', padding: '.45rem .95rem',
                      fontSize: '.74rem', fontWeight: 600, cursor: 'pointer',
                      fontFamily: 'inherit', letterSpacing: '0.04em',
                      flexShrink: 0,
                    }}>
                      Book
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* SHOP TAB */}
        {tab === 'shop' && (
          <>
            <div style={{
              fontFamily: 'Playfair Display, Georgia, serif',
              fontSize: '1.25rem', fontWeight: 400,
              color: '#1a1814', marginBottom: '1.25rem',
              letterSpacing: '-0.01em',
            }}>
              Products
            </div>

            {products.length === 0 ? (
              <div style={{ color: '#9a9490', fontSize: '.85rem', textAlign: 'center', padding: '3rem 0' }}>
                No products available yet.
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                gap: '1rem',
              }}>
                {products.map(p => (
                  <div key={p.id} style={{
                    border: '1px solid #e8e4dd', borderRadius: '10px',
                    overflow: 'hidden', background: '#fff',
                  }}>
                    {p.image_url ? (
                      <img src={p.image_url} alt={p.name} style={{ width: '100%', height: 130, objectFit: 'cover', display: 'block' }} />
                    ) : (
                      <div style={{
                        height: 130, background: '#f4f1ec',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '.72rem', color: '#b0a898', letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                      }}>
                        No photo
                      </div>
                    )}
                    <div style={{ padding: '.9rem 1rem' }}>
                      <div style={{ fontSize: '.85rem', fontWeight: 600, color: '#1a1814' }}>{p.name}</div>
                      <div style={{
                        fontFamily: 'Playfair Display, Georgia, serif',
                        fontSize: '1.05rem', color: '#1a1814', marginTop: '.2rem',
                      }}>
                        ${p.price}
                      </div>
                      <button
                        style={{
                          width: '100%', marginTop: '.75rem',
                          padding: '.5rem', border: '1px solid #e8e4dd',
                          borderRadius: '7px', background: 'none',
                          fontSize: '.75rem', cursor: 'pointer',
                          fontFamily: 'inherit', color: '#5a5650',
                          fontWeight: 500,
                        }}
                        onClick={() => notify(`Contact the studio to order ${p.name}.`)}
                      >
                        Enquire
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <div style={{
        background: '#0d0c0a', padding: '2rem',
        textAlign: 'center',
        borderTop: '1px solid rgba(255,255,255,0.04)',
      }}>
        <p style={{ fontSize: '.72rem', color: 'rgba(255,255,255,.2)', margin: 0 }}>
          Powered by{' '}
          <a
            href="https://beorganized.io"
            target="_blank" rel="noopener noreferrer"
            style={{ color: 'rgba(255,255,255,.45)', textDecoration: 'none', fontWeight: 600 }}
          >
            Organized.
          </a>
        </p>
      </div>

      {/* ── BOOKING MODAL ────────────────────────────────────────────────── */}
      {modal && (
        <div
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(13,12,10,0.55)',
            backdropFilter: 'blur(4px)',
            zIndex: 100,
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          }}
          onClick={() => setModal(null)}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: '18px 18px 0 0',
              padding: '2rem 1.75rem',
              width: '100%', maxWidth: 520,
              maxHeight: '92vh', overflowY: 'auto',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Drag handle */}
            <div style={{
              width: 36, height: 4, borderRadius: 2,
              background: '#e0dbd4', margin: '-0.5rem auto 1.5rem',
            }} />

            {booked ? (
              <div style={{ textAlign: 'center', padding: '1.5rem 0 1rem' }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%',
                  background: '#f0faf5',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 1.25rem',
                }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2e7d52" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <div style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: '1.5rem', marginBottom: '.5rem' }}>
                  Request sent
                </div>
                <div style={{ fontSize: '.83rem', color: '#7a7672', lineHeight: 1.65, maxWidth: 280, margin: '0 auto' }}>
                  Your booking request for <strong>{modal.name}</strong> has been sent. The studio will confirm shortly.
                </div>
                <button
                  style={{
                    background: '#0d0c0a', color: '#fff', border: 'none',
                    borderRadius: '9px', padding: '.7rem 1.75rem',
                    fontSize: '.83rem', cursor: 'pointer', fontFamily: 'inherit',
                    marginTop: '1.75rem', fontWeight: 600,
                  }}
                  onClick={() => setModal(null)}
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={submitBooking}>
                <div style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: '1.4rem', marginBottom: '.25rem' }}>
                  {modal.name}
                </div>
                <div style={{ fontSize: '.8rem', color: '#9a9490', marginBottom: '1.75rem', display: 'flex', gap: '0.75rem' }}>
                  {modal.duration_min && <span>{modal.duration_min} min</span>}
                  {modal.price > 0 && <span>· ${modal.price}</span>}
                </div>

                {[
                  ['name',  'Full name',        'e.g. Amara Diallo',       'text', true],
                  ['phone', 'Phone number',     '+1 (514) 555-0123',       'tel',  false],
                  ['date',  'Preferred date',   '',                        'date', true],
                  ['time',  'Preferred time',   '',                        'time', true],
                  ['notes', 'Notes (optional)', 'Allergies, preferences…', 'text', false],
                ].map(([key, label, ph, type, req]) => (
                  <div key={key} style={{ marginBottom: '.9rem' }}>
                    <label style={{
                      display: 'block', fontSize: '.73rem',
                      fontWeight: 600, color: '#6a6660',
                      marginBottom: '.35rem', letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                    }}>
                      {label}
                    </label>
                    <input
                      style={{
                        width: '100%', padding: '.7rem .95rem',
                        border: '1px solid #e4e0d8', borderRadius: '8px',
                        fontSize: '1rem', fontFamily: 'inherit',
                        color: '#0d0c0a', outline: 'none',
                        background: '#fdfcfa',
                        boxSizing: 'border-box',
                      }}
                      type={type}
                      value={bookForm[key]}
                      onChange={e => setBookForm(f => ({ ...f, [key]: e.target.value }))}
                      placeholder={ph}
                      required={req}
                    />
                  </div>
                ))}

                <div style={{ display: 'flex', gap: '.65rem', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
                  <button
                    type="button"
                    style={{
                      padding: '.6rem 1.25rem', borderRadius: '8px',
                      border: '1px solid #d8d4cc', fontSize: '.82rem',
                      cursor: 'pointer', background: '#fff',
                      fontFamily: 'inherit', color: '#6a6660', fontWeight: 500,
                    }}
                    onClick={() => setModal(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      background: '#0d0c0a', color: '#fff', border: 'none',
                      borderRadius: '8px', padding: '.6rem 1.5rem',
                      fontSize: '.82rem', fontWeight: 600,
                      cursor: 'pointer', fontFamily: 'inherit',
                      opacity: booking ? 0.6 : 1,
                    }}
                    disabled={booking}
                  >
                    {booking ? 'Sending…' : 'Send request'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ── TOAST ────────────────────────────────────────────────────────── */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '1.75rem', right: '1.5rem',
          background: '#0d0c0a', color: '#fff',
          padding: '.85rem 1.4rem', borderRadius: '9px',
          fontSize: '.82rem', zIndex: 200,
          borderLeft: '3px solid #b5893a',
          boxShadow: '0 4px 24px rgba(0,0,0,0.25)',
          maxWidth: 'calc(100vw - 3rem)',
        }}>
          {toast}
        </div>
      )}
    </div>
  )
}
