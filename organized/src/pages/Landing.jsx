import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal')
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') })
    }, { threshold: 0.12 })
    els.forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400;1,500&family=DM+Sans:wght@300;400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root { --ink:#0d0c0a; --ink-2:#3a3835; --ink-3:#7a7672; --gold:#b5893a; --gold-lt:#e8d9bf; --cream:#f7f5f0; --white:#ffffff; --border:#e4e0d8; }
  html { scroll-behavior: smooth; }
  body { font-family: 'DM Sans', sans-serif; background: var(--white); color: var(--ink); overflow-x: hidden; }
  .serif { font-family: 'Playfair Display', serif; }

  /* REVEAL */
  .reveal { opacity: 0; transform: translateY(24px); transition: opacity .6s ease, transform .6s ease; }
  .reveal.visible { opacity: 1; transform: translateY(0); }
  .reveal-delay-1 { transition-delay: .1s; }
  .reveal-delay-2 { transition-delay: .2s; }
  .reveal-delay-3 { transition-delay: .3s; }

  /* NAV */
  .nav { position:fixed; top:0; left:0; right:0; z-index:100; display:flex; align-items:center; justify-content:space-between; padding:0 3rem; height:60px; background:rgba(13,12,10,.92); backdrop-filter:blur(12px); border-bottom:1px solid rgba(255,255,255,.06); }
  .nav-logo { font-family:'Playfair Display',serif; font-size:1.3rem; font-weight:500; color:#fff; letter-spacing:-.01em; cursor:pointer; }
  .nav-logo span { color:var(--gold); }
  .nav-links { display:flex; gap:2rem; }
  .nav-link { font-size:.82rem; color:rgba(255,255,255,.5); cursor:pointer; transition:color .15s; font-weight:400; letter-spacing:.02em; }
  .nav-link:hover { color:#fff; }
  .nav-right { display:flex; gap:1rem; align-items:center; }
  .nav-signin { font-size:.82rem; color:rgba(255,255,255,.45); cursor:pointer; transition:color .15s; }
  .nav-signin:hover { color:#fff; }
  .nav-cta { background:var(--gold); color:#fff; border:none; border-radius:7px; padding:.5rem 1.25rem; font-size:.82rem; font-weight:500; cursor:pointer; font-family:inherit; transition:background .15s; letter-spacing:.02em; }
  .nav-cta:hover { background:#9e7630; }

  /* HERO */
  .hero { min-height:100vh; background:var(--ink); display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:8rem 2rem 5rem; position:relative; overflow:hidden; }
  .hero-grain { position:absolute; inset:0; opacity:.04; background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E"); pointer-events:none; }
  .hero-glow { position:absolute; top:-10%; left:50%; transform:translateX(-50%); width:700px; height:500px; background:radial-gradient(ellipse, rgba(181,137,58,.18) 0%, transparent 70%); pointer-events:none; }
  .hero-tag { display:inline-flex; align-items:center; gap:.5rem; border:1px solid rgba(181,137,58,.3); border-radius:20px; padding:.35rem 1rem; font-size:.72rem; font-weight:500; color:var(--gold); letter-spacing:.08em; text-transform:uppercase; margin-bottom:2rem; position:relative; z-index:1; animation:fadeUp .6s ease both; }
  .hero-tag-dot { width:5px; height:5px; border-radius:50%; background:var(--gold); }
  .hero-h1 { font-family:'Playfair Display',serif; font-size:clamp(2.8rem,6vw,5.2rem); font-weight:500; color:#fff; line-height:1.08; letter-spacing:-.02em; max-width:820px; position:relative; z-index:1; animation:fadeUp .6s .1s ease both; }
  .hero-h1 em { font-style:italic; color:var(--gold); }
  .hero-sub { font-size:1.05rem; color:rgba(255,255,255,.45); max-width:520px; margin:1.5rem auto 0; line-height:1.7; font-weight:300; position:relative; z-index:1; animation:fadeUp .6s .2s ease both; }
  .hero-actions { display:flex; gap:1rem; justify-content:center; margin-top:2.5rem; position:relative; z-index:1; animation:fadeUp .6s .3s ease both; flex-wrap:wrap; }
  .btn-hero-primary { background:var(--gold); color:#fff; border:none; border-radius:8px; padding:.85rem 2rem; font-size:.9rem; font-weight:500; cursor:pointer; font-family:inherit; transition:all .2s; letter-spacing:.02em; }
  .btn-hero-primary:hover { background:#9e7630; transform:translateY(-1px); box-shadow:0 8px 24px rgba(181,137,58,.3); }
  .btn-hero-ghost { background:transparent; color:rgba(255,255,255,.6); border:1px solid rgba(255,255,255,.15); border-radius:8px; padding:.85rem 2rem; font-size:.9rem; font-weight:400; cursor:pointer; font-family:inherit; transition:all .2s; letter-spacing:.02em; }
  .btn-hero-ghost:hover { border-color:rgba(255,255,255,.35); color:#fff; }
  .hero-note { font-size:.73rem; color:rgba(255,255,255,.25); margin-top:1rem; position:relative; z-index:1; animation:fadeUp .6s .4s ease both; }

  /* DASHBOARD PREVIEW */
  .hero-preview { position:relative; z-index:1; margin-top:4rem; width:100%; max-width:900px; animation:fadeUp .7s .5s ease both; }
  .preview-frame { background:#1a1815; border:1px solid rgba(255,255,255,.08); border-radius:14px; overflow:hidden; box-shadow:0 40px 80px rgba(0,0,0,.5), 0 0 0 1px rgba(255,255,255,.04); }
  .preview-bar { background:#111; border-bottom:1px solid rgba(255,255,255,.06); height:38px; display:flex; align-items:center; padding:0 1rem; gap:.5rem; }
  .preview-dot { width:9px; height:9px; border-radius:50%; }
  .preview-url { flex:1; background:rgba(255,255,255,.05); border-radius:4px; height:20px; margin:0 1rem; display:flex; align-items:center; padding:0 .6rem; }
  .preview-url span { font-size:.62rem; color:rgba(255,255,255,.25); font-family:monospace; }
  .preview-body { display:flex; height:300px; }
  .preview-sidebar { width:140px; background:#111; border-right:1px solid rgba(255,255,255,.06); padding:.75rem 0; flex-shrink:0; }
  .preview-nav-item { display:flex; align-items:center; gap:.5rem; padding:.45rem .85rem; font-size:.62rem; color:rgba(255,255,255,.3); }
  .preview-nav-item.active { color:var(--gold); background:rgba(181,137,58,.07); border-left:2px solid var(--gold); }
  .preview-nav-dot { width:6px; height:6px; border-radius:50%; background:currentColor; opacity:.5; flex-shrink:0; }
  .preview-main { flex:1; padding:1rem; overflow:hidden; }
  .preview-stat-row { display:grid; grid-template-columns:repeat(4,1fr); gap:.5rem; margin-bottom:.85rem; }
  .preview-stat { background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.06); border-radius:7px; padding:.6rem .75rem; }
  .preview-stat-lbl { font-size:.48rem; color:rgba(255,255,255,.3); text-transform:uppercase; letter-spacing:.06em; margin-bottom:.3rem; }
  .preview-stat-val { font-family:'Playfair Display',serif; font-size:.95rem; color:#fff; }
  .preview-table { background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.06); border-radius:7px; overflow:hidden; }
  .preview-table-head { display:grid; grid-template-columns:2fr 1.5fr 1fr 1fr; padding:.4rem .75rem; border-bottom:1px solid rgba(255,255,255,.06); }
  .preview-th { font-size:.48rem; color:rgba(255,255,255,.25); text-transform:uppercase; letter-spacing:.06em; }
  .preview-row { display:grid; grid-template-columns:2fr 1.5fr 1fr 1fr; padding:.45rem .75rem; border-bottom:1px solid rgba(255,255,255,.04); align-items:center; }
  .preview-row:last-child { border-bottom:none; }
  .preview-td { font-size:.55rem; color:rgba(255,255,255,.5); }
  .preview-td.name { color:rgba(255,255,255,.8); font-weight:500; }
  .preview-td.amt { color:var(--gold); font-weight:600; }
  .preview-badge { display:inline-block; padding:1px 6px; border-radius:10px; font-size:.45rem; font-weight:600; background:rgba(46,125,82,.2); color:#4ade80; }
  .preview-badge.p { background:rgba(202,138,4,.15); color:#fbbf24; }

  /* SECTIONS */
  section { padding:6rem 2rem; }
  .container { max-width:1080px; margin:0 auto; }
  .section-tag { font-size:.72rem; font-weight:600; letter-spacing:.12em; text-transform:uppercase; color:var(--gold); margin-bottom:1rem; }
  .section-title { font-family:'Playfair Display',serif; font-size:clamp(2rem,4vw,3rem); font-weight:500; line-height:1.15; color:var(--ink); }
  .section-title em { font-style:italic; color:var(--gold); }
  .section-sub { font-size:.95rem; color:var(--ink-3); line-height:1.75; max-width:540px; margin-top:1rem; font-weight:300; }

  /* PROBLEM */
  .problem { background:var(--cream); }
  .dm-showcase { display:grid; grid-template-columns:1fr 1fr 1fr; gap:1rem; margin-top:3rem; }
  .dm-card { background:var(--white); border:1px solid var(--border); border-radius:12px; padding:1.25rem; }
  .dm-card-head { display:flex; align-items:center; gap:.6rem; margin-bottom:1rem; padding-bottom:.75rem; border-bottom:1px solid var(--border); }
  .dm-platform { font-size:.7rem; font-weight:600; color:var(--ink-3); letter-spacing:.04em; }
  .dm-dot { width:7px; height:7px; border-radius:50%; background:#22c55e; }
  .dm-messages { display:flex; flex-direction:column; gap:.5rem; }
  .dm-msg { display:flex; gap:.5rem; align-items:flex-start; }
  .dm-av { width:24px; height:24px; border-radius:50%; background:var(--gold-lt); flex-shrink:0; display:flex; align-items:center; justify-content:center; font-size:.58rem; font-weight:600; color:var(--gold); }
  .dm-bubble { background:var(--cream); border-radius:0 8px 8px 8px; padding:.45rem .7rem; font-size:.75rem; color:var(--ink-2); line-height:1.5; max-width:200px; }
  .dm-bubble.sent { background:#1a1a1a; color:rgba(255,255,255,.8); border-radius:8px 0 8px 8px; margin-left:auto; }
  .problem-vs { text-align:center; margin-top:3rem; }
  .vs-line { display:flex; align-items:center; gap:1.5rem; justify-content:center; }
  .vs-rule { flex:1; max-width:200px; height:1px; background:var(--border); }
  .vs-text { font-size:.75rem; font-weight:600; color:var(--ink-3); letter-spacing:.08em; text-transform:uppercase; }

  /* FEATURES */
  .features { background:var(--white); }
  .features-grid { display:grid; grid-template-columns:1fr 1fr; gap:1.5rem; margin-top:3.5rem; }
  .feature-card { border:1px solid var(--border); border-radius:14px; padding:2rem; transition:all .2s; }
  .feature-card:hover { border-color:var(--gold); box-shadow:0 8px 32px rgba(0,0,0,.06); transform:translateY(-2px); }
  .feature-icon { width:42px; height:42px; border-radius:10px; background:#f5f2eb; display:flex; align-items:center; justify-content:center; margin-bottom:1.25rem; }
  .feature-icon svg { width:20px; height:20px; stroke:var(--gold); fill:none; stroke-width:1.5; }
  .feature-name { font-family:'Playfair Display',serif; font-size:1.2rem; font-weight:500; margin-bottom:.5rem; }
  .feature-desc { font-size:.85rem; color:var(--ink-3); line-height:1.7; font-weight:300; }
  .feature-detail { margin-top:1.25rem; display:flex; flex-direction:column; gap:.4rem; }
  .feature-item { display:flex; align-items:center; gap:.6rem; font-size:.8rem; color:var(--ink-2); }
  .feature-check { width:16px; height:16px; border-radius:50%; background:#f0ede7; display:flex; align-items:center; justify-content:center; flex-shrink:0; font-size:.65rem; color:var(--gold); }

  /* HOW */
  .how { background:var(--ink); }
  .how .section-title { color:#fff; }
  .how .section-sub { color:rgba(255,255,255,.4); }
  .steps { display:grid; grid-template-columns:repeat(3,1fr); gap:2rem; margin-top:4rem; position:relative; }
  .steps::before { content:''; position:absolute; top:28px; left:calc(16.6% + 20px); right:calc(16.6% + 20px); height:1px; background:linear-gradient(90deg, var(--gold), transparent 50%, var(--gold)); opacity:.2; }
  .step { text-align:center; }
  .step-num { font-family:'Playfair Display',serif; font-size:3rem; font-weight:400; color:rgba(181,137,58,.2); line-height:1; margin-bottom:1rem; }
  .step-icon { width:56px; height:56px; border-radius:50%; border:1px solid rgba(181,137,58,.25); display:flex; align-items:center; justify-content:center; margin:0 auto .9rem; background:rgba(181,137,58,.06); }
  .step-icon svg { width:22px; height:22px; stroke:var(--gold); fill:none; stroke-width:1.5; }
  .step-title { font-family:'Playfair Display',serif; font-size:1.1rem; color:#fff; font-weight:500; margin-bottom:.5rem; }
  .step-desc { font-size:.82rem; color:rgba(255,255,255,.35); line-height:1.7; font-weight:300; }

  /* PRICING */
  .pricing { background:var(--cream); }
  .pricing-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:1.25rem; margin-top:3.5rem; align-items:start; }
  .plan-card { background:var(--white); border:1px solid var(--border); border-radius:14px; padding:2rem; position:relative; }
  .plan-card.featured { background:var(--ink); border-color:var(--ink); }
  .plan-badge { position:absolute; top:-12px; left:50%; transform:translateX(-50%); background:var(--gold); color:#fff; font-size:.68rem; font-weight:600; letter-spacing:.08em; text-transform:uppercase; padding:.3rem .9rem; border-radius:20px; white-space:nowrap; }
  .plan-name { font-size:.72rem; font-weight:600; letter-spacing:.1em; text-transform:uppercase; color:var(--ink-3); margin-bottom:.75rem; }
  .plan-card.featured .plan-name { color:rgba(255,255,255,.4); }
  .plan-price { font-family:'Playfair Display',serif; font-size:2.8rem; font-weight:500; color:var(--ink); line-height:1; }
  .plan-card.featured .plan-price { color:#fff; }
  .plan-price sup { font-size:1.2rem; vertical-align:top; margin-top:.5rem; display:inline-block; font-family:'DM Sans',sans-serif; font-weight:300; }
  .plan-price sub { font-size:.85rem; font-family:'DM Sans',sans-serif; font-weight:300; color:var(--ink-3); }
  .plan-card.featured .plan-price sub { color:rgba(255,255,255,.3); }
  .plan-desc { font-size:.8rem; color:var(--ink-3); margin-top:.5rem; margin-bottom:1.5rem; font-weight:300; }
  .plan-card.featured .plan-desc { color:rgba(255,255,255,.35); }
  .plan-divider { height:1px; background:var(--border); margin-bottom:1.5rem; }
  .plan-card.featured .plan-divider { background:rgba(255,255,255,.08); }
  .plan-features { display:flex; flex-direction:column; gap:.6rem; margin-bottom:1.75rem; }
  .plan-feat { display:flex; align-items:flex-start; gap:.6rem; font-size:.8rem; color:var(--ink-2); font-weight:300; }
  .plan-card.featured .plan-feat { color:rgba(255,255,255,.6); }
  .plan-feat-check { width:16px; height:16px; border-radius:50%; background:#f0ede7; display:flex; align-items:center; justify-content:center; flex-shrink:0; margin-top:1px; font-size:.65rem; color:var(--gold); }
  .plan-card.featured .plan-feat-check { background:rgba(181,137,58,.2); }
  .plan-feat-x { width:16px; height:16px; border-radius:50%; background:var(--cream); display:flex; align-items:center; justify-content:center; flex-shrink:0; margin-top:1px; font-size:.65rem; color:var(--ink-3); }
  .plan-btn { width:100%; padding:.75rem; border-radius:8px; font-size:.84rem; font-weight:500; cursor:pointer; font-family:inherit; border:none; transition:all .2s; }
  .plan-btn-outline { background:transparent; border:1px solid #d0cec8; color:var(--ink); }
  .plan-btn-outline:hover { border-color:var(--ink); }
  .plan-btn-gold { background:var(--gold); color:#fff; }
  .plan-btn-gold:hover { background:#9e7630; }
  .plan-btn-white { background:#fff; color:var(--ink); }
  .plan-btn-white:hover { background:var(--cream); }

  /* TESTIMONIALS */
  .testimonials { background:var(--white); }
  .testimonials-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:1.25rem; margin-top:3rem; }
  .testi-card { border:1px solid var(--border); border-radius:12px; padding:1.75rem; }
  .testi-quote { font-family:'Playfair Display',serif; font-size:1.5rem; color:var(--gold-lt); line-height:1; margin-bottom:.75rem; }
  .testi-text { font-size:.85rem; color:var(--ink-2); line-height:1.75; font-weight:300; margin-bottom:1.25rem; }
  .testi-author { display:flex; align-items:center; gap:.75rem; }
  .testi-av { width:36px; height:36px; border-radius:50%; background:var(--gold-lt); display:flex; align-items:center; justify-content:center; font-size:.75rem; font-weight:600; color:var(--gold); }
  .testi-name { font-size:.82rem; font-weight:600; }
  .testi-handle { font-size:.72rem; color:var(--ink-3); }

  /* FINAL CTA */
  .final-cta { background:var(--ink); text-align:center; padding:8rem 2rem; position:relative; overflow:hidden; }
  .final-cta::before { content:''; position:absolute; inset:0; background:radial-gradient(ellipse 60% 50% at 50% 100%, rgba(181,137,58,.15), transparent); pointer-events:none; }
  .final-cta .section-title { color:#fff; max-width:640px; margin:0 auto; }
  .final-cta .section-sub { color:rgba(255,255,255,.35); margin:1rem auto 0; }
  .final-cta-actions { display:flex; gap:1rem; justify-content:center; margin-top:2.5rem; flex-wrap:wrap; }

  /* FOOTER */
  .footer { background:#080807; padding:3rem; border-top:1px solid rgba(255,255,255,.06); }
  .footer-inner { max-width:1080px; margin:0 auto; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:1rem; }
  .footer-logo { font-family:'Playfair Display',serif; font-size:1.1rem; color:rgba(255,255,255,.4); }
  .footer-logo span { color:var(--gold); }
  .footer-links { display:flex; gap:2rem; }
  .footer-link { font-size:.75rem; color:rgba(255,255,255,.25); cursor:pointer; transition:color .15s; }
  .footer-link:hover { color:rgba(255,255,255,.5); }
  .footer-copy { font-size:.72rem; color:rgba(255,255,255,.15); }

  @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }

  @media(max-width:768px) {
    .nav { padding:0 1.5rem; }
    .nav-links { display:none; }
    .dm-showcase { grid-template-columns:1fr; }
    .features-grid { grid-template-columns:1fr; }
    .steps { grid-template-columns:1fr; }
    .steps::before { display:none; }
    .pricing-grid { grid-template-columns:1fr; }
    .testimonials-grid { grid-template-columns:1fr; }
    .preview-sidebar { display:none; }
    .preview-stat-row { grid-template-columns:repeat(2,1fr); }
    section { padding:4rem 1.5rem; }
  }
`

const plans = [
  {
    name:'Starter', price:19, desc:'For hairstylists just getting started.', featured:false,
    features:[
      {ok:true, text:'Personalized public profile page'},
      {ok:true, text:'Online appointment booking'},
      {ok:true, text:'Up to 5 services listed'},
      {ok:true, text:'Basic client management'},
      {ok:false, text:'Product shop'},
      {ok:false, text:'Formations & courses'},
      {ok:false, text:'Revenue analytics'},
    ]
  },
  {
    name:'Pro', price:39, desc:'For established stylists growing their brand.', featured:true,
    features:[
      {ok:true, text:'Everything in Starter'},
      {ok:true, text:'Unlimited services'},
      {ok:true, text:'Product shop — sell directly'},
      {ok:true, text:'Formations & course sales'},
      {ok:true, text:'Revenue & client analytics'},
      {ok:true, text:'Automated booking reminders'},
      {ok:false, text:'Custom domain'},
    ]
  },
  {
    name:'Studio', price:69, desc:'For salons and multi-stylist businesses.', featured:false,
    features:[
      {ok:true, text:'Everything in Pro'},
      {ok:true, text:'Custom domain'},
      {ok:true, text:'Up to 5 staff members'},
      {ok:true, text:'Team schedule management'},
      {ok:true, text:'Priority support'},
      {ok:true, text:'White-label — remove Organized branding'},
      {ok:true, text:'Monthly strategy call'},
    ]
  },
]

const testimonials = [
  { text:'Before Organized, I was answering the same DMs every single day. Now clients book themselves, order products, and I wake up to confirmed appointments. I got my life back.', name:'Maya A.', handle:'@elixirbymaya', av:'M' },
  { text:'I launched my Box Braids Masterclass through my Organized page. Made back my subscription fee in the first week. This platform actually makes me money.', name:'Kezia B.', handle:'@keziahairstudio', av:'K' },
  { text:'My clients always comment on how professional my booking page looks. They think I paid a developer thousands. It\'s just Organized.', name:'Nadia L.', handle:'@nadianaturals', av:'N' },
]

export default function Landing() {
  const navigate = useNavigate()
  useReveal()

  return (
    <>
      <style>{css}</style>

      {/* NAV */}
      <nav className="nav">
        <div className="nav-logo" onClick={() => window.scrollTo(0,0)}>Organized<span>.</span></div>
        <div className="nav-links">
          <span className="nav-link" onClick={() => document.getElementById('features')?.scrollIntoView({behavior:'smooth'})}>Features</span>
          <span className="nav-link" onClick={() => document.getElementById('how')?.scrollIntoView({behavior:'smooth'})}>How it works</span>
          <span className="nav-link" onClick={() => document.getElementById('pricing')?.scrollIntoView({behavior:'smooth'})}>Pricing</span>
        </div>
        <div className="nav-right">
          <span className="nav-signin" onClick={() => navigate('/auth')}>Sign in</span>
          <button className="nav-cta" onClick={() => navigate('/auth')}>Get started free</button>
        </div>
      </nav>

      {/* HERO — new headline, same design */}
      <section className="hero">
        <div className="hero-grain"/>
        <div className="hero-glow"/>
        <div className="hero-tag"><span className="hero-tag-dot"/><span>For hairstylists & beauty pros</span></div>
        <h1 className="hero-h1 serif">
          Stop losing clients because<br/>your bookings are a <em>mess.</em>
        </h1>
        <p className="hero-sub">
          Organized gives every hairstylist a professional booking page, product shop, and client system — all in one place. No code. No chaos.
        </p>
        <div className="hero-actions">
          <button className="btn-hero-primary" onClick={() => navigate('/auth')}>Start free — no card needed</button>
          <button className="btn-hero-ghost" onClick={() => navigate('/jd-9a99')}>See a live example</button>
        </div>
        <p className="hero-note">14-day free trial. Cancel anytime. Setup takes under 10 minutes.</p>

        {/* Dashboard preview */}
        <div className="hero-preview">
          <div className="preview-frame">
            <div className="preview-bar">
              <div className="preview-dot" style={{background:'#ff5f57'}}/>
              <div className="preview-dot" style={{background:'#febc2e'}}/>
              <div className="preview-dot" style={{background:'#28c840'}}/>
              <div className="preview-url"><span>beorganized.io/dashboard</span></div>
            </div>
            <div className="preview-body">
              <div className="preview-sidebar">
                {['Overview','Appointments','Products','Formations','Clients'].map((item, i) => (
                  <div key={i} className={`preview-nav-item ${i===0?'active':''}`}>
                    <div className="preview-nav-dot"/>{item}
                  </div>
                ))}
              </div>
              <div className="preview-main">
                <div className="preview-stat-row">
                  {[['Revenue','$3,240'],['Appointments','28'],['Products sold','31'],['Students','74']].map(([l,v],i) => (
                    <div key={i} className="preview-stat">
                      <div className="preview-stat-lbl">{l}</div>
                      <div className="preview-stat-val">{v}</div>
                    </div>
                  ))}
                </div>
                <div className="preview-table">
                  <div className="preview-table-head">
                    {['Client','Service','Amount','Status'].map(h => <div key={h} className="preview-th">{h}</div>)}
                  </div>
                  {[['Amara D.','Box Braids','$180','confirmed'],['Zoe M.','Silk Press','$95','confirmed'],['Kezia B.','Color & Cut','$220','pending'],['Nadia L.','Loc Retwist','$120','confirmed']].map(([c,s,a,st],i) => (
                    <div key={i} className="preview-row">
                      <div className="preview-td name">{c}</div>
                      <div className="preview-td">{s}</div>
                      <div className="preview-td amt">{a}</div>
                      <div className="preview-td"><span className={`preview-badge ${st==='pending'?'p':''}`}>{st}</span></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section className="problem" id="problem">
        <div className="container">
          <div className="reveal">
            <div className="section-tag">The problem</div>
            <h2 className="section-title serif">Your talent is world-class.<br/>Your <em>system</em> isn't.</h2>
            <p className="section-sub">Every day, thousands of hairstylists lose time — and money — managing their business through social media DMs.</p>
          </div>
          <div className="dm-showcase">
            {[
              { from:'kezia_b', msgs:[{t:'Hey sis do you do knotless? How much is it?',sent:false},{t:'Yes I do! Starting at $200 depending on length',sent:true},{t:'Ok can I come this Saturday? What time are you free?',sent:false}]},
              { from:'nadia.hair', msgs:[{t:'What products do you sell? Do you ship?',sent:false},{t:'I sell my own line. Moisture Serum is $28. Yes I ship Canada-wide',sent:true},{t:'How do I order? Do you have an e-transfer?',sent:false}]},
              { from:'tasha__r', msgs:[{t:'I wanna book a silk press for next week',sent:false},{t:'Sure! What day works?',sent:true},{t:'Idk maybe Wednesday or Thursday? Whichever you have open',sent:false}]},
            ].map((dm, i) => (
              <div key={i} className="dm-card reveal" style={{transitionDelay:`${i*.1}s`}}>
                <div className="dm-card-head">
                  <div className="dm-dot"/>
                  <div className="dm-platform">Instagram DM — @{dm.from}</div>
                </div>
                <div className="dm-messages">
                  {dm.msgs.map((m, j) => (
                    <div key={j} className="dm-msg" style={{flexDirection:m.sent?'row-reverse':'row'}}>
                      {!m.sent && <div className="dm-av">{dm.from[0].toUpperCase()}</div>}
                      <div className={`dm-bubble ${m.sent?'sent':''}`}>{m.t}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="problem-vs reveal">
            <div className="vs-line">
              <div className="vs-rule"/>
              <div className="vs-text">Organized ends this</div>
              <div className="vs-rule"/>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="features" id="features">
        <div className="container">
          <div className="reveal">
            <div className="section-tag">What you get</div>
            <h2 className="section-title serif">Everything your business<br/>needs. <em>Nothing it doesn't.</em></h2>
          </div>
          <div className="features-grid">
            {[
              { icon:<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="3"/><path d="M3 10h18M8 2v4M16 2v4"/></svg>, name:'Appointment Booking', desc:'Clients book directly from your profile page, 24/7. You get notified instantly. No more back-and-forth.', items:['Real-time availability calendar','Automated confirmations & reminders','Deposit collection at booking'] },
              { icon:<svg viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>, name:'Product Shop', desc:'Sell your hair products directly from your profile. Clients discover and order while they\'re already looking at your work.', items:['Unlimited products listed','Inventory tracking','Direct payment processing'] },
              { icon:<svg viewBox="0 0 24 24"><path d="M22 10v6M2 10l10 5 10-5-10-5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>, name:'Formations & Courses', desc:'Monetize your expertise. Create and sell workshops, masterclasses, or digital courses — all from the same platform.', items:['Sell online or in-person courses','Student enrollment management','Course access control'] },
              { icon:<svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>, name:'Client Management', desc:'Every client, every visit, every dollar — tracked automatically. Build real relationships, not just transactions.', items:['Full visit and spend history','VIP client tagging','Broadcast messaging'] },
            ].map((f, i) => (
              <div key={i} className={`feature-card reveal reveal-delay-${i%2+1}`}>
                <div className="feature-icon">{f.icon}</div>
                <div className="feature-name serif">{f.name}</div>
                <div className="feature-desc">{f.desc}</div>
                <div className="feature-detail">
                  {f.items.map((item, j) => (
                    <div key={j} className="feature-item">
                      <div className="feature-check">✓</div>{item}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how" id="how">
        <div className="container">
          <div className="reveal" style={{textAlign:'center'}}>
            <div className="section-tag">How it works</div>
            <h2 className="section-title serif" style={{color:'#fff'}}>Up and running<br/><em>in under 10 minutes.</em></h2>
          </div>
          <div className="steps">
            {[
              { icon:<svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>, title:'Create your account', desc:'Sign up, choose your plan, and enter your business details. Takes less time than answering three DMs.' },
              { icon:<svg viewBox="0 0 24 24"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>, title:'Build your profile', desc:'Add your services, upload products, and set your availability. Your profile page is ready the moment you finish.' },
              { icon:<svg viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>, title:'Share your link', desc:'Post it in your bio, stories, and everywhere you promote. Clients click, book, and pay — you just show up.' },
            ].map((s, i) => (
              <div key={i} className={`step reveal reveal-delay-${i+1}`}>
                <div className="step-num">{String(i+1).padStart(2,'0')}</div>
                <div className="step-icon">{s.icon}</div>
                <div className="step-title serif">{s.title}</div>
                <div className="step-desc">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="pricing" id="pricing">
        <div className="container">
          <div className="reveal" style={{textAlign:'center'}}>
            <div className="section-tag">Pricing</div>
            <h2 className="section-title serif">Simple, transparent pricing.<br/><em>Cancel anytime.</em></h2>
            <p className="section-sub" style={{margin:'1rem auto 0'}}>Every plan includes a 14-day free trial. No credit card required to start.</p>
          </div>
          <div className="pricing-grid">
            {plans.map((plan, i) => (
              <div key={i} className={`plan-card reveal reveal-delay-${i+1} ${plan.featured?'featured':''}`}>
                {plan.featured && <div className="plan-badge">Most popular</div>}
                <div className="plan-name">{plan.name}</div>
                <div className="plan-price"><sup>$</sup>{plan.price}<sub>/mo</sub></div>
                <div className="plan-desc">{plan.desc}</div>
                <div className="plan-divider"/>
                <div className="plan-features">
                  {plan.features.map((f, j) => (
                    <div key={j} className="plan-feat">
                      {f.ok
                        ? <div className="plan-feat-check">✓</div>
                        : <div className="plan-feat-x">✕</div>
                      }
                      <span style={{color:!f.ok?'var(--ink-3)':undefined}}>{f.text}</span>
                    </div>
                  ))}
                </div>
                <button className={`plan-btn ${plan.featured?'plan-btn-gold':i===2?'plan-btn-outline':'plan-btn-outline'}`} onClick={() => navigate('/auth')}>
                  Start free trial
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="testimonials">
        <div className="container">
          <div className="reveal" style={{textAlign:'center'}}>
            <div className="section-tag">From the community</div>
            <h2 className="section-title serif">What stylists are saying.</h2>
          </div>
          <div className="testimonials-grid">
            {testimonials.map((t, i) => (
              <div key={i} className={`testi-card reveal reveal-delay-${i+1}`}>
                <div className="testi-quote">"</div>
                <div className="testi-text">{t.text}</div>
                <div className="testi-author">
                  <div className="testi-av">{t.av}</div>
                  <div>
                    <div className="testi-name">{t.name}</div>
                    <div className="testi-handle">{t.handle}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="final-cta">
        <div className="container reveal">
          <div className="section-tag">Get started today</div>
          <h2 className="section-title serif">Your clients deserve a<br/><em>professional experience.</em></h2>
          <p className="section-sub">Join hundreds of hairstylists who replaced their DM chaos with a system that works while they sleep.</p>
          <div className="final-cta-actions">
            <button className="btn-hero-primary" onClick={() => navigate('/auth')}>Start your free trial</button>
            <button className="btn-hero-ghost" onClick={() => navigate('/jd-9a99')}>See a live profile</button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-logo">Organized<span>.</span></div>
          <div className="footer-links">
            {['Privacy','Terms','Contact','Instagram'].map(l => (
              <span key={l} className="footer-link">{l}</span>
            ))}
          </div>
          <div className="footer-copy">© 2026 Organized. All rights reserved.</div>
        </div>
      </footer>
    </>
  )
}
