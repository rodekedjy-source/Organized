import { useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('[data-rv]')
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const el = e.target
          const delay = el.dataset.delay || 0
          setTimeout(() => el.classList.add('in'), delay)
          obs.unobserve(el)
        }
      })
    }, { threshold: 0.1 })
    els.forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])
}

function Counter({ to, suffix = '' }) {
  const [val, setVal] = useState(0)
  const ref = useRef()
  const started = useRef(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting || started.current) return
      started.current = true
      let v = 0
      const step = to / 55
      const t = setInterval(() => {
        v += step
        if (v >= to) { setVal(to); clearInterval(t) }
        else setVal(Math.floor(v))
      }, 18)
      obs.disconnect()
    }, { threshold: 0.5 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [to])
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; -webkit-font-smoothing: antialiased; }
  body { font-family: 'DM Sans', sans-serif; background: #faf9f6; color: #0f0e0c; overflow-x: hidden; }

  :root {
    --gold: #b08d4a;
    --gold-lt: rgba(176,141,74,.1);
    --ink: #0f0e0c;
    --ink-2: #3d3b38;
    --ink-3: #8a8680;
    --cream: #faf9f6;
    --white: #ffffff;
    --border: #eae6de;
    --border-2: #dedad0;
  }

  /* ── REVEAL ── */
  [data-rv] { opacity: 0; transform: translateY(28px); transition: opacity .9s cubic-bezier(.16,1,.3,1), transform .9s cubic-bezier(.16,1,.3,1); }
  [data-rv="left"] { transform: translateX(-28px); }
  [data-rv="right"] { transform: translateX(28px); }
  [data-rv="scale"] { transform: scale(.95); }
  [data-rv="fade"] { transform: none; }
  [data-rv].in { opacity: 1; transform: none; }

  /* ── NAV ── */
  .nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 200;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 3rem; height: 64px;
    background: rgba(250,249,246,.94);
    backdrop-filter: saturate(180%) blur(20px);
    border-bottom: 1px solid var(--border);
  }
  .nav-logo { font-family: 'Cormorant Garamond', serif; font-size: 1.35rem; font-weight: 500; color: var(--ink); cursor: pointer; letter-spacing: .01em; }
  .nav-logo span { color: var(--gold); }
  .nav-center { display: flex; gap: 2.5rem; }
  .nav-link { font-size: .78rem; color: var(--ink-3); cursor: pointer; transition: color .2s; letter-spacing: .02em; }
  .nav-link:hover { color: var(--ink); }
  .nav-right { display: flex; align-items: center; gap: 1.25rem; }
  .nav-text-btn { font-size: .78rem; color: var(--ink-3); cursor: pointer; transition: color .2s; letter-spacing: .02em; }
  .nav-text-btn:hover { color: var(--ink); }
  .nav-cta { background: var(--ink); color: #fff; border: none; border-radius: 7px; padding: .5rem 1.25rem; font-size: .78rem; font-weight: 500; cursor: pointer; font-family: inherit; transition: all .25s; letter-spacing: .02em; }
  .nav-cta:hover { background: #2a2825; box-shadow: 0 4px 20px rgba(15,14,12,.25); }

  /* ── HERO ── */
  .hero {
    min-height: 100vh; padding: 10rem 3rem 7rem;
    display: grid; grid-template-columns: 1fr 1fr; gap: 5rem; align-items: center;
    max-width: 1200px; margin: 0 auto;
  }
  .hero-eyebrow { display: flex; align-items: center; gap: .6rem; margin-bottom: 1.75rem; }
  .hero-eyebrow-line { width: 28px; height: 1px; background: var(--gold); }
  .hero-eyebrow-text { font-size: .7rem; letter-spacing: .14em; text-transform: uppercase; color: var(--gold); font-weight: 500; }
  .hero-h1 {
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(3rem, 5.5vw, 5.25rem);
    font-weight: 500; line-height: 1.04; letter-spacing: -.01em; color: var(--ink);
    margin-bottom: 1.5rem;
  }
  .hero-h1 em { font-style: italic; color: var(--gold); }
  .hero-sub { font-size: 1rem; color: var(--ink-3); line-height: 1.8; font-weight: 300; max-width: 420px; margin-bottom: 2.5rem; }
  .hero-actions { display: flex; align-items: center; gap: 1.25rem; flex-wrap: wrap; }
  .btn-ink { background: var(--ink); color: #fff; border: none; border-radius: 8px; padding: .88rem 2rem; font-size: .88rem; font-weight: 500; cursor: pointer; font-family: inherit; transition: all .25s; letter-spacing: .01em; }
  .btn-ink:hover { background: #2a2825; box-shadow: 0 8px 28px rgba(15,14,12,.2); transform: translateY(-1px); }
  .btn-text { font-size: .82rem; color: var(--ink-3); cursor: pointer; display: flex; align-items: center; gap: .4rem; transition: color .2s; }
  .btn-text:hover { color: var(--ink); }
  .hero-note { font-size: .7rem; color: var(--ink-3); opacity: .5; margin-top: 1.1rem; letter-spacing: .02em; }

  /* PHONE HERO */
  .hero-phone-wrap { position: relative; display: flex; justify-content: center; align-items: flex-end; }
  .hero-phone-bg { position: absolute; inset: -8%; background: radial-gradient(ellipse at 50% 60%, rgba(176,141,74,.08) 0%, transparent 70%); border-radius: 50%; }
  .phone {
    width: 260px; background: #111; border-radius: 40px;
    box-shadow: 0 60px 100px rgba(0,0,0,.22), 0 0 0 1px rgba(255,255,255,.07), inset 0 0 0 1px rgba(255,255,255,.03);
    overflow: hidden; position: relative; z-index: 1;
  }
  .phone-notch-bar { height: 30px; background: #0a0a0a; display: flex; align-items: center; justify-content: center; }
  .phone-notch-pill { width: 72px; height: 12px; background: #111; border-radius: 10px; }
  .phone-screen-inner { background: #faf9f6; }
  .ph-header { background: #111; padding: .75rem; border-bottom: 1px solid rgba(255,255,255,.06); display: flex; align-items: center; justify-content: space-between; }
  .ph-header-name { font-family: 'Cormorant Garamond', serif; font-size: .78rem; color: #fff; font-weight: 500; }
  .ph-hero-section { background: #111; padding: 1.25rem .85rem 1rem; text-align: center; }
  .ph-avatar { width: 46px; height: 46px; border-radius: 50%; background: #1f1f1f; border: 1px solid rgba(176,141,74,.35); margin: 0 auto .6rem; display: flex; align-items: center; justify-content: center; font-family: 'Cormorant Garamond', serif; font-size: 1.05rem; color: var(--gold); }
  .ph-name { font-family: 'Cormorant Garamond', serif; font-size: .9rem; color: #fff; font-weight: 500; }
  .ph-bio { font-size: .52rem; color: rgba(255,255,255,.32); margin-top: .15rem; }
  .ph-tabs { display: flex; background: #111; border-bottom: 1px solid rgba(255,255,255,.06); }
  .ph-tab { flex: 1; padding: .45rem; font-size: .52rem; color: rgba(255,255,255,.28); text-align: center; letter-spacing: .04em; }
  .ph-tab.on { color: var(--gold); border-bottom: 1.5px solid var(--gold); }
  .ph-body { padding: .65rem; background: #faf9f6; }
  .ph-section-title { font-family: 'Cormorant Garamond', serif; font-size: .78rem; color: var(--ink); margin-bottom: .5rem; font-weight: 500; }
  .ph-svc { display: flex; align-items: center; gap: .45rem; padding: .45rem .5rem; border: 1px solid var(--border); border-radius: 7px; margin-bottom: .3rem; background: #fff; transition: border .2s; }
  .ph-svc-line { width: 2px; height: 22px; background: var(--gold); border-radius: 1px; opacity: .4; flex-shrink: 0; }
  .ph-svc-info { flex: 1; }
  .ph-svc-name { font-size: .58rem; color: var(--ink); font-weight: 500; }
  .ph-svc-dur { font-size: .48rem; color: var(--ink-3); margin-top: .05rem; }
  .ph-svc-price { font-family: 'Cormorant Garamond', serif; font-size: .7rem; color: var(--ink); }
  .ph-book { background: var(--ink); color: #fff; border: none; border-radius: 4px; padding: .2rem .45rem; font-size: .48rem; font-weight: 500; cursor: pointer; font-family: inherit; }
  .ph-powered { font-size: .42rem; color: var(--gold); text-align: center; padding: .3rem; opacity: .5; background: #faf9f6; }

  /* ── FULL WIDTH SEPARATOR ── */
  .sep { max-width: 1200px; margin: 0 auto; height: 1px; background: var(--border); }

  /* ── PROOF BAR ── */
  .proof { max-width: 1200px; margin: 0 auto; padding: 2.25rem 3rem; display: flex; align-items: center; gap: 3rem; flex-wrap: wrap; }
  .proof-item { display: flex; align-items: center; gap: .6rem; }
  .proof-dot { width: 4px; height: 4px; border-radius: 50%; background: var(--gold); }
  .proof-text { font-size: .75rem; color: var(--ink-3); letter-spacing: .01em; }

  /* ── SECTION BASE ── */
  .s { padding: 8rem 3rem; }
  .s-narrow { max-width: 1200px; margin: 0 auto; }
  .s-tag { display: flex; align-items: center; gap: .6rem; margin-bottom: 1.25rem; }
  .s-tag-line { width: 24px; height: 1px; background: var(--gold); }
  .s-tag-text { font-size: .68rem; letter-spacing: .14em; text-transform: uppercase; color: var(--gold); font-weight: 500; }
  .s-title { font-family: 'Cormorant Garamond', serif; font-size: clamp(2.2rem, 4vw, 3.5rem); font-weight: 500; line-height: 1.1; color: var(--ink); }
  .s-title em { font-style: italic; color: var(--gold); }
  .s-sub { font-size: .95rem; color: var(--ink-3); line-height: 1.8; font-weight: 300; max-width: 480px; margin-top: .85rem; }

  /* ── PROBLEM ── */
  .problem-wrap { background: var(--ink); padding: 8rem 3rem; }
  .problem-inner { max-width: 1200px; margin: 0 auto; }
  .problem-title { font-family: 'Cormorant Garamond', serif; font-size: clamp(2.2rem,4vw,3.5rem); font-weight: 500; color: #fff; line-height: 1.1; max-width: 600px; margin-bottom: 1rem; }
  .problem-title em { font-style: italic; color: var(--gold); }
  .problem-sub { font-size: .88rem; color: rgba(255,255,255,.35); font-weight: 300; line-height: 1.75; max-width: 380px; margin-bottom: 4rem; }
  .dm-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 1px; background: rgba(255,255,255,.06); border-radius: 16px; overflow: hidden; }
  .dm-col { background: rgba(255,255,255,.02); padding: 2rem; }
  .dm-platform { font-size: .65rem; color: rgba(255,255,255,.2); letter-spacing: .08em; text-transform: uppercase; margin-bottom: 1.25rem; display: flex; align-items: center; gap: .5rem; }
  .dm-live { width: 5px; height: 5px; border-radius: 50%; background: #22c55e; }
  .dm-bubble-out { background: rgba(255,255,255,.05); border-radius: 0 10px 10px 10px; padding: .6rem .85rem; font-size: .75rem; color: rgba(255,255,255,.5); line-height: 1.55; margin-bottom: .6rem; }
  .dm-bubble-in { background: rgba(176,141,74,.12); border-radius: 10px 0 10px 10px; padding: .6rem .85rem; font-size: .75rem; color: rgba(176,141,74,.7); line-height: 1.55; margin-bottom: .6rem; margin-left: auto; max-width: 90%; }
  .dm-time { font-size: .6rem; color: rgba(255,255,255,.15); margin-top: .25rem; }
  .dm-divider { height: 1px; background: rgba(255,255,255,.05); margin: 1.25rem 0; }
  .dm-label { font-size: .65rem; color: rgba(255,255,255,.15); display: flex; align-items: center; gap: .4rem; }
  .dm-label::before { content: ''; display: block; width: 12px; height: 1px; background: rgba(255,255,255,.1); }

  /* ── FEATURES ── */
  .features-wrap { background: var(--cream); }
  .features-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 1px; background: var(--border); border: 1px solid var(--border); border-radius: 16px; overflow: hidden; margin-top: 4rem; }
  .feat-card { background: var(--white); padding: 2.25rem 2rem; }
  .feat-num { font-family: 'Cormorant Garamond', serif; font-size: 3rem; color: var(--border); line-height: 1; margin-bottom: .75rem; }
  .feat-name { font-family: 'Cormorant Garamond', serif; font-size: 1.25rem; color: var(--ink); margin-bottom: .5rem; font-weight: 500; }
  .feat-desc { font-size: .8rem; color: var(--ink-3); line-height: 1.7; font-weight: 300; }

  /* ── STATS ── */
  .stats-wrap { background: var(--white); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
  .stats-inner { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: repeat(3,1fr); }
  .stat-item { padding: 4rem 3rem; text-align: center; border-right: 1px solid var(--border); }
  .stat-item:last-child { border-right: none; }
  .stat-num { font-family: 'Cormorant Garamond', serif; font-size: 4.5rem; font-weight: 500; color: var(--gold); line-height: 1; }
  .stat-lbl { font-size: .78rem; color: var(--ink-3); margin-top: .6rem; font-weight: 300; letter-spacing: .04em; }

  /* ── TESTIMONIALS ── */
  .testi-wrap { background: var(--cream); }
  .testi-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1.25rem; margin-top: 4rem; align-items: start; }
  .testi-card { background: var(--white); border: 1px solid var(--border); border-radius: 16px; padding: 2.25rem; position: relative; overflow: hidden; transition: all .35s cubic-bezier(.16,1,.3,1); }
  .testi-card::before { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, rgba(176,141,74,.03), transparent); pointer-events: none; }
  .testi-card:hover { transform: translateY(-8px); box-shadow: 0 32px 60px rgba(0,0,0,.08); border-color: rgba(176,141,74,.2); }
  .testi-card.center { background: var(--ink); border-color: transparent; transform: translateY(-12px); box-shadow: 0 40px 80px rgba(0,0,0,.18); }
  .testi-card.center:hover { transform: translateY(-18px); }
  .testi-quote { font-family: 'Cormorant Garamond', serif; font-size: 5rem; line-height: .7; color: var(--border); margin-bottom: .75rem; }
  .testi-card.center .testi-quote { color: rgba(176,141,74,.15); }
  .testi-body { font-size: .88rem; line-height: 1.8; font-weight: 300; color: var(--ink-2); margin-bottom: 1.75rem; }
  .testi-card.center .testi-body { color: rgba(255,255,255,.55); }
  .testi-footer { display: flex; align-items: center; gap: .75rem; padding-top: 1.25rem; border-top: 1px solid var(--border); }
  .testi-card.center .testi-footer { border-top-color: rgba(255,255,255,.07); }
  .testi-av { width: 36px; height: 36px; border-radius: 50%; background: rgba(176,141,74,.1); border: 1px solid rgba(176,141,74,.2); display: flex; align-items: center; justify-content: center; font-size: .78rem; font-weight: 600; color: var(--gold); flex-shrink: 0; }
  .testi-name { font-size: .82rem; font-weight: 500; color: var(--ink); }
  .testi-card.center .testi-name { color: #fff; }
  .testi-handle { font-size: .7rem; color: var(--ink-3); margin-top: .05rem; }
  .testi-card.center .testi-handle { color: rgba(255,255,255,.25); }
  .testi-stars { display: flex; gap: .15rem; margin-bottom: 1rem; }
  .testi-star { font-size: .75rem; color: var(--gold); }

  /* ── HOW IT WORKS ── */
  .how-wrap { background: var(--white); }
  .how-steps { display: grid; grid-template-columns: repeat(3,1fr); gap: 4rem; margin-top: 5rem; position: relative; }
  .how-steps::before { content: ''; position: absolute; top: 26px; left: calc(16.6% + 26px); right: calc(16.6% + 26px); height: 1px; background: var(--border); }
  .how-step { }
  .how-step-circle { width: 52px; height: 52px; border-radius: 50%; border: 1px solid var(--border); background: var(--white); display: flex; align-items: center; justify-content: center; margin-bottom: 1.5rem; position: relative; z-index: 1; }
  .how-step-circle svg { width: 20px; height: 20px; stroke: var(--gold); fill: none; stroke-width: 1.5; }
  .how-step-num { font-family: 'Cormorant Garamond', serif; font-size: 2.25rem; color: var(--border); line-height: 1; margin-bottom: .6rem; }
  .how-step-title { font-family: 'Cormorant Garamond', serif; font-size: 1.15rem; color: var(--ink); margin-bottom: .5rem; font-weight: 500; }
  .how-step-desc { font-size: .8rem; color: var(--ink-3); line-height: 1.7; font-weight: 300; }

  /* ── PRICING ── */
  .pricing-wrap { background: var(--cream); }
  .pricing-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 1px; background: var(--border); border: 1px solid var(--border); border-radius: 16px; overflow: hidden; margin-top: 4rem; }
  .plan { background: var(--white); padding: 2.5rem 2.25rem; position: relative; transition: background .2s; }
  .plan.featured { background: var(--ink); }
  .plan-badge { position: absolute; top: 2rem; right: 2rem; background: var(--gold); color: #fff; font-size: .6rem; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; padding: .22rem .7rem; border-radius: 12px; }
  .plan-tier { font-size: .65rem; letter-spacing: .14em; text-transform: uppercase; color: var(--ink-3); margin-bottom: .85rem; font-weight: 500; }
  .plan.featured .plan-tier { color: rgba(255,255,255,.3); }
  .plan-price-row { display: flex; align-items: baseline; gap: .25rem; margin-bottom: .4rem; }
  .plan-currency { font-size: 1.1rem; color: var(--ink); font-weight: 300; }
  .plan.featured .plan-currency { color: #fff; }
  .plan-amount { font-family: 'Cormorant Garamond', serif; font-size: 3.25rem; font-weight: 500; color: var(--ink); line-height: 1; }
  .plan.featured .plan-amount { color: #fff; }
  .plan-per { font-size: .78rem; color: var(--ink-3); font-weight: 300; }
  .plan.featured .plan-per { color: rgba(255,255,255,.25); }
  .plan-desc { font-size: .78rem; color: var(--ink-3); font-weight: 300; margin-bottom: 1.75rem; margin-top: .3rem; }
  .plan.featured .plan-desc { color: rgba(255,255,255,.25); }
  .plan-divider { height: 1px; background: var(--border); margin-bottom: 1.5rem; }
  .plan.featured .plan-divider { background: rgba(255,255,255,.07); }
  .plan-features { display: flex; flex-direction: column; gap: .55rem; margin-bottom: 2rem; }
  .plan-feat { display: flex; align-items: flex-start; gap: .55rem; font-size: .78rem; color: var(--ink-2); font-weight: 300; }
  .plan.featured .plan-feat { color: rgba(255,255,255,.5); }
  .plan-feat.off { color: var(--ink-3); opacity: .4; }
  .plan-check { color: var(--gold); font-size: .72rem; margin-top: 1px; flex-shrink: 0; }
  .plan-x { color: var(--border); font-size: .72rem; margin-top: 1px; flex-shrink: 0; }
  .plan-btn { width: 100%; padding: .82rem; border-radius: 9px; font-size: .82rem; font-weight: 500; cursor: pointer; font-family: inherit; transition: all .22s; letter-spacing: .02em; border: 1px solid var(--border-2); background: transparent; color: var(--ink); }
  .plan-btn:hover { background: var(--ink); color: #fff; border-color: var(--ink); }
  .plan.featured .plan-btn { background: var(--gold); color: #fff; border-color: var(--gold); }
  .plan.featured .plan-btn:hover { background: #9e7630; }

  /* ── CTA ── */
  .cta-wrap { background: var(--ink); padding: 10rem 3rem; text-align: center; position: relative; overflow: hidden; }
  .cta-grain { position: absolute; inset: 0; opacity: .025; background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); pointer-events: none; }
  .cta-glow { position: absolute; top: -30%; left: 50%; transform: translateX(-50%); width: 800px; height: 600px; background: radial-gradient(ellipse, rgba(176,141,74,.12) 0%, transparent 65%); pointer-events: none; }
  .cta-title { font-family: 'Cormorant Garamond', serif; font-size: clamp(2.5rem,5vw,4.5rem); font-weight: 500; color: #fff; margin-bottom: 1rem; position: relative; z-index: 1; }
  .cta-title em { font-style: italic; color: var(--gold); }
  .cta-sub { font-size: .92rem; color: rgba(255,255,255,.3); font-weight: 300; line-height: 1.8; max-width: 420px; margin: 0 auto 2.75rem; position: relative; z-index: 1; }
  .cta-actions { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; position: relative; z-index: 1; }
  .btn-gold { background: var(--gold); color: #fff; border: none; border-radius: 8px; padding: .92rem 2.25rem; font-size: .9rem; font-weight: 500; cursor: pointer; font-family: inherit; transition: all .25s; }
  .btn-gold:hover { background: #9e7630; transform: translateY(-2px); box-shadow: 0 12px 32px rgba(176,141,74,.3); }
  .btn-ghost { background: transparent; color: rgba(255,255,255,.4); border: 1px solid rgba(255,255,255,.1); border-radius: 8px; padding: .92rem 2.25rem; font-size: .9rem; cursor: pointer; font-family: inherit; transition: all .25s; }
  .btn-ghost:hover { color: rgba(255,255,255,.7); border-color: rgba(255,255,255,.2); }

  /* ── FOOTER ── */
  footer { background: #080806; padding: 2.5rem 3rem; border-top: 1px solid rgba(255,255,255,.04); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; }
  .foot-logo { font-family: 'Cormorant Garamond', serif; font-size: 1.1rem; color: rgba(255,255,255,.25); }
  .foot-logo span { color: var(--gold); }
  .foot-links { display: flex; gap: 2rem; }
  .foot-link { font-size: .7rem; color: rgba(255,255,255,.18); cursor: pointer; transition: color .15s; letter-spacing: .02em; }
  .foot-link:hover { color: rgba(255,255,255,.45); }
  .foot-copy { font-size: .68rem; color: rgba(255,255,255,.1); }

  @media(max-width:1024px){
    .hero{grid-template-columns:1fr;padding:8rem 2rem 5rem;max-width:600px;}
    .hero-phone-wrap{display:none;}
    .features-grid{grid-template-columns:1fr 1fr;}
    .dm-grid{grid-template-columns:1fr;}
    .testi-grid{grid-template-columns:1fr;}
    .testi-card.center{transform:none;}
    .how-steps{grid-template-columns:1fr;} .how-steps::before{display:none;}
    .pricing-grid{grid-template-columns:1fr;}
    .stats-inner{grid-template-columns:1fr;}
    .stat-item{border-right:none;border-bottom:1px solid var(--border);}
    .stat-item:last-child{border-bottom:none;}
  }
  @media(max-width:600px){
    .nav{padding:0 1.25rem;} .nav-center{display:none;}
    .s{padding:5rem 1.5rem;} .problem-wrap{padding:5rem 1.5rem;} .proof{padding:2rem 1.5rem;} .cta-wrap{padding:6rem 1.5rem;}
    .features-grid{grid-template-columns:1fr;}
    footer{padding:2rem 1.5rem;flex-direction:column;align-items:flex-start;}
  }
`

const plans = [
  { tier:'Starter', amount:19, desc:'For solo professionals just starting.', featured:false,
    features:[{ok:true,t:'Public profile & booking page'},{ok:true,t:'Up to 5 services'},{ok:true,t:'Basic client management'},{ok:false,t:'Product shop'},{ok:false,t:'Formations & courses'},{ok:false,t:'Analytics dashboard'}]},
  { tier:'Pro', amount:39, desc:'For professionals growing their brand.', featured:true,
    features:[{ok:true,t:'Everything in Starter'},{ok:true,t:'Unlimited services'},{ok:true,t:'Product shop'},{ok:true,t:'Formations & courses'},{ok:true,t:'Revenue analytics'},{ok:true,t:'Automated reminders'}]},
  { tier:'Studio', amount:69, desc:'For teams and multi-staff businesses.', featured:false,
    features:[{ok:true,t:'Everything in Pro'},{ok:true,t:'Up to 5 staff members'},{ok:true,t:'Custom domain'},{ok:true,t:'White-label branding'},{ok:true,t:'Priority support'},{ok:true,t:'Monthly strategy call'}]},
]

export default function Landing() {
  const navigate = useNavigate()
  useReveal()

  return (
    <div>
      <style>{css}</style>

      {/* NAV */}
      <nav className="nav">
        <div className="nav-logo" onClick={()=>navigate('/')}>Organized<span>.</span></div>
        <div className="nav-center">
          <span className="nav-link" onClick={()=>document.getElementById('how')?.scrollIntoView({behavior:'smooth'})}>How it works</span>
          <span className="nav-link" onClick={()=>document.getElementById('pricing')?.scrollIntoView({behavior:'smooth'})}>Pricing</span>
          <span className="nav-link" onClick={()=>document.getElementById('stories')?.scrollIntoView({behavior:'smooth'})}>Stories</span>
        </div>
        <div className="nav-right">
          <span className="nav-text-btn" onClick={()=>navigate('/auth')}>Sign in</span>
          <button className="nav-cta" onClick={()=>navigate('/auth')}>Get started free</button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{background:'var(--cream)'}}>
        <div className="hero">
          <div>
            <div className="hero-eyebrow" data-rv="fade" data-delay="0">
              <div className="hero-eyebrow-line"/>
              <span className="hero-eyebrow-text">Built for service businesses</span>
            </div>
            <h1 className="hero-h1" data-rv data-delay="80">
              Stop running your<br/>business <em>from<br/>your DMs.</em>
            </h1>
            <p className="hero-sub" data-rv data-delay="160">
              One link. Your bookings, products, and courses — all in one professional page. No code. No chaos. No more unanswered messages.
            </p>
            <div className="hero-actions" data-rv data-delay="240">
              <button className="btn-ink" onClick={()=>navigate('/auth')}>Start free — no card needed</button>
              <span className="btn-text" onClick={()=>document.getElementById('how')?.scrollIntoView({behavior:'smooth'})}>
                See how it works <span style={{color:'var(--gold)'}}>→</span>
              </span>
            </div>
            <p className="hero-note" data-rv="fade" data-delay="320">14-day free trial · Cancel anytime</p>
          </div>

          <div className="hero-phone-wrap" data-rv="right" data-delay="200">
            <div className="hero-phone-bg"/>
            <div className="phone">
              <div className="phone-notch-bar"><div className="phone-notch-pill"/></div>
              <div className="phone-screen-inner">
                <div className="ph-header">
                  <div className="ph-header-name">Elixir Hair Studio</div>
                  <div style={{fontSize:'.48rem',color:'rgba(255,255,255,.3)',letterSpacing:'.04em'}}>organized.</div>
                </div>
                <div className="ph-hero-section">
                  <div className="ph-avatar">E</div>
                  <div className="ph-name">Elixir Hair Studio</div>
                  <div className="ph-bio">Natural Hair Specialist · Montreal, QC</div>
                </div>
                <div className="ph-tabs">
                  <div className="ph-tab on">Book</div>
                  <div className="ph-tab">Shop</div>
                  <div className="ph-tab">Formations</div>
                </div>
                <div className="ph-body">
                  <div className="ph-section-title">Services</div>
                  {[['Box Braids','4–6 hrs','$180'],['Silk Press','2 hrs','$95'],['Loc Retwist','1.5 hrs','$120'],['Color & Cut','3 hrs','$220']].map(([n,d,p],i)=>(
                    <div key={i} className="ph-svc">
                      <div className="ph-svc-line"/>
                      <div className="ph-svc-info">
                        <div className="ph-svc-name">{n}</div>
                        <div className="ph-svc-dur">{d}</div>
                      </div>
                      <div className="ph-svc-price">{p}</div>
                      <button className="ph-book">Book</button>
                    </div>
                  ))}
                </div>
                <div className="ph-powered">Powered by Organized.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROOF BAR */}
      <div style={{background:'var(--white)',borderTop:'1px solid var(--border)',borderBottom:'1px solid var(--border)'}}>
        <div className="proof" data-rv="fade">
          {['14-day free trial','No credit card required','Setup in under 10 minutes','Cancel anytime','Your data, fully secured'].map((t,i)=>(
            <div key={i} className="proof-item"><div className="proof-dot"/><span className="proof-text">{t}</span></div>
          ))}
        </div>
      </div>

      {/* PROBLEM */}
      <div className="problem-wrap">
        <div className="problem-inner">
          <div data-rv>
            <div className="s-tag" style={{marginBottom:'1.25rem'}}>
              <div className="s-tag-line" style={{background:'rgba(176,141,74,.6)'}}/>
              <span className="s-tag-text" style={{color:'rgba(176,141,74,.7)'}}>The problem</span>
            </div>
            <div className="problem-title">Talented professionals <em>drowning<br/>in unanswered messages.</em></div>
            <div className="problem-sub">Every day, thousands of service businesses lose bookings, clients, and revenue — managed entirely through DMs.</div>
          </div>
          <div className="dm-grid">
            {[
              {from:'kezia_beauty', msgs:[{t:'Hey do you do knotless? How much?',in:true},{t:'Yes! Starting at $200 — depends on length',in:false},{t:'Can I come Saturday? Any time that works?',in:true}]},
              {from:'nadia.naturals', msgs:[{t:'What products do you sell? Do you ship?',in:true},{t:'I sell my own line! Serum $28, ships Canada',in:false},{t:'How do I order? E-transfer or card?',in:true}]},
              {from:'tasha__r', msgs:[{t:'I want a silk press next week!',in:true},{t:'I have Wed or Thurs open — which works?',in:false},{t:'Either honestly, whatever you have 🙏',in:true}]},
            ].map((dm,i)=>(
              <div key={i} className={`dm-col`} data-rv data-delay={i*100}>
                <div className="dm-platform"><div className="dm-live"/>Instagram DM · @{dm.from}</div>
                {dm.msgs.map((m,j)=>(
                  <div key={j}>
                    <div className={m.in?'dm-bubble-out':'dm-bubble-in'} style={{marginLeft:m.in?0:'auto',maxWidth:m.in?'100%':'90%'}}>{m.t}</div>
                    <div className="dm-time" style={{textAlign:m.in?'left':'right',marginBottom:'.5rem'}}>{j===0?'2 days ago · unread':j===1?'Seen':'Just now'}</div>
                  </div>
                ))}
                <div className="dm-divider"/>
                <div className="dm-label">{i===0?'3 more unanswered':i===1?'5 more unanswered':'2 more unanswered'}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FEATURES */}
      <div className="features-wrap">
        <div className="s">
          <div className="s-narrow">
            <div data-rv>
              <div className="s-tag"><div className="s-tag-line"/><span className="s-tag-text">What you get</span></div>
              <div className="s-title">Everything your business needs.<br/><em>Nothing it doesn't.</em></div>
            </div>
            <div className="features-grid">
              {[
                {n:'01',name:'Booking System',desc:'Clients book directly from your profile, 24/7. Real-time availability. Automated confirmations. No back-and-forth.'},
                {n:'02',name:'Product Shop',desc:'Sell your products from the same page. Clean checkout, inventory tracking, no separate store needed.'},
                {n:'03',name:'Formations',desc:'Monetize your expertise. Sell workshops, masterclasses, or digital guides alongside your services.'},
                {n:'04',name:'Client CRM',desc:'Every client, every visit, every dollar tracked automatically. Relationships, not spreadsheets.'},
              ].map((f,i)=>(
                <div key={i} className="feat-card" data-rv data-delay={i*80}>
                  <div className="feat-num">{f.n}</div>
                  <div className="feat-name">{f.name}</div>
                  <div className="feat-desc">{f.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="stats-wrap">
        <div className="stats-inner">
          {[{to:2400,suffix:'+',lbl:'Service professionals organized'},{to:89,suffix:'%',lbl:'Reduction in unanswered DMs'},{to:10,suffix:' min',lbl:'Average setup time'}].map((s,i)=>(
            <div key={i} className="stat-item" data-rv data-delay={i*100}>
              <div className="stat-num"><Counter to={s.to} suffix={s.suffix}/></div>
              <div className="stat-lbl">{s.lbl}</div>
            </div>
          ))}
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div className="how-wrap" id="how">
        <div className="s">
          <div className="s-narrow">
            <div data-rv style={{textAlign:'center'}}>
              <div className="s-tag" style={{justifyContent:'center'}}><div className="s-tag-line"/><span className="s-tag-text">How it works</span><div className="s-tag-line"/></div>
              <div className="s-title" style={{textAlign:'center'}}>Up and running <em>in minutes.</em></div>
            </div>
            <div className="how-steps">
              {[
                {icon:<svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>,n:'01',title:'Create your account',desc:'Sign up in minutes. No credit card required. Start your 14-day free trial instantly.'},
                {icon:<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="3"/><path d="M3 10h18M8 2v4M16 2v4"/></svg>,n:'02',title:'Build your profile',desc:'Add your services, products, and formations. Your public page is live the moment you finish.'},
                {icon:<svg viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>,n:'03',title:'Share your link',desc:'Post it in your bio. Clients click, book, and pay — you just show up.'},
              ].map((s,i)=>(
                <div key={i} className="how-step" data-rv data-delay={i*120}>
                  <div className="how-step-num">{s.n}</div>
                  <div className="how-step-circle">{s.icon}</div>
                  <div className="how-step-title">{s.title}</div>
                  <div className="how-step-desc">{s.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* TESTIMONIALS */}
      <div className="testi-wrap" id="stories">
        <div className="s">
          <div className="s-narrow">
            <div data-rv style={{textAlign:'center'}}>
              <div className="s-tag" style={{justifyContent:'center'}}><div className="s-tag-line"/><span className="s-tag-text">From the community</span><div className="s-tag-line"/></div>
              <div className="s-title" style={{textAlign:'center'}}>Professionals who made <em>the switch.</em></div>
            </div>
            <div className="testi-grid">
              {[
                {text:'Before Organized, I answered the same DMs every single day. Now clients book themselves and I wake up to confirmed appointments. I got my life back.',name:'Maya A.',handle:'@elixirbymaya',av:'M',center:false},
                {text:'I launched my Box Braids Masterclass through my Organized page. Made back my subscription fee in the first week. This platform actually makes me money.',name:'Kezia B.',handle:'@keziahairstudio',av:'K',center:true},
                {text:'My clients always comment on how professional my page looks. They think I paid a developer thousands of dollars. It\'s just Organized.',name:'Nadia L.',handle:'@nadianaturals',av:'N',center:false},
              ].map((t,i)=>(
                <div key={i} className={`testi-card ${t.center?'center':''}`} data-rv="scale" data-delay={i*100}>
                  <div className="testi-quote">"</div>
                  <div className="testi-stars">{[1,2,3,4,5].map(s=><span key={s} className="testi-star">★</span>)}</div>
                  <div className="testi-body">{t.text}</div>
                  <div className="testi-footer">
                    <div className="testi-av">{t.av}</div>
                    <div><div className="testi-name">{t.name}</div><div className="testi-handle">{t.handle}</div></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* PRICING */}
      <div className="pricing-wrap" id="pricing">
        <div className="s">
          <div className="s-narrow">
            <div data-rv style={{textAlign:'center'}}>
              <div className="s-tag" style={{justifyContent:'center'}}><div className="s-tag-line"/><span className="s-tag-text">Pricing</span><div className="s-tag-line"/></div>
              <div className="s-title" style={{textAlign:'center'}}>Simple pricing. <em>Cancel anytime.</em></div>
              <div style={{fontSize:'.85rem',color:'var(--ink-3)',marginTop:'.75rem',fontWeight:300}}>Every plan includes a 14-day free trial. No credit card required to start.</div>
            </div>
            <div className="pricing-grid">
              {plans.map((p,i)=>(
                <div key={i} className={`plan ${p.featured?'featured':''}`} data-rv data-delay={i*80}>
                  {p.featured&&<div className="plan-badge">Most popular</div>}
                  <div className="plan-tier">{p.tier}</div>
                  <div className="plan-price-row">
                    <span className="plan-currency">$</span>
                    <span className="plan-amount">{p.amount}</span>
                    <span className="plan-per">/mo</span>
                  </div>
                  <div className="plan-desc">{p.desc}</div>
                  <div className="plan-divider"/>
                  <div className="plan-features">
                    {p.features.map((f,j)=>(
                      <div key={j} className={`plan-feat ${f.ok?'':'off'}`}>
                        <span className={f.ok?'plan-check':'plan-x'}>{f.ok?'✓':'×'}</span>{f.t}
                      </div>
                    ))}
                  </div>
                  <button className="plan-btn" onClick={()=>navigate('/auth')}>Start free trial</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="cta-wrap">
        <div className="cta-grain"/>
        <div className="cta-glow"/>
        <div data-rv style={{position:'relative',zIndex:1}}>
          <div className="s-tag" style={{justifyContent:'center',marginBottom:'1.25rem'}}>
            <div className="s-tag-line" style={{background:'rgba(176,141,74,.5)'}}/>
            <span className="s-tag-text" style={{color:'rgba(176,141,74,.7)'}}>Get started today</span>
            <div className="s-tag-line" style={{background:'rgba(176,141,74,.5)'}}/>
          </div>
          <div className="cta-title">Your clients deserve<br/>a <em>professional experience.</em></div>
          <div className="cta-sub">Join thousands of service professionals who replaced their DM chaos with a system that works while they sleep.</div>
          <div className="cta-actions">
            <button className="btn-gold" onClick={()=>navigate('/auth')}>Start your free trial</button>
            <button className="btn-ghost" onClick={()=>document.getElementById('how')?.scrollIntoView({behavior:'smooth'})}>See how it works</button>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer>
        <div className="foot-logo">Organized<span>.</span></div>
        <div className="foot-links">
          {['Privacy','Terms','Contact','Instagram'].map(l=><span key={l} className="foot-link">{l}</span>)}
        </div>
        <div className="foot-copy">© 2026 Organized — beorganized.io</div>
      </footer>
    </div>
  )
}
