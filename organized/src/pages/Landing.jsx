import { useNavigate } from 'react-router-dom'

const css = `
  @media (max-width: 600px) {
    .landing-nav { padding: 0 1.25rem !important; }
    .landing-hero { padding: 3rem 1.5rem 3rem !important; min-height: calc(100vh - 60px) !important; }
    .landing-h1 { font-size: 2.2rem !important; line-height: 1.15 !important; }
    .landing-sub { font-size: .92rem !important; }
    .landing-btn { width: 100% !important; padding: .85rem 1rem !important; }
    .landing-features { grid-template-columns: 1fr !important; }
    .landing-footer { flex-direction: column !important; gap: .5rem !important; text-align: center !important; padding: 1.5rem !important; }
  }
`

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div style={{background:'#0d0c0a',minHeight:'100vh',fontFamily:'DM Sans,sans-serif'}}>
      <style>{css}</style>
      <nav className="landing-nav" style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 3rem',height:'60px',position:'sticky',top:0,background:'rgba(13,12,10,.92)',backdropFilter:'blur(12px)',borderBottom:'1px solid rgba(255,255,255,.06)',zIndex:100}}>
        <div style={{fontFamily:'Playfair Display,serif',fontSize:'1.3rem',fontWeight:500,color:'#fff'}}>Organized<span style={{color:'#b5893a'}}>.</span></div>
        <button style={{background:'#b5893a',color:'#fff',border:'none',borderRadius:'7px',padding:'.5rem 1.25rem',fontSize:'.82rem',fontWeight:500,cursor:'pointer',fontFamily:'inherit'}} onClick={() => navigate('/auth')}>Get started free</button>
      </nav>
      <div className="landing-hero" style={{minHeight:'calc(100vh - 60px)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center',padding:'6rem 2rem 4rem',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:'-10%',left:'50%',transform:'translateX(-50%)',width:'700px',height:'500px',background:'radial-gradient(ellipse, rgba(181,137,58,.18) 0%, transparent 70%)',pointerEvents:'none'}}/>
        <h1 className="landing-h1" style={{fontFamily:'Playfair Display,serif',fontSize:'clamp(2rem,5vw,5rem)',fontWeight:500,color:'#fff',lineHeight:1.1,maxWidth:'820px',position:'relative',zIndex:1,marginBottom:'1.5rem'}}>
          Stop running your business<br/><em style={{fontStyle:'italic',color:'#b5893a'}}>from your DMs.</em>
        </h1>
        <p className="landing-sub" style={{fontSize:'1rem',color:'rgba(255,255,255,.45)',maxWidth:'520px',lineHeight:1.7,fontWeight:300,position:'relative',zIndex:1,marginBottom:'2.5rem'}}>
          Organized gives every service business a professional booking page, product shop, and client system — all in one place.
        </p>
        <div style={{display:'flex',gap:'1rem',justifyContent:'center',position:'relative',zIndex:1,width:'100%',maxWidth:'400px'}}>
          <button className="landing-btn" style={{background:'#b5893a',color:'#fff',border:'none',borderRadius:'8px',padding:'.85rem 2rem',fontSize:'.9rem',fontWeight:500,cursor:'pointer',fontFamily:'inherit',width:'auto'}} onClick={() => navigate('/auth')}>Start free — no card needed</button>
        </div>
        <p style={{fontSize:'.73rem',color:'rgba(255,255,255,.25)',marginTop:'1rem',position:'relative',zIndex:1}}>14-day free trial. Cancel anytime.</p>
      </div>
      <div style={{background:'#fff',padding:'4rem 1.5rem'}}>
        <div style={{maxWidth:'1080px',margin:'0 auto',textAlign:'center'}}>
          <div style={{fontFamily:'Playfair Display,serif',fontSize:'clamp(1.6rem,4vw,3rem)',fontWeight:500,color:'#0d0c0a',marginBottom:'2.5rem'}}>Everything your business needs.</div>
          <div className="landing-features" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem',textAlign:'left'}}>
            {[
              {name:'Appointment Booking',desc:'Clients book directly from your profile, 24/7. No more back-and-forth.'},
              {name:'Product Shop',desc:'Sell your products directly from your profile page.'},
              {name:'Formations & Courses',desc:'Monetize your expertise with workshops and digital courses.'},
              {name:'Client Management',desc:'Every client, every visit, every dollar — tracked automatically.'},
            ].map((f,i) => (
              <div key={i} style={{border:'1px solid #e4e0d8',borderRadius:'12px',padding:'1.5rem'}}>
                <div style={{fontFamily:'Playfair Display,serif',fontSize:'1.1rem',fontWeight:500,marginBottom:'.4rem'}}>{f.name}</div>
                <div style={{fontSize:'.82rem',color:'#7a7672',lineHeight:1.7,fontWeight:300}}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="landing-footer" style={{background:'#080807',padding:'2rem 3rem',display:'flex',alignItems:'center',justifyContent:'space-between',borderTop:'1px solid rgba(255,255,255,.06)'}}>
        <div style={{fontFamily:'Playfair Display,serif',fontSize:'1.1rem',color:'rgba(255,255,255,.4)'}}>Organized<span style={{color:'#b5893a'}}>.</span></div>
        <div style={{fontSize:'.72rem',color:'rgba(255,255,255,.15)'}}>© 2026 Organized — beorganized.io</div>
      </div>
    </div>
  )
}

