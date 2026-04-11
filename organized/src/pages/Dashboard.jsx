import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const fmt = (n) => `$${Number(n || 0).toLocaleString()}`

// ─── Translations ─────────────────────────────────────────────────────────────
const T = {
  en: {
    overview:'Overview', services:'Services', appointments:'Appointments',
    products:'Products', formations:'Formations', clients:'Clients',
    settings:'Settings', availability:'Availability', signOut:'Sign out',
    morning:'Good morning', afternoon:'Good afternoon', evening:'Good evening',
    revenue:'REVENUE', allTime:'All time', totalBookings:'Total bookings',
    listed:'Listed', totalEnrollments:'Total enrollments',
    todayAppts:"Today's appointments", noApptToday:'No appointments today.',
    copyLink:'Copy link', newBtn:'+ New', scheduled:'scheduled',
    inDays:(n)=>`In ${n} day${n>1?'s':''}`, inHours:(n)=>`In ${Math.round(n)}h`,
    reschedule:'↻ Reschedule', email:'Email', sms:'SMS',
    myProfile:'My Profile', myBusiness:'My Business', language:'Language',
    fullName:'Full name', password:'Password', newPassword:'New password',
    currentPassword:'Current password', saveChanges:'Save changes',
    saving:'Saving...', saved:'Saved ✓', cancel:'Cancel',
    businessName:'Business name', tagline:'Tagline', bio:'Bio',
    location:'Location', businessEmail:'Business email', phone:'Phone',
    instagram:'Instagram', tiktok:'TikTok',
    publishProfile:'Publish profile', unpublish:'Unpublish',
    profileSaved:'Profile saved.', passwordUpdated:'Password updated. Check your email to confirm.',
    blockDate:'Block this date', blocked:'Blocked', unblock:'Unblock',
    noApptThisDay:'No appointments this day.',
    suggestReschedule:'Suggest reschedule to client',
    reason:'Reason (optional)', block:'Block date',
    english:'English', french:'Français', spanish:'Español',
    languageSaved:'Language updated.',
    confirm:'Confirm', decline:'Decline',
    addService:'+ Add service', saveService:'Save service',
    addProduct:'Add product', saveProduct:'Save product',
    createFormation:'Create formation', saveFormation:'Save formation',
    noServices:'No services yet. Add your first service to start receiving bookings.',
    noProducts:'No products yet.', noFormations:'No formations yet.',
    noClients:'No clients yet. They appear here when they book.',
    noAppointments:'No appointments yet.',
    loading:'Loading...', proplan:'Pro Plan',
    monday:'Mon', tuesday:'Tue', wednesday:'Wed', thursday:'Thu',
    friday:'Fri', saturday:'Sat', sunday:'Sun',
    weeklySchedule:'Weekly Schedule', blockedDates:'Blocked Dates',
    open:'Open', closed:'Closed', openTime:'Open time', closeTime:'Close time',
    blockADate:'Block a date', noBlockedDates:'No blocked dates.',
    apptOnThisDay:'Appointments on this day', daysOfWeek:['Su','Mo','Tu','We','Th','Fr','Sa'],
  },
  fr: {
    overview:'Aperçu', services:'Services', appointments:'Rendez-vous',
    products:'Produits', formations:'Formations', clients:'Clients',
    settings:'Paramètres', availability:'Disponibilités', signOut:'Se déconnecter',
    morning:'Bonjour', afternoon:'Bon après-midi', evening:'Bonsoir',
    revenue:'REVENUS', allTime:'Depuis toujours', totalBookings:'Total réservations',
    listed:'Listés', totalEnrollments:'Total inscriptions',
    todayAppts:"Rendez-vous d'aujourd'hui", noApptToday:"Aucun rendez-vous aujourd'hui.",
    copyLink:'Copier le lien', newBtn:'+ Nouveau', scheduled:'prévu(s)',
    inDays:(n)=>`Dans ${n} jour${n>1?'s':''}`, inHours:(n)=>`Dans ${Math.round(n)}h`,
    reschedule:'↻ Reprogrammer', email:'Email', sms:'SMS',
    myProfile:'Mon profil', myBusiness:'Mon entreprise', language:'Langue',
    fullName:'Nom complet', password:'Mot de passe', newPassword:'Nouveau mot de passe',
    currentPassword:'Mot de passe actuel', saveChanges:'Sauvegarder',
    saving:'Sauvegarde...', saved:'Sauvegardé ✓', cancel:'Annuler',
    businessName:"Nom de l'entreprise", tagline:'Slogan', bio:'Bio',
    location:'Localisation', businessEmail:'Email professionnel', phone:'Téléphone',
    instagram:'Instagram', tiktok:'TikTok',
    publishProfile:'Publier le profil', unpublish:'Dépublier',
    profileSaved:'Profil sauvegardé.', passwordUpdated:'Mot de passe mis à jour. Vérifiez votre email.',
    blockDate:'Bloquer cette date', blocked:'Bloqué', unblock:'Débloquer',
    noApptThisDay:'Aucun rendez-vous ce jour.',
    suggestReschedule:'Suggérer un autre créneau au client',
    reason:'Raison (optionnel)', block:'Bloquer',
    english:'English', french:'Français', spanish:'Español',
    languageSaved:'Langue mise à jour.',
    confirm:'Confirmer', decline:'Refuser',
    addService:'+ Ajouter un service', saveService:'Sauvegarder le service',
    addProduct:'Ajouter un produit', saveProduct:'Sauvegarder',
    createFormation:'Créer une formation', saveFormation:'Sauvegarder',
    noServices:'Aucun service. Ajoutez votre premier service pour recevoir des réservations.',
    noProducts:'Aucun produit.', noFormations:'Aucune formation.',
    noClients:'Aucun client. Ils apparaissent ici quand ils réservent.',
    noAppointments:'Aucun rendez-vous.',
    loading:'Chargement...', proplan:'Plan Pro',
    monday:'Lun', tuesday:'Mar', wednesday:'Mer', thursday:'Jeu',
    friday:'Ven', saturday:'Sam', sunday:'Dim',
    weeklySchedule:'Horaires de la semaine', blockedDates:'Dates bloquées',
    open:'Ouvert', closed:'Fermé', openTime:'Heure d\'ouverture', closeTime:'Heure de fermeture',
    blockADate:'Bloquer une date', noBlockedDates:'Aucune date bloquée.',
    apptOnThisDay:'Rendez-vous ce jour', daysOfWeek:['Di','Lu','Ma','Me','Je','Ve','Sa'],
  },
  es: {
    overview:'Resumen', services:'Servicios', appointments:'Citas',
    products:'Productos', formations:'Formaciones', clients:'Clientes',
    settings:'Ajustes', availability:'Disponibilidad', signOut:'Cerrar sesión',
    morning:'Buenos días', afternoon:'Buenas tardes', evening:'Buenas noches',
    revenue:'INGRESOS', allTime:'Todo el tiempo', totalBookings:'Total reservas',
    listed:'Listados', totalEnrollments:'Total inscripciones',
    todayAppts:'Citas de hoy', noApptToday:'No hay citas hoy.',
    copyLink:'Copiar enlace', newBtn:'+ Nueva', scheduled:'programada(s)',
    inDays:(n)=>`En ${n} día${n>1?'s':''}`, inHours:(n)=>`En ${Math.round(n)}h`,
    reschedule:'↻ Reprogramar', email:'Email', sms:'SMS',
    myProfile:'Mi perfil', myBusiness:'Mi negocio', language:'Idioma',
    fullName:'Nombre completo', password:'Contraseña', newPassword:'Nueva contraseña',
    currentPassword:'Contraseña actual', saveChanges:'Guardar cambios',
    saving:'Guardando...', saved:'Guardado ✓', cancel:'Cancelar',
    businessName:'Nombre del negocio', tagline:'Eslogan', bio:'Bio',
    location:'Ubicación', businessEmail:'Email profesional', phone:'Teléfono',
    instagram:'Instagram', tiktok:'TikTok',
    publishProfile:'Publicar perfil', unpublish:'Despublicar',
    profileSaved:'Perfil guardado.', passwordUpdated:'Contraseña actualizada. Revisa tu email.',
    blockDate:'Bloquear esta fecha', blocked:'Bloqueado', unblock:'Desbloquear',
    noApptThisDay:'No hay citas este día.',
    suggestReschedule:'Sugerir reprogramación al cliente',
    reason:'Motivo (opcional)', block:'Bloquear',
    english:'English', french:'Français', spanish:'Español',
    languageSaved:'Idioma actualizado.',
    confirm:'Confirmar', decline:'Rechazar',
    addService:'+ Añadir servicio', saveService:'Guardar servicio',
    addProduct:'Añadir producto', saveProduct:'Guardar',
    createFormation:'Crear formación', saveFormation:'Guardar',
    noServices:'Sin servicios. Añade el primero para recibir reservas.',
    noProducts:'Sin productos.', noFormations:'Sin formaciones.',
    noClients:'Sin clientes. Aparecen aquí cuando reservan.',
    noAppointments:'Sin citas.',
    loading:'Cargando...', proplan:'Plan Pro',
    monday:'Lun', tuesday:'Mar', wednesday:'Mié', thursday:'Jue',
    friday:'Vie', saturday:'Sáb', sunday:'Dom',
    weeklySchedule:'Horario semanal', blockedDates:'Fechas bloqueadas',
    open:'Abierto', closed:'Cerrado', openTime:'Hora de apertura', closeTime:'Hora de cierre',
    blockADate:'Bloquear una fecha', noBlockedDates:'Sin fechas bloqueadas.',
    apptOnThisDay:'Citas este día', daysOfWeek:['Do','Lu','Ma','Mi','Ju','Vi','Sá'],
  }
}

// ─── Dashboard ───────────────────────────────────────────────────────────────
export default function Dashboard({ session }) {
  const [page, setPage] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [workspace, setWorkspace] = useState(null)
  const [ownerName, setOwnerName] = useState('')
  const [ownerData, setOwnerData] = useState(null)
  const [language, setLanguage] = useState('en')
  const [toast, setToast] = useState('')
  const [showMenu, setShowMenu] = useState(false)

  const t = T[language] || T.en

  useEffect(() => { fetchAll() }, [session])

  async function fetchAll() {
    const { data: ws } = await supabase.from('workspaces').select('*').eq('user_id', session.user.id).single()
    setWorkspace(ws)
    const { data: usr } = await supabase.from('users').select('*').eq('id', session.user.id).single()
    if (usr) {
      setOwnerData(usr)
      setOwnerName(usr.full_name?.split(' ')[0] || '')
      if (usr.language) setLanguage(usr.language)
    }
  }

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(''), 3000) }

  async function handleSignOut() {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const navItems = [
    { key: 'overview', label: t.overview },
    { key: 'services', label: t.services },
    { key: 'appointments', label: t.appointments },
    { key: 'products', label: t.products },
    { key: 'formations', label: t.formations },
    { key: 'clients', label: t.clients },
    { key: 'availability', label: t.availability },
    { key: 'settings', label: t.settings },
  ]

  return (
    <>
      <style>{css}</style>
      <div className="db-shell">
        <div className="db-topbar">
          <div style={{display:'flex',alignItems:'center',gap:'.85rem'}}>
            <button className={`hamburger ${sidebarOpen?'open':''}`} onClick={()=>setSidebarOpen(o=>!o)}>
              <span/><span/><span/>
            </button>
            <div
              className="db-logo" translate="no"
              style={{cursor:'pointer'}}
              onClick={()=>{setPage('overview');setSidebarOpen(false)}}
            >
              <span className="notranslate">Organized</span><span className="db-logo-dot">.</span>
            </div>
          </div>
          <div className="db-topbar-right">
            <div style={{position:'relative'}}>
              <div className="db-avatar" onClick={()=>setShowMenu(o=>!o)}>
                {session.user.email?.[0]?.toUpperCase()}
              </div>
              {showMenu && (
                <div style={{position:'absolute',right:0,top:'42px',background:'#fff',border:'1px solid #e4e2dc',borderRadius:'10px',boxShadow:'0 8px 24px rgba(0,0,0,.1)',minWidth:'180px',zIndex:100,overflow:'hidden'}}>
                  <div style={{padding:'.65rem 1rem',fontSize:'.75rem',color:'#7a7774',borderBottom:'1px solid #e4e2dc'}}>{session.user.email}</div>
                  <div style={{padding:'.65rem 1rem',fontSize:'.82rem',color:'#111110',cursor:'pointer'}} onClick={()=>{setPage('settings');setShowMenu(false)}}>{t.settings}</div>
                  <div style={{padding:'.65rem 1rem',fontSize:'.82rem',color:'#c0392b',cursor:'pointer',borderTop:'1px solid #e4e2dc'}} onClick={handleSignOut}>{t.signOut}</div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="db-body">
          {sidebarOpen && <div className="db-backdrop" onClick={()=>setSidebarOpen(false)}/>}
          <aside className={`db-sidebar ${sidebarOpen?'open':''}`}>
            <div className="db-sidebar-label">Workspace</div>
            {navItems.map(n => (
              <div key={n.key} className={`db-nav-item ${page===n.key?'active':''}`}
                onClick={()=>{setPage(n.key);setSidebarOpen(false)}}>
                {n.label}
              </div>
            ))}
            <div className="db-sidebar-label" style={{marginTop:'1rem'}}>Account</div>
            <div className="db-nav-item" onClick={handleSignOut}>{t.signOut}</div>
            <div className="db-sidebar-footer">
              <div className="db-plan-label">{t.proplan}</div>
              <a
                className="db-plan-sub db-slug-link"
                href={workspace?.slug ? `https://beorganized.io/${workspace.slug}` : undefined}
                target="_blank" rel="noopener noreferrer"
                onClick={e => { if (!workspace?.slug) e.preventDefault() }}
              >
                beorganized.io/{workspace?.slug || '...'}
              </a>
              <div className="db-plan-bar"><div className="db-plan-fill"/></div>
            </div>
          </aside>

          <main className="db-main">
            {page==='overview'     && <Overview workspace={workspace} toast={showToast} setPage={setPage} ownerName={ownerName} t={t}/>}
            {page==='services'     && <Services workspace={workspace} toast={showToast} t={t}/>}
            {page==='appointments' && <Appointments workspace={workspace} toast={showToast} t={t}/>}
            {page==='products'     && <Products workspace={workspace} toast={showToast} t={t}/>}
            {page==='formations'   && <Formations workspace={workspace} toast={showToast} t={t}/>}
            {page==='clients'      && <Clients workspace={workspace} toast={showToast} t={t}/>}
            {page==='availability' && <Availability workspace={workspace} toast={showToast} t={t}/>}
            {page==='settings'     && <Settings workspace={workspace} toast={showToast} refetch={fetchAll} session={session} ownerData={ownerData} language={language} setLanguage={setLanguage} t={t}/>}
          </main>
        </div>

        {toast && <div className="db-toast">{toast}</div>}
      </div>
    </>
  )
}

// ─── Next Appointment Card ───────────────────────────────────────────────────
function NextAppointmentCard({ appt, t }) {
  const now = new Date()
  const apptDate = new Date(appt.scheduled_at)
  const diffHours = (apptDate - now) / (1000 * 60 * 60)
  const diffDays = Math.floor(diffHours / 24)
  const timeLabel = diffHours < 24 ? t.inHours(diffHours) : t.inDays(diffDays)
  const isUrgent = diffHours < 24
  const emailSubject = encodeURIComponent(`Votre rendez-vous — ${apptDate.toLocaleDateString()}`)
  const emailBody = encodeURIComponent(`Bonjour ${appt.client_name},\n\nJe vous contacte concernant votre rendez-vous prévu le ${apptDate.toLocaleDateString()} à ${apptDate.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}.\n\n`)
  const smsBody = encodeURIComponent(`Bonjour ${appt.client_name}, je vous contacte pour votre rendez-vous le ${apptDate.toLocaleDateString()} à ${apptDate.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}.`)

  return (
    <div className={`nxt-card ${isUrgent?'nxt-urgent':''}`}>
      <div className="nxt-top">
        <div className="nxt-badge">{timeLabel}</div>
        <div className="nxt-dot"/>
      </div>
      <div className="nxt-name">{appt.client_name}</div>
      <div className="nxt-time">
        {apptDate.toLocaleDateString(undefined,{weekday:'long',day:'numeric',month:'long'})}
        {' · '}
        {apptDate.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}
      </div>
      <div className="nxt-actions">
        {appt.client_email && <a className="nxt-btn nxt-btn-email" href={`mailto:${appt.client_email}?subject=${emailSubject}&body=${emailBody}`}>✉ {t.email}</a>}
        {appt.client_phone && <a className="nxt-btn nxt-btn-sms" href={`sms:${appt.client_phone}&body=${smsBody}`}>💬 {t.sms}</a>}
        <span className="nxt-reschedule">{t.reschedule}</span>
      </div>
    </div>
  )
}

// ─── Revenue Panel ───────────────────────────────────────────────────────────
function RevenuePanel({ appts, onClose }) {
  const now = new Date()
  const year = now.getFullYear(), month = now.getMonth()
  const monthName = now.toLocaleDateString(undefined, { month:'long', year:'numeric' })
  const daysInMonth = new Date(year, month+1, 0).getDate()
  const dailyRevenue = Array.from({length:daysInMonth},(_,i)=>{
    const day=i+1
    const dayStr=`${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
    const total=appts.filter(a=>a.scheduled_at?.startsWith(dayStr)&&a.status==='confirmed').reduce((s,a)=>s+Number(a.amount||0),0)
    return {day,total}
  })
  const nonZero=dailyRevenue.filter(d=>d.total>0)
  const maxVal=Math.max(...dailyRevenue.map(d=>d.total),1)
  const highest=nonZero.length?nonZero.reduce((a,b)=>a.total>b.total?a:b):null
  const lowest=nonZero.length>1?nonZero.reduce((a,b)=>a.total<b.total?a:b):null
  const avg=nonZero.length?Math.round(nonZero.reduce((s,d)=>s+d.total,0)/nonZero.length):0
  const narrative=nonZero.length===0
    ?'Aucun revenu confirmé ce mois-ci. Dès que tu confirmes des rendez-vous, ton analyse apparaîtra ici.'
    :[`En ${monthName},`,highest?` ton meilleur jour était le ${highest.day} avec ${fmt(highest.total)}.`:'',avg>0?` Ta moyenne journalière est de ${fmt(avg)}.`:'',lowest&&lowest.day!==highest?.day?` Ton jour le plus bas était le ${lowest.day} avec ${fmt(lowest.total)}.`:''].join('')

  return (
    <div className="rev-overlay" onClick={onClose}>
      <div className="rev-panel" onClick={e=>e.stopPropagation()}>
        <div className="rev-panel-head">
          <div><div className="rev-panel-title">Revenus</div><div className="rev-panel-sub">{monthName}</div></div>
          <button className="rev-close" onClick={onClose}>✕</button>
        </div>
        <div className="rev-chart-wrap">
          <svg width="100%" height="120" viewBox={`0 0 ${daysInMonth*14} 120`} preserveAspectRatio="none">
            <defs><linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#c9a96e"/><stop offset="100%" stopColor="#e8d5b0"/></linearGradient></defs>
            {dailyRevenue.map(({day,total})=>{
              const barH=total>0?Math.max((total/maxVal)*100,6):3
              const x=(day-1)*14+2
              return <g key={day}><rect x={x} y={120-barH} width={10} height={barH} rx={3} fill={highest?.day===day?'#b5893a':total>0?'url(#barGrad)':'#f0ece4'}/></g>
            })}
          </svg>
          <div className="rev-axis">
            {[1,8,15,22,daysInMonth].map(d=>(
              <span key={d} style={{position:'absolute',left:`${((d-1)/daysInMonth)*100}%`,transform:'translateX(-50%)'}}>
                {d}
              </span>
            ))}
          </div>
        </div>
        {nonZero.length>0&&(
          <div className="rev-pills">
            {highest&&<div className="rev-pill"><span className="rev-pill-icon">↑</span><div><div className="rev-pill-label">Meilleur jour</div><div className="rev-pill-val">{fmt(highest.total)} · jour {highest.day}</div></div></div>}
            <div className="rev-pill"><span className="rev-pill-icon rev-pill-avg">⌀</span><div><div className="rev-pill-label">Moyenne / jour actif</div><div className="rev-pill-val">{fmt(avg)}</div></div></div>
            {lowest&&lowest.day!==highest?.day&&<div className="rev-pill"><span className="rev-pill-icon rev-pill-low">↓</span><div><div className="rev-pill-label">Jour le plus bas</div><div className="rev-pill-val">{fmt(lowest.total)} · jour {lowest.day}</div></div></div>}
          </div>
        )}
        <div className="rev-narrative">{narrative}</div>
      </div>
    </div>
  )
}

// ─── Mini Calendar ───────────────────────────────────────────────────────────
function MiniCalendar({ appts, blockedDates, onSelectDay, t }) {
  const [viewDate, setViewDate] = useState(new Date())
  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month+1, 0).getDate()
  const monthName = viewDate.toLocaleDateString(undefined, {month:'long', year:'numeric'})

  const apptDays = new Set(appts.map(a => a.scheduled_at?.split('T')[0]))
  const blockedSet = new Set(blockedDates.map(b => b.blocked_date))

  const cells = []
  for (let i=0; i<firstDay; i++) cells.push(null)
  for (let d=1; d<=daysInMonth; d++) cells.push(d)

  function dayStr(d) {
    return `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="cal-wrap">
      <div className="cal-head">
        <button className="cal-nav" onClick={()=>setViewDate(new Date(year,month-1,1))}>‹</button>
        <div className="cal-month">{monthName}</div>
        <button className="cal-nav" onClick={()=>setViewDate(new Date(year,month+1,1))}>›</button>
      </div>
      <div className="cal-grid-header">
        {t.daysOfWeek.map(d=><div key={d} className="cal-dow">{d}</div>)}
      </div>
      <div className="cal-grid">
        {cells.map((d,i)=>{
          if (!d) return <div key={i} className="cal-cell cal-empty"/>
          const ds = dayStr(d)
          const hasAppt = apptDays.has(ds)
          const isBlocked = blockedSet.has(ds)
          const isToday = ds === today
          return (
            <button
              key={i}
              className={`cal-cell cal-day ${isToday?'cal-today':''} ${isBlocked?'cal-blocked':''} ${hasAppt?'cal-has-appt':''}`}
              onClick={()=>onSelectDay(ds, d)}
            >
              {d}
              {hasAppt && !isBlocked && <span className="cal-dot cal-dot-appt"/>}
              {isBlocked && <span className="cal-dot cal-dot-blocked"/>}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Day Panel ───────────────────────────────────────────────────────────────
function DayPanel({ dayStr, appts, blockedDates, onClose, onBlock, onUnblock, t }) {
  const [reason, setReason] = useState('')
  const dayAppts = appts.filter(a => a.scheduled_at?.startsWith(dayStr))
  const blocked = blockedDates.find(b => b.blocked_date === dayStr)
  const label = new Date(dayStr+'T12:00:00').toLocaleDateString(undefined,{weekday:'long',day:'numeric',month:'long'})

  return (
    <div className="rev-overlay" onClick={onClose}>
      <div className="rev-panel" onClick={e=>e.stopPropagation()}>
        <div className="rev-panel-head">
          <div><div className="rev-panel-title" style={{fontSize:'1.2rem',textTransform:'capitalize'}}>{label}</div></div>
          <button className="rev-close" onClick={onClose}>✕</button>
        </div>

        {dayAppts.length > 0 ? (
          <div style={{marginBottom:'1.25rem'}}>
            <div style={{fontSize:'.75rem',fontWeight:600,color:'var(--ink-3)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:'.75rem'}}>{t.apptOnThisDay}</div>
            {dayAppts.map(a=>(
              <div key={a.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'.75rem 1rem',background:'var(--bg)',borderRadius:'10px',marginBottom:'.5rem'}}>
                <div>
                  <div style={{fontWeight:600,fontSize:'.88rem'}}>{a.client_name}</div>
                  <div style={{fontSize:'.75rem',color:'var(--ink-3)'}}>{new Date(a.scheduled_at).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</div>
                </div>
                <div style={{display:'flex',gap:'.4rem',alignItems:'center'}}>
                  <span className={`db-badge db-badge-${a.status}`}>{a.status}</span>
                  {a.client_email && (
                    <a className="nxt-btn nxt-btn-email" style={{fontSize:'.7rem',padding:'.25rem .6rem'}}
                      href={`mailto:${a.client_email}?subject=Reprogrammation de votre rendez-vous&body=Bonjour ${a.client_name},%0A%0ANous devons reprogrammer votre rendez-vous du ${label}.%0A%0ACordialement`}>
                      {t.suggestReschedule}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{padding:'1rem',textAlign:'center',color:'var(--ink-3)',fontSize:'.85rem',marginBottom:'1rem'}}>{t.noApptThisDay}</div>
        )}

        {blocked ? (
          <div style={{background:'#fef2f2',border:'1px solid #fecaca',borderRadius:'10px',padding:'1rem',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div>
              <div style={{fontWeight:600,fontSize:'.85rem',color:'#c0392b'}}>🔒 {t.blocked}</div>
              {blocked.reason && <div style={{fontSize:'.75rem',color:'#c0392b',marginTop:'.2rem'}}>{blocked.reason}</div>}
            </div>
            <button className="db-btn db-btn-secondary db-btn-xs" onClick={()=>onUnblock(blocked.id)}>{t.unblock}</button>
          </div>
        ) : (
          <div style={{borderTop:'1px solid var(--border)',paddingTop:'1rem'}}>
            <div style={{fontSize:'.75rem',fontWeight:600,color:'var(--ink-3)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:'.75rem'}}>{t.blockDate}</div>
            <div className="db-field" style={{marginBottom:'.75rem'}}>
              <label>{t.reason}</label>
              <input value={reason} onChange={e=>setReason(e.target.value)} placeholder="Vacances, indisponibilité..."/>
            </div>
            <button className="db-btn db-btn-primary" style={{width:'100%',justifyContent:'center'}} onClick={()=>onBlock(dayStr,reason)}>
              🔒 {t.block}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Overview ────────────────────────────────────────────────────────────────
function Overview({ workspace, toast, setPage, ownerName, t }) {
  const [appts, setAppts] = useState([])
  const [allAppts, setAllAppts] = useState([])
  const [nextAppt, setNextAppt] = useState(null)
  const [stats, setStats] = useState({revenue:0,appointments:0,products:0,students:0})
  const [showRevenue, setShowRevenue] = useState(false)
  const [blockedDates, setBlockedDates] = useState([])
  const [selectedDay, setSelectedDay] = useState(null)

  useEffect(()=>{
    if(!workspace) return
    fetchData()
    const ch=supabase.channel('overview-changes')
      .on('postgres_changes',{event:'*',schema:'public',table:'appointments',filter:`workspace_id=eq.${workspace.id}`},()=>fetchData())
      .subscribe()
    return ()=>supabase.removeChannel(ch)
  },[workspace])

  async function fetchData() {
    const today=new Date().toISOString().split('T')[0]
    const [a,p,e,b]=await Promise.all([
      supabase.from('appointments').select('*').eq('workspace_id',workspace.id),
      supabase.from('products').select('*').eq('workspace_id',workspace.id),
      supabase.from('enrollments').select('*').eq('workspace_id',workspace.id),
      supabase.from('blocked_dates').select('*').eq('workspace_id',workspace.id),
    ])
    const apptData=a.data||[]
    setStats({revenue:apptData.reduce((s,x)=>s+Number(x.amount||0),0),appointments:apptData.length,products:(p.data||[]).length,students:(e.data||[]).length})
    setAllAppts(apptData)
    setAppts(apptData.filter(x=>x.scheduled_at?.startsWith(today)))
    setBlockedDates(b.data||[])
    const now=new Date()
    const in3days=new Date(now.getTime()+3*24*60*60*1000)
    const upcoming=apptData.filter(a=>{const d=new Date(a.scheduled_at);return d>now&&d<=in3days&&a.status!=='cancelled'}).sort((a,b)=>new Date(a.scheduled_at)-new Date(b.scheduled_at))
    setNextAppt(upcoming[0]||null)
  }

  async function handleBlock(dayStr, reason) {
    await supabase.from('blocked_dates').insert({workspace_id:workspace.id,blocked_date:dayStr,reason})
    toast(t.blockDate+' ✓')
    setSelectedDay(null)
    fetchData()
  }

  async function handleUnblock(id) {
    await supabase.from('blocked_dates').delete().eq('id',id)
    toast(t.unblock+' ✓')
    setSelectedDay(null)
    fetchData()
  }

  function getGreeting() {
    const h=new Date().getHours()
    if(h<12) return t.morning
    if(h<18) return t.afternoon
    return t.evening
  }

  return (
    <div>
      <div className="db-page-head">
        <div>
          <div className="db-page-title">{getGreeting()}{ownerName?`, ${ownerName}`:''} 👋</div>
          <div className="db-page-sub">{new Date().toLocaleDateString(undefined,{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</div>
        </div>
        <div style={{display:'flex',gap:'.6rem',flexWrap:'wrap'}}>
          <button className="db-btn db-btn-secondary db-btn-xs" onClick={()=>toast('Booking link copied!')}>{t.copyLink}</button>
          <button className="db-btn db-btn-primary db-btn-xs" onClick={()=>toast('New appointment coming soon.')}>{t.newBtn}</button>
        </div>
      </div>

      {nextAppt && <NextAppointmentCard appt={nextAppt} t={t}/>}

      <div className="db-stats-row">
        {[
          {label:t.revenue, value:fmt(stats.revenue), delta:t.allTime, page:'revenue'},
          {label:t.appointments.toUpperCase(), value:stats.appointments, delta:t.totalBookings, page:'appointments'},
          {label:t.products.toUpperCase(), value:stats.products, delta:t.listed, page:'products'},
          {label:'STUDENTS', value:stats.students, delta:t.totalEnrollments, page:'formations'},
        ].map((s,i)=>(
          <button key={i} className="db-stat-card db-stat-card-btn"
            onClick={()=>s.page==='revenue'?setShowRevenue(true):setPage(s.page)}>
            <div className="db-stat-label">{s.label}</div>
            <div className="db-stat-value">{s.value}</div>
            <div className="db-stat-delta">{s.delta}</div>
            <div className="db-stat-arrow">→</div>
          </button>
        ))}
      </div>

      <div className="db-card" style={{marginBottom:'1.25rem'}}>
        <div className="db-card-head">
          <div className="db-card-title">📅 Calendrier</div>
        </div>
        <div style={{padding:'1rem'}}>
          <MiniCalendar
            appts={allAppts}
            blockedDates={blockedDates}
            onSelectDay={(ds,d)=>setSelectedDay(ds)}
            t={t}
          />
        </div>
      </div>

      <div className="db-card">
        <div className="db-card-head">
          <div className="db-card-title">{t.todayAppts}</div>
          <span className="db-badge db-badge-confirmed">● {appts.length} {t.scheduled}</span>
        </div>
        {appts.length===0
          ?<div style={{padding:'2rem',textAlign:'center',color:'var(--ink-3)',fontSize:'.85rem'}}>{t.noApptToday}</div>
          :<table className="db-tbl">
            <thead><tr><th>Client</th><th>Time</th><th>Amount</th><th>Status</th></tr></thead>
            <tbody>{appts.map(a=>(
              <tr key={a.id}>
                <td className="db-tbl-name">{a.client_name}</td>
                <td>{new Date(a.scheduled_at).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</td>
                <td className="db-tbl-amount">{fmt(a.amount)}</td>
                <td><span className={`db-badge db-badge-${a.status}`}>{a.status}</span></td>
              </tr>
            ))}</tbody>
          </table>
        }
      </div>

      {showRevenue && <RevenuePanel appts={allAppts} onClose={()=>setShowRevenue(false)}/>}
      {selectedDay && (
        <DayPanel
          dayStr={selectedDay}
          appts={allAppts}
          blockedDates={blockedDates}
          onClose={()=>setSelectedDay(null)}
          onBlock={handleBlock}
          onUnblock={handleUnblock}
          t={t}
        />
      )}
    </div>
  )
}

// ─── Appointments ────────────────────────────────────────────────────────────
function Appointments({ workspace, toast, t }) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    if(!workspace) return
    fetchData()
    const ch=supabase.channel('appts-ch')
      .on('postgres_changes',{event:'*',schema:'public',table:'appointments',filter:`workspace_id=eq.${workspace.id}`},()=>fetchData())
      .subscribe()
    return ()=>supabase.removeChannel(ch)
  },[workspace])

  async function fetchData() {
    const {data}=await supabase.from('appointments').select('*').eq('workspace_id',workspace.id).order('scheduled_at',{ascending:false})
    setData(data||[]); setLoading(false)
  }

  async function confirm(id){await supabase.from('appointments').update({status:'confirmed'}).eq('id',id);toast(t.confirm+' ✓')}
  async function decline(id){await supabase.from('appointments').update({status:'cancelled'}).eq('id',id);toast(t.decline+' ✓')}

  return (
    <div>
      <div className="db-page-head"><div><div className="db-page-title">{t.appointments}</div><div className="db-page-sub">Manage your bookings</div></div></div>
      <div className="db-card">
        {loading?<div style={{padding:'2rem',color:'var(--ink-3)'}}>{t.loading}</div>
          :data.length===0?<div style={{padding:'2rem',textAlign:'center',color:'var(--ink-3)',fontSize:'.85rem'}}>{t.noAppointments}</div>
          :<table className="db-tbl">
            <thead><tr><th>Client</th><th>Date</th><th>Time</th><th>Amount</th><th>Status</th><th></th></tr></thead>
            <tbody>{data.map(a=>(
              <tr key={a.id}>
                <td className="db-tbl-name">{a.client_name}</td>
                <td>{new Date(a.scheduled_at).toLocaleDateString()}</td>
                <td>{new Date(a.scheduled_at).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</td>
                <td className="db-tbl-amount">{fmt(a.amount)}</td>
                <td><span className={`db-badge db-badge-${a.status}`}>{a.status}</span></td>
                <td style={{display:'flex',gap:'.4rem'}}>
                  {a.status==='pending'&&<>
                    <button className="db-btn db-btn-secondary db-btn-xs" onClick={()=>confirm(a.id)}>{t.confirm}</button>
                    <button className="db-btn db-btn-xs" style={{color:'#c0392b',border:'1px solid #fecaca',background:'#fff'}} onClick={()=>decline(a.id)}>{t.decline}</button>
                  </>}
                </td>
              </tr>
            ))}</tbody>
          </table>
        }
      </div>
    </div>
  )
}

// ─── Services ────────────────────────────────────────────────────────────────
function Services({ workspace, toast, t }) {
  const [data,setData]=useState([])
  const [showForm,setShowForm]=useState(false)
  const [form,setForm]=useState({name:'',price:'',duration_min:'',description:''})
  const [loading,setLoading]=useState(false)

  useEffect(()=>{if(workspace)fetchData()},[workspace])

  async function fetchData(){const{data}=await supabase.from('services').select('*').eq('workspace_id',workspace.id).order('display_order',{ascending:true});setData(data||[])}
  async function add(e){e.preventDefault();setLoading(true);await supabase.from('services').insert({workspace_id:workspace.id,name:form.name,price:parseFloat(form.price)||0,duration_min:parseInt(form.duration_min)||null,description:form.description,is_free:parseFloat(form.price)===0});toast(`${form.name} added.`);setForm({name:'',price:'',duration_min:'',description:''});setShowForm(false);setLoading(false);fetchData()}
  async function remove(id,name){await supabase.from('services').delete().eq('id',id);toast(`${name} removed.`);fetchData()}
  async function toggle(id,current){await supabase.from('services').update({is_active:!current}).eq('id',id);fetchData()}

  return (
    <div>
      <div className="db-page-head">
        <div><div className="db-page-title">{t.services}</div><div className="db-page-sub">What you offer — appears on your public profile</div></div>
        <button className="db-btn db-btn-primary" onClick={()=>setShowForm(s=>!s)}>{showForm?t.cancel:t.addService}</button>
      </div>
      {showForm&&(
        <div className="db-card" style={{marginBottom:'1.25rem'}}>
          <div className="db-card-head"><div className="db-card-title">New service</div></div>
          <form onSubmit={add} style={{padding:'1.4rem',display:'flex',flexDirection:'column',gap:'1rem'}}>
            <div className="db-field"><label>Service name</label><input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="e.g. Box Braids" required/></div>
            <div className="db-field"><label>Price (CAD)</label><input type="number" value={form.price} onChange={e=>setForm(f=>({...f,price:e.target.value}))} placeholder="180" required/></div>
            <div className="db-field"><label>Duration (min)</label><input type="number" value={form.duration_min} onChange={e=>setForm(f=>({...f,duration_min:e.target.value}))} placeholder="240"/></div>
            <div className="db-field"><label>Description</label><input value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))}/></div>
            <button type="submit" className="db-btn db-btn-primary" style={{width:'100%',justifyContent:'center',padding:'.75rem'}} disabled={loading}>{loading?t.saving:t.saveService}</button>
          </form>
        </div>
      )}
      <div className="db-card">
        {data.length===0?<div style={{padding:'3rem',textAlign:'center',color:'var(--ink-3)',fontSize:'.85rem'}}>{t.noServices}</div>
          :<table className="db-tbl"><thead><tr><th>Service</th><th>Price</th><th>Duration</th><th>Status</th><th></th></tr></thead>
            <tbody>{data.map(s=>(
              <tr key={s.id}>
                <td className="db-tbl-name">{s.name}</td>
                <td className="db-tbl-amount">{s.is_free?'Free':fmt(s.price)}</td>
                <td>{s.duration_min?`${s.duration_min} min`:'—'}</td>
                <td><span className={`db-badge ${s.is_active?'db-badge-confirmed':'db-badge-cancelled'}`}>{s.is_active?'Active':'Hidden'}</span></td>
                <td style={{display:'flex',gap:'.4rem'}}>
                  <button className="db-btn db-btn-secondary db-btn-xs" onClick={()=>toggle(s.id,s.is_active)}>{s.is_active?'Hide':'Show'}</button>
                  <button className="db-btn db-btn-xs" style={{color:'#c0392b',border:'1px solid #fecaca',background:'#fff'}} onClick={()=>remove(s.id,s.name)}>Delete</button>
                </td>
              </tr>
            ))}</tbody>
          </table>
        }
      </div>
    </div>
  )
}

// ─── Products ────────────────────────────────────────────────────────────────
function Products({ workspace, toast, t }) {
  const [data,setData]=useState([])
  const [showForm,setShowForm]=useState(false)
  const [form,setForm]=useState({name:'',price:'',stock:'',description:''})

  useEffect(()=>{if(workspace)fetchData()},[workspace])
  async function fetchData(){const{data}=await supabase.from('products').select('*').eq('workspace_id',workspace.id).order('created_at',{ascending:false});setData(data||[])}
  async function add(e){e.preventDefault();await supabase.from('products').insert({workspace_id:workspace.id,name:form.name,price:parseFloat(form.price),stock:parseInt(form.stock)||0,description:form.description});toast(`${form.name} added.`);setForm({name:'',price:'',stock:'',description:''});setShowForm(false);fetchData()}

  return (
    <div>
      <div className="db-page-head">
        <div><div className="db-page-title">{t.products}</div><div className="db-page-sub">Sell from your profile page</div></div>
        <button className="db-btn db-btn-primary" onClick={()=>setShowForm(s=>!s)}>{showForm?t.cancel:t.addProduct}</button>
      </div>
      {showForm&&(
        <div className="db-card" style={{marginBottom:'1.25rem'}}>
          <div className="db-card-head"><div className="db-card-title">New product</div></div>
          <form onSubmit={add} style={{padding:'1.4rem',display:'flex',flexDirection:'column',gap:'1rem'}}>
            <div className="db-field"><label>Product name</label><input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="e.g. Moisture Serum" required/></div>
            <div className="db-field"><label>Price (CAD)</label><input type="number" value={form.price} onChange={e=>setForm(f=>({...f,price:e.target.value}))} placeholder="28" required/></div>
            <div className="db-field"><label>Stock</label><input type="number" value={form.stock} onChange={e=>setForm(f=>({...f,stock:e.target.value}))} placeholder="10"/></div>
            <div className="db-field"><label>Description</label><input value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))}/></div>
            <button type="submit" className="db-btn db-btn-primary" style={{width:'100%',justifyContent:'center',padding:'.75rem'}}>{t.saveProduct}</button>
          </form>
        </div>
      )}
      <div className="db-grid-3">
        {data.map(p=>(
          <div key={p.id} className="db-prod-card">
            <div className="db-prod-img">PRODUCT</div>
            <div className="db-prod-body">
              <div className="db-prod-name">{p.name}</div>
              <div className="db-prod-price">{fmt(p.price)}</div>
              <span className={`db-badge ${p.stock===0?'db-badge-cancelled':p.stock<10?'db-badge-pending':'db-badge-confirmed'}`}>{p.stock===0?'Out of stock':`${p.stock} in stock`}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Formations ──────────────────────────────────────────────────────────────
function Formations({ workspace, toast, t }) {
  const [data,setData]=useState([])
  const [showForm,setShowForm]=useState(false)
  const [form,setForm]=useState({title:'',price:'',duration_label:'',description:''})

  useEffect(()=>{if(workspace)fetchData()},[workspace])
  async function fetchData(){const{data}=await supabase.from('offerings').select('*').eq('workspace_id',workspace.id).order('created_at',{ascending:false});setData(data||[])}
  async function add(e){e.preventDefault();await supabase.from('offerings').insert({workspace_id:workspace.id,title:form.title,price:parseFloat(form.price),duration_label:form.duration_label,description:form.description});toast(`"${form.title}" created.`);setForm({title:'',price:'',duration_label:'',description:''});setShowForm(false);fetchData()}

  return (
    <div>
      <div className="db-page-head">
        <div><div className="db-page-title">{t.formations}</div><div className="db-page-sub">Sell courses and workshops</div></div>
        <button className="db-btn db-btn-primary" onClick={()=>setShowForm(s=>!s)}>{showForm?t.cancel:t.createFormation}</button>
      </div>
      {showForm&&(
        <div className="db-card" style={{marginBottom:'1.25rem'}}>
          <div className="db-card-head"><div className="db-card-title">New formation</div></div>
          <form onSubmit={add} style={{padding:'1.4rem',display:'flex',flexDirection:'column',gap:'1rem'}}>
            <div className="db-field"><label>Title</label><input value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="e.g. Box Braids Masterclass" required/></div>
            <div className="db-field"><label>Price (CAD)</label><input type="number" value={form.price} onChange={e=>setForm(f=>({...f,price:e.target.value}))} placeholder="149" required/></div>
            <div className="db-field"><label>Duration</label><input value={form.duration_label} onChange={e=>setForm(f=>({...f,duration_label:e.target.value}))} placeholder="e.g. 6h"/></div>
            <div className="db-field"><label>Description</label><input value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))}/></div>
            <button type="submit" className="db-btn db-btn-primary" style={{width:'100%',justifyContent:'center',padding:'.75rem'}}>{t.saveFormation}</button>
          </form>
        </div>
      )}
      <div className="db-card">
        {data.length===0?<div style={{padding:'2rem',textAlign:'center',color:'var(--ink-3)',fontSize:'.85rem'}}>{t.noFormations}</div>
          :data.map((f,i)=>(
            <div key={f.id} style={{display:'flex',alignItems:'center',gap:'1.25rem',padding:'1.25rem 1.4rem',borderBottom:'1px solid var(--border)'}}>
              <div style={{fontFamily:'Playfair Display,serif',fontSize:'2rem',color:'var(--border)',minWidth:'32px'}}>0{i+1}</div>
              <div style={{flex:1}}>
                <div style={{fontWeight:600,fontSize:'.88rem'}}>{f.title}</div>
                <div style={{fontSize:'.78rem',color:'var(--ink-3)'}}>{f.description}</div>
                <div style={{fontSize:'.73rem',color:'var(--ink-3)',marginTop:'.35rem'}}>{f.duration_label}</div>
              </div>
              <div style={{fontFamily:'Playfair Display,serif',fontSize:'1.3rem'}}>{fmt(f.price)}</div>
            </div>
          ))
        }
      </div>
    </div>
  )
}

// ─── Clients ─────────────────────────────────────────────────────────────────
function Clients({ workspace, t }) {
  const [data,setData]=useState([])
  const [loading,setLoading]=useState(true)

  useEffect(()=>{if(workspace)fetchData()},[workspace])
  async function fetchData(){const{data}=await supabase.from('clients').select('*').eq('workspace_id',workspace.id).order('created_at',{ascending:false});setData(data||[]);setLoading(false)}

  return (
    <div>
      <div className="db-page-head"><div><div className="db-page-title">{t.clients}</div><div className="db-page-sub">Your client base</div></div></div>
      <div className="db-card">
        {loading?<div style={{padding:'2rem',color:'var(--ink-3)'}}>{t.loading}</div>
          :data.length===0?<div style={{padding:'2rem',textAlign:'center',color:'var(--ink-3)',fontSize:'.85rem'}}>{t.noClients}</div>
          :<table className="db-tbl"><thead><tr><th>Name</th><th>Email</th><th>Visits</th><th>Spent</th><th>Tag</th></tr></thead>
            <tbody>{data.map(c=>(
              <tr key={c.id}>
                <td className="db-tbl-name">{c.full_name}</td>
                <td>{c.email||'—'}</td>
                <td>{c.total_visits}</td>
                <td className="db-tbl-amount">{fmt(c.total_spent)}</td>
                <td>{c.tag?<span className={`db-badge db-badge-${c.tag==='vip'?'vip':c.tag==='new'?'new':'confirmed'}`}>{c.tag.toUpperCase()}</span>:'—'}</td>
              </tr>
            ))}</tbody>
          </table>
        }
      </div>
    </div>
  )
}

// ─── Availability ────────────────────────────────────────────────────────────
function Availability({ workspace, toast, t }) {
  const [schedule,setSchedule]=useState([])
  const [blockedDates,setBlockedDates]=useState([])
  const [blockInput,setBlockInput]=useState({date:'',reason:''})
  const [loading,setLoading]=useState(true)

  const dayNames=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']

  useEffect(()=>{if(workspace)fetchData()},[workspace])

  async function fetchData(){
    const[a,b]=await Promise.all([
      supabase.from('availability').select('*').eq('workspace_id',workspace.id).order('day_of_week'),
      supabase.from('blocked_dates').select('*').eq('workspace_id',workspace.id).order('blocked_date'),
    ])
    setSchedule(a.data||[])
    setBlockedDates(b.data||[])
    setLoading(false)
  }

  async function toggleDay(id,current){await supabase.from('availability').update({is_open:!current}).eq('id',id);fetchData()}
  async function updateTime(id,field,value){await supabase.from('availability').update({[field]:value}).eq('id',id);fetchData()}

  async function addBlock(e){
    e.preventDefault()
    if(!blockInput.date) return
    await supabase.from('blocked_dates').insert({workspace_id:workspace.id,blocked_date:blockInput.date,reason:blockInput.reason})
    toast(t.blockDate+' ✓')
    setBlockInput({date:'',reason:''})
    fetchData()
  }

  async function removeBlock(id){await supabase.from('blocked_dates').delete().eq('id',id);fetchData()}

  if(loading) return <div style={{padding:'2rem',color:'var(--ink-3)'}}>{t.loading}</div>

  return (
    <div>
      <div className="db-page-head"><div><div className="db-page-title">{t.availability}</div><div className="db-page-sub">Set your schedule and block dates</div></div></div>

      <div className="db-card" style={{marginBottom:'1.25rem'}}>
        <div className="db-card-head"><div className="db-card-title">{t.weeklySchedule}</div></div>
        <div style={{padding:'0 1.4rem'}}>
          {schedule.map(day=>(
            <div key={day.id} style={{display:'flex',alignItems:'center',gap:'1rem',padding:'.9rem 0',borderBottom:'1px solid var(--border)'}}>
              <div style={{width:'90px',fontWeight:500,fontSize:'.85rem'}}>{dayNames[day.day_of_week]}</div>
              <button
                className={`db-btn db-btn-xs ${day.is_open?'db-btn-primary':'db-btn-secondary'}`}
                onClick={()=>toggleDay(day.id,day.is_open)}
                style={{minWidth:'68px',justifyContent:'center'}}
              >
                {day.is_open?t.open:t.closed}
              </button>
              {day.is_open&&(
                <div style={{display:'flex',alignItems:'center',gap:'.5rem',flex:1}}>
                  <input type="time" value={day.open_time||'09:00'} className="avail-time-input"
                    onChange={e=>updateTime(day.id,'open_time',e.target.value)}/>
                  <span style={{color:'var(--ink-3)',fontSize:'.8rem'}}>→</span>
                  <input type="time" value={day.close_time||'18:00'} className="avail-time-input"
                    onChange={e=>updateTime(day.id,'close_time',e.target.value)}/>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="db-card">
        <div className="db-card-head"><div className="db-card-title">{t.blockedDates}</div></div>
        <form onSubmit={addBlock} style={{padding:'1.25rem 1.4rem',display:'flex',gap:'.75rem',flexWrap:'wrap',alignItems:'flex-end',borderBottom:'1px solid var(--border)'}}>
          <div className="db-field" style={{flex:1,minWidth:'140px'}}>
            <label>{t.blockADate}</label>
            <input type="date" value={blockInput.date} onChange={e=>setBlockInput(f=>({...f,date:e.target.value}))} required/>
          </div>
          <div className="db-field" style={{flex:2,minWidth:'160px'}}>
            <label>{t.reason}</label>
            <input value={blockInput.reason} onChange={e=>setBlockInput(f=>({...f,reason:e.target.value}))} placeholder="Vacances, formation..."/>
          </div>
          <button type="submit" className="db-btn db-btn-primary">🔒 {t.block}</button>
        </form>
        {blockedDates.length===0
          ?<div style={{padding:'2rem',textAlign:'center',color:'var(--ink-3)',fontSize:'.85rem'}}>{t.noBlockedDates}</div>
          :blockedDates.map(b=>(
            <div key={b.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'.85rem 1.4rem',borderBottom:'1px solid var(--border)'}}>
              <div>
                <div style={{fontWeight:500,fontSize:'.85rem'}}>{new Date(b.blocked_date+'T12:00:00').toLocaleDateString(undefined,{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</div>
                {b.reason&&<div style={{fontSize:'.75rem',color:'var(--ink-3)',marginTop:'.15rem'}}>{b.reason}</div>}
              </div>
              <button className="db-btn db-btn-xs" style={{color:'#c0392b',border:'1px solid #fecaca',background:'#fff'}} onClick={()=>removeBlock(b.id)}>{t.unblock}</button>
            </div>
          ))
        }
      </div>
    </div>
  )
}

// ─── Settings ────────────────────────────────────────────────────────────────
function Settings({ workspace, toast, refetch, session, ownerData, language, setLanguage, t }) {
  const [tab, setTab] = useState('profile')

  return (
    <div>
      <div className="db-page-head"><div><div className="db-page-title">{t.settings}</div></div></div>
      <div className="settings-tabs">
        {[
          {key:'profile', label:t.myProfile},
          {key:'business', label:t.myBusiness},
          {key:'language', label:t.language},
        ].map(s=>(
          <button key={s.key} className={`settings-tab ${tab===s.key?'active':''}`} onClick={()=>setTab(s.key)}>{s.label}</button>
        ))}
      </div>

      {tab==='profile'   && <SettingsProfile ownerData={ownerData} session={session} toast={toast} refetch={refetch} t={t}/>}
      {tab==='business'  && <SettingsBusiness workspace={workspace} toast={toast} refetch={refetch} t={t}/>}
      {tab==='language'  && <SettingsLanguage language={language} setLanguage={setLanguage} ownerData={ownerData} toast={toast} refetch={refetch} t={t}/>}
    </div>
  )
}

function SettingsProfile({ ownerData, session, toast, refetch, t }) {
  const [form,setForm]=useState({full_name:ownerData?.full_name||'',email:session.user.email||''})
  const [pwForm,setPwForm]=useState({newPassword:''})
  const [loading,setLoading]=useState(false)
  const [pwLoading,setPwLoading]=useState(false)
  const [saved,setSaved]=useState(false)

  async function saveProfile(e){
    e.preventDefault(); setLoading(true); setSaved(false)
    await supabase.from('users').update({full_name:form.full_name}).eq('id',ownerData.id)
    if(form.email!==session.user.email){
      await supabase.auth.updateUser({email:form.email})
    }
    toast(t.profileSaved); setSaved(true); setLoading(false); refetch()
  }

  async function changePassword(e){
    e.preventDefault(); setPwLoading(true)
    const{error}=await supabase.auth.updateUser({password:pwForm.newPassword})
    if(error){toast(`Error: ${error.message}`)}
    else{toast(t.passwordUpdated); setPwForm({newPassword:''})}
    setPwLoading(false)
  }

  return (
    <div>
      <div className="db-card" style={{marginBottom:'1.25rem'}}>
        <div className="db-card-head"><div className="db-card-title">{t.myProfile}</div></div>
        <form onSubmit={saveProfile} style={{padding:'1.4rem',display:'flex',flexDirection:'column',gap:'1rem'}}>
          <div className="db-field"><label>{t.fullName}</label><input value={form.full_name} onChange={e=>setForm(f=>({...f,full_name:e.target.value}))} required/></div>
          <div className="db-field"><label>{t.email}</label><input type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} required/></div>
          <button type="submit" className="db-btn db-btn-primary" style={{width:'100%',justifyContent:'center',padding:'.75rem'}} disabled={loading}>
            {loading?t.saving:saved?t.saved:t.saveChanges}
          </button>
        </form>
      </div>

      <div className="db-card">
        <div className="db-card-head"><div className="db-card-title">{t.password}</div></div>
        <form onSubmit={changePassword} style={{padding:'1.4rem',display:'flex',flexDirection:'column',gap:'1rem'}}>
          <div className="db-field">
            <label>{t.newPassword}</label>
            <input type="password" value={pwForm.newPassword} onChange={e=>setPwForm({newPassword:e.target.value})} placeholder="Min. 8 characters" minLength={8} required/>
          </div>
          <div style={{fontSize:'.75rem',color:'var(--ink-3)',background:'var(--bg)',padding:'.65rem .85rem',borderRadius:'8px'}}>
            ⓘ A confirmation will be sent to your email before the password changes.
          </div>
          <button type="submit" className="db-btn db-btn-primary" style={{width:'100%',justifyContent:'center',padding:'.75rem'}} disabled={pwLoading}>
            {pwLoading?t.saving:t.saveChanges}
          </button>
        </form>
      </div>
    </div>
  )
}

function SettingsBusiness({ workspace, toast, refetch, t }) {
  const [form,setForm]=useState({
    name:workspace?.name||'', tagline:workspace?.tagline||'', bio:workspace?.bio||'',
    location:workspace?.location||'', email:workspace?.email||'',
    phone:workspace?.phone||'', instagram:workspace?.instagram||'',
    tiktok:workspace?.tiktok||'',
  })
  const [loading,setLoading]=useState(false)
  const [saved,setSaved]=useState(false)

  async function save(e){
    e.preventDefault()
    if(!workspace?.id){toast('Error: workspace not loaded.');return}
    setLoading(true); setSaved(false)
    const{error}=await supabase.from('workspaces').update({
      name:form.name, tagline:form.tagline, bio:form.bio,
      location:form.location, email:form.email,
      phone:form.phone, instagram:form.instagram, tiktok:form.tiktok,
    }).eq('id',workspace.id)
    if(error){toast(`Error: ${error.message}`)}
    else{setSaved(true);toast(t.profileSaved);refetch()}
    setLoading(false)
  }

  async function publish(){
    await supabase.from('workspaces').update({is_published:!workspace.is_published}).eq('id',workspace.id)
    toast(workspace.is_published?t.unpublish+' ✓':t.publishProfile+' ✓')
    refetch()
  }

  return (
    <div className="db-card">
      <div className="db-card-head">
        <div className="db-card-title">{t.myBusiness}</div>
        <button className="db-btn db-btn-secondary db-btn-xs" onClick={publish}>
          {workspace?.is_published?t.unpublish:t.publishProfile}
        </button>
      </div>
      <form onSubmit={save} style={{padding:'1.4rem',display:'flex',flexDirection:'column',gap:'1rem'}}>
        <div className="db-field"><label>{t.businessName}</label><input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} required/></div>
        <div className="db-field"><label>{t.tagline}</label><input value={form.tagline} onChange={e=>setForm(f=>({...f,tagline:e.target.value}))} placeholder="e.g. Natural Hair Specialist · Montreal, QC"/></div>
        <div className="db-field"><label>{t.bio}</label><textarea value={form.bio} onChange={e=>setForm(f=>({...f,bio:e.target.value}))} placeholder="Tell your clients about you and your work..." rows={3} style={{padding:'.7rem 1rem',border:'1px solid var(--border)',borderRadius:'8px',fontFamily:'inherit',fontSize:'.88rem',resize:'vertical',outline:'none'}}/></div>
        <div className="db-field"><label>{t.location}</label><input value={form.location} onChange={e=>setForm(f=>({...f,location:e.target.value}))}/></div>
        <div style={{height:'1px',background:'var(--border)',margin:'.25rem 0'}}/>
        <div style={{fontSize:'.72rem',fontWeight:600,color:'var(--ink-3)',textTransform:'uppercase',letterSpacing:'.07em'}}>Contact</div>
        <div className="db-field"><label>{t.businessEmail}</label><input type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} placeholder="Same as owner or different"/></div>
        <div className="db-field"><label>{t.phone}</label><input value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))}/></div>
        <div style={{height:'1px',background:'var(--border)',margin:'.25rem 0'}}/>
        <div style={{fontSize:'.72rem',fontWeight:600,color:'var(--ink-3)',textTransform:'uppercase',letterSpacing:'.07em'}}>Social</div>
        <div className="db-field"><label>{t.instagram}</label><input value={form.instagram} onChange={e=>setForm(f=>({...f,instagram:e.target.value}))} placeholder="@yourstudio"/></div>
        <div className="db-field"><label>{t.tiktok}</label><input value={form.tiktok} onChange={e=>setForm(f=>({...f,tiktok:e.target.value}))} placeholder="@yourstudio"/></div>
        <button type="submit" className="db-btn db-btn-primary" style={{width:'100%',padding:'.75rem',justifyContent:'center'}} disabled={loading}>
          {loading?t.saving:saved?t.saved:t.saveChanges}
        </button>
      </form>
    </div>
  )
}

function SettingsLanguage({ language, setLanguage, ownerData, toast, refetch, t }) {
  const langs = [
    {key:'en', label:'🇬🇧 English', sub:'English'},
    {key:'fr', label:'🇫🇷 Français', sub:'French'},
    {key:'es', label:'🇪🇸 Español', sub:'Spanish'},
  ]

  async function pick(lang){
    setLanguage(lang)
    if(ownerData?.id){
      await supabase.from('users').update({language:lang}).eq('id',ownerData.id)
    }
    toast(T[lang].languageSaved)
  }

  return (
    <div className="db-card">
      <div className="db-card-head"><div className="db-card-title">{t.language}</div></div>
      <div style={{padding:'1.4rem',display:'flex',flexDirection:'column',gap:'.75rem'}}>
        {langs.map(l=>(
          <button key={l.key}
            onClick={()=>pick(l.key)}
            className={`lang-option ${language===l.key?'lang-active':''}`}
          >
            <span style={{fontSize:'1.1rem'}}>{l.label}</span>
            {language===l.key && <span className="lang-check">✓</span>}
          </button>
        ))}
        <div style={{fontSize:'.75rem',color:'var(--ink-3)',marginTop:'.5rem',padding:'.65rem .85rem',background:'var(--bg)',borderRadius:'8px'}}>
          ⓘ <span translate="no" className="notranslate">Organized.</span> stays <span translate="no" className="notranslate">Organized.</span> in every language.
        </div>
      </div>
    </div>
  )
}

// ─── CSS ─────────────────────────────────────────────────────────────────────
const css = `
.notranslate{display:inline;}
.db-shell{min-height:100vh;display:flex;flex-direction:column;}
.db-topbar{height:56px;background:#fff;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;padding:0 1.5rem;position:sticky;top:0;z-index:50;gap:.75rem;}
.db-logo{font-family:'Playfair Display',serif;font-size:1.25rem;font-weight:600;color:var(--ink);}
.db-logo-dot{color:var(--gold);}
.db-topbar-right{display:flex;align-items:center;gap:.75rem;}
.db-avatar{width:34px;height:34px;border-radius:50%;background:var(--gold-lt);border:1px solid var(--gold);display:flex;align-items:center;justify-content:center;font-size:.72rem;font-weight:600;color:var(--gold);cursor:pointer;}
.hamburger{background:none;border:none;cursor:pointer;display:flex;flex-direction:column;justify-content:center;gap:5px;width:34px;height:34px;padding:4px;border-radius:7px;transition:background .15s;}
.hamburger:hover{background:var(--border);}
.hamburger span{display:block;height:2px;width:20px;background:var(--ink);border-radius:2px;transition:all .25s ease;transform-origin:center;}
.hamburger.open span:nth-child(1){transform:translateY(6.5px) rotate(45deg);}
.hamburger.open span:nth-child(2){opacity:0;transform:scaleX(0);}
.hamburger.open span:nth-child(3){transform:translateY(-6.5px) rotate(-45deg);}
.db-body{display:flex;flex:1;position:relative;overflow:hidden;min-height:calc(100vh - 56px);}
.db-backdrop{position:fixed;inset:0;top:56px;background:rgba(0,0,0,.25);z-index:39;}
.db-sidebar{width:230px;background:#fff;border-right:1px solid var(--border);display:flex;flex-direction:column;padding:1.25rem 0;position:fixed;top:56px;left:0;bottom:0;z-index:40;transform:translateX(-100%);transition:transform .28s cubic-bezier(.4,0,.2,1);box-shadow:4px 0 24px rgba(0,0,0,.08);}
.db-sidebar.open{transform:translateX(0);}
.db-sidebar-label{font-size:.68rem;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-3);padding:.75rem 1.25rem .35rem;}
.db-nav-item{display:flex;align-items:center;padding:.55rem 1.25rem;cursor:pointer;color:var(--ink-3);font-size:.84rem;transition:all .15s;border-left:2px solid transparent;}
.db-nav-item:hover{color:var(--ink);background:var(--bg);}
.db-nav-item.active{color:var(--ink);background:var(--bg);border-left-color:var(--gold);font-weight:500;}
.db-sidebar-footer{margin-top:auto;padding:1rem 1.25rem;border-top:1px solid var(--border);}
.db-plan-label{font-size:.8rem;font-weight:600;color:var(--ink);}
.db-plan-sub{font-size:.72rem;color:var(--ink-3);margin-top:.1rem;}
.db-slug-link{display:block;color:var(--ink-3);text-decoration:none;transition:color .15s;}
.db-slug-link:hover{color:var(--gold);text-decoration:underline;cursor:pointer;}
.db-plan-bar{height:4px;background:var(--border);border-radius:2px;margin-top:.5rem;}
.db-plan-fill{height:100%;width:62%;background:var(--gold);border-radius:2px;}
.db-main{flex:1;padding:2rem 2.25rem;overflow-y:auto;background:var(--bg);}
.db-page-head{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:1.75rem;}
.db-page-title{font-family:'Playfair Display',serif;font-size:1.75rem;font-weight:500;color:var(--ink);}
.db-page-sub{font-size:.82rem;color:var(--ink-3);margin-top:.25rem;}
.db-btn{display:inline-flex;align-items:center;gap:.4rem;padding:.5rem 1.1rem;border-radius:8px;font-size:.82rem;font-weight:500;cursor:pointer;border:none;font-family:inherit;transition:all .15s;}
.db-btn-primary{background:var(--ink);color:#fff;}
.db-btn-primary:hover{background:#2a2a2a;}
.db-btn-secondary{background:#fff;color:var(--ink);border:1px solid var(--border-2);}
.db-btn-secondary:hover{border-color:var(--ink-3);}
.db-btn-xs{padding:.25rem .65rem;font-size:.72rem;}
.db-stats-row{display:grid;grid-template-columns:repeat(4,1fr);gap:1rem;margin-bottom:1.5rem;}
.db-stat-card{background:#fff;border:1px solid var(--border);border-radius:10px;padding:1.25rem 1.4rem;}
.db-stat-card-btn{width:100%;text-align:left;cursor:pointer;font-family:inherit;position:relative;transition:transform .18s cubic-bezier(.34,1.56,.64,1),box-shadow .18s ease,border-color .18s ease;}
.db-stat-card-btn:hover{transform:translateY(-2px) scale(1.02);box-shadow:0 8px 24px rgba(0,0,0,.09);border-color:var(--gold);}
.db-stat-card-btn:active{transform:scale(0.97);box-shadow:none;}
.db-stat-arrow{position:absolute;bottom:1rem;right:1.2rem;font-size:.85rem;color:var(--gold);opacity:0;transform:translateX(-4px);transition:opacity .18s ease,transform .18s ease;}
.db-stat-card-btn:hover .db-stat-arrow{opacity:1;transform:translateX(0);}
.db-stat-label{font-size:.72rem;font-weight:500;color:var(--ink-3);letter-spacing:.05em;text-transform:uppercase;margin-bottom:.5rem;}
.db-stat-value{font-family:'Playfair Display',serif;font-size:1.85rem;font-weight:500;color:var(--ink);line-height:1;}
.db-stat-delta{font-size:.73rem;color:var(--ink-3);margin-top:.4rem;}
.db-card{background:#fff;border:1px solid var(--border);border-radius:10px;overflow:hidden;margin-bottom:1.25rem;}
.db-card-head{display:flex;align-items:center;justify-content:space-between;padding:1rem 1.4rem;border-bottom:1px solid var(--border);}
.db-card-title{font-size:.88rem;font-weight:600;}
.db-tbl{width:100%;border-collapse:collapse;}
.db-tbl th{padding:.65rem 1.25rem;font-size:.7rem;font-weight:600;color:var(--ink-3);text-transform:uppercase;letter-spacing:.07em;text-align:left;background:#faf9f7;border-bottom:1px solid var(--border);}
.db-tbl td{padding:.85rem 1.25rem;font-size:.83rem;color:var(--ink-2);border-bottom:1px solid var(--border);vertical-align:middle;}
.db-tbl tr:last-child td{border-bottom:none;}
.db-tbl tbody tr:hover td{background:#faf9f7;}
.db-tbl-name{font-weight:500;color:var(--ink)!important;}
.db-tbl-amount{font-weight:600;color:var(--ink)!important;}
.db-badge{display:inline-flex;align-items:center;gap:.3rem;padding:2px 9px;border-radius:20px;font-size:.7rem;font-weight:500;}
.db-badge-confirmed{background:#ecfdf5;color:#2e7d52;}
.db-badge-pending{background:#fefce8;color:#854d0e;}
.db-badge-cancelled{background:#fef2f2;color:#c0392b;}
.db-badge-completed{background:#eff6ff;color:#1d4ed8;}
.db-badge-no_show{background:#f5f3ee;color:#7a7772;}
.db-badge-vip{background:#fdf4e7;color:#b5893a;}
.db-badge-new{background:#eff6ff;color:#1d4ed8;}
.db-grid-3{display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;}
.db-prod-card{background:#fff;border:1px solid var(--border);border-radius:10px;overflow:hidden;}
.db-prod-img{height:120px;background:#f5f3ee;display:flex;align-items:center;justify-content:center;font-size:.72rem;color:var(--ink-3);letter-spacing:.06em;text-transform:uppercase;border-bottom:1px solid var(--border);}
.db-prod-body{padding:1rem;}
.db-prod-name{font-weight:600;font-size:.85rem;margin-bottom:.2rem;}
.db-prod-price{font-family:'Playfair Display',serif;font-size:1.1rem;margin-bottom:.5rem;}
.db-field{display:flex;flex-direction:column;}
.db-field label{font-size:.75rem;font-weight:500;color:var(--ink-3);margin-bottom:.4rem;letter-spacing:.03em;}
.db-field input,.db-field textarea{padding:.7rem 1rem;border:1px solid var(--border);border-radius:8px;font-size:.88rem;font-family:inherit;color:var(--ink);background:#fff;outline:none;transition:border .15s;}
.db-field input:focus,.db-field textarea:focus{border-color:var(--gold);box-shadow:0 0 0 3px rgba(181,137,58,.1);}
.db-toast{position:fixed;bottom:1.75rem;right:1.75rem;background:var(--ink);color:#fff;padding:.85rem 1.4rem;border-radius:9px;font-size:.82rem;z-index:200;box-shadow:0 8px 24px rgba(0,0,0,.2);border-left:3px solid var(--gold);}
.nxt-card{background:#fff;border:1px solid var(--border);border-radius:12px;padding:1.25rem 1.4rem;margin-bottom:1.25rem;position:relative;overflow:hidden;}
.nxt-card::before{content:'';position:absolute;left:0;top:0;bottom:0;width:3px;background:var(--gold);}
.nxt-urgent::before{background:#e67e22;}
.nxt-urgent{border-color:#fde8cc;}
.nxt-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:.6rem;}
.nxt-badge{display:inline-block;background:var(--bg);border:1px solid var(--border);border-radius:20px;padding:2px 10px;font-size:.7rem;font-weight:600;color:var(--ink);}
.nxt-urgent .nxt-badge{background:#fef3e2;border-color:#f6c077;color:#b45309;}
.nxt-dot{width:8px;height:8px;border-radius:50%;background:#22c55e;box-shadow:0 0 0 3px #dcfce7;}
.nxt-name{font-family:'Playfair Display',serif;font-size:1.15rem;font-weight:500;color:var(--ink);}
.nxt-time{font-size:.78rem;color:var(--ink-3);margin-top:.2rem;margin-bottom:.9rem;text-transform:capitalize;}
.nxt-actions{display:flex;align-items:center;gap:.6rem;flex-wrap:wrap;}
.nxt-btn{display:inline-flex;align-items:center;gap:.35rem;padding:.38rem .85rem;border-radius:8px;font-size:.75rem;font-weight:500;text-decoration:none;transition:all .15s;cursor:pointer;}
.nxt-btn-email{background:#eff6ff;color:#1d4ed8;border:1px solid #bfdbfe;}
.nxt-btn-email:hover{background:#dbeafe;}
.nxt-btn-sms{background:#f0fdf4;color:#15803d;border:1px solid #bbf7d0;}
.nxt-btn-sms:hover{background:#dcfce7;}
.nxt-reschedule{font-size:.75rem;color:var(--ink-3);cursor:pointer;padding:.38rem .5rem;transition:color .15s;}
.nxt-reschedule:hover{color:var(--ink);}
.rev-overlay{position:fixed;inset:0;background:rgba(0,0,0,.35);z-index:200;display:flex;align-items:flex-end;animation:revFadeIn .2s ease;}
.rev-panel{background:#fff;width:100%;max-width:480px;margin:0 auto;border-radius:18px 18px 0 0;padding:1.75rem 1.5rem 2.5rem;animation:revSlideUp .3s cubic-bezier(.34,1.2,.64,1);max-height:88vh;overflow-y:auto;}
@keyframes revSlideUp{from{transform:translateY(100%);}to{transform:translateY(0);}}
@keyframes revFadeIn{from{opacity:0;}to{opacity:1;}}
.rev-panel-head{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:1.5rem;}
.rev-panel-title{font-family:'Playfair Display',serif;font-size:1.5rem;font-weight:500;}
.rev-panel-sub{font-size:.78rem;color:var(--ink-3);margin-top:.2rem;text-transform:capitalize;}
.rev-close{background:var(--bg);border:none;width:32px;height:32px;border-radius:50%;font-size:.9rem;cursor:pointer;color:var(--ink-3);display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.rev-chart-wrap{position:relative;margin-bottom:1.5rem;}
.rev-axis{position:relative;height:18px;font-size:.68rem;color:var(--ink-3);margin-top:.3rem;}
.rev-pills{display:flex;flex-direction:column;gap:.65rem;margin-bottom:1.25rem;}
.rev-pill{display:flex;align-items:center;gap:.85rem;background:var(--bg);border-radius:10px;padding:.75rem 1rem;}
.rev-pill-icon{width:28px;height:28px;border-radius:50%;background:#ecfdf5;color:#2e7d52;display:flex;align-items:center;justify-content:center;font-size:.85rem;font-weight:700;flex-shrink:0;}
.rev-pill-avg{background:#fdf4e7;color:#b5893a;}
.rev-pill-low{background:#fef2f2;color:#c0392b;}
.rev-pill-label{font-size:.72rem;color:var(--ink-3);}
.rev-pill-val{font-size:.9rem;font-weight:600;color:var(--ink);margin-top:.1rem;}
.rev-narrative{font-size:.82rem;color:var(--ink-3);line-height:1.65;padding:.9rem 1rem;background:var(--bg);border-radius:10px;border-left:3px solid var(--gold);}
.cal-wrap{user-select:none;}
.cal-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:.85rem;}
.cal-month{font-weight:600;font-size:.88rem;text-transform:capitalize;}
.cal-nav{background:none;border:none;cursor:pointer;font-size:1.1rem;color:var(--ink-3);padding:.2rem .5rem;border-radius:6px;transition:background .15s;}
.cal-nav:hover{background:var(--bg);}
.cal-grid-header{display:grid;grid-template-columns:repeat(7,1fr);margin-bottom:.4rem;}
.cal-dow{text-align:center;font-size:.65rem;font-weight:600;color:var(--ink-3);text-transform:uppercase;padding:.2rem 0;}
.cal-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:3px;}
.cal-cell{position:relative;aspect-ratio:1;display:flex;align-items:center;justify-content:center;border-radius:8px;font-size:.8rem;cursor:pointer;background:none;border:none;font-family:inherit;color:var(--ink-2);transition:background .12s;}
.cal-empty{cursor:default;pointer-events:none;}
.cal-day:hover{background:var(--bg);}
.cal-today{background:var(--gold-lt)!important;color:var(--gold);font-weight:700;}
.cal-blocked{background:#fef2f2!important;color:#c0392b;}
.cal-has-appt{font-weight:600;color:var(--ink);}
.cal-dot{position:absolute;bottom:3px;left:50%;transform:translateX(-50%);width:4px;height:4px;border-radius:50%;}
.cal-dot-appt{background:var(--gold);}
.cal-dot-blocked{background:#c0392b;}
.avail-time-input{padding:.45rem .6rem;border:1px solid var(--border);border-radius:8px;font-size:.82rem;font-family:inherit;color:var(--ink);background:#fff;outline:none;transition:border .15s;}
.avail-time-input:focus{border-color:var(--gold);}
.settings-tabs{display:flex;gap:.5rem;margin-bottom:1.5rem;border-bottom:1px solid var(--border);padding-bottom:0;}
.settings-tab{background:none;border:none;padding:.6rem 1rem;font-size:.84rem;font-family:inherit;cursor:pointer;color:var(--ink-3);border-bottom:2px solid transparent;margin-bottom:-1px;transition:all .15s;}
.settings-tab:hover{color:var(--ink);}
.settings-tab.active{color:var(--ink);border-bottom-color:var(--gold);font-weight:500;}
.lang-option{display:flex;align-items:center;justify-content:space-between;padding:1rem 1.25rem;border-radius:10px;border:1.5px solid var(--border);background:#fff;cursor:pointer;font-family:inherit;font-size:.88rem;transition:all .15s;}
.lang-option:hover{border-color:var(--gold);background:var(--bg);}
.lang-option.lang-active{border-color:var(--gold);background:var(--gold-lt);}
.lang-check{color:var(--gold);font-weight:700;font-size:1rem;}
@media(max-width:600px){
  .db-stats-row{grid-template-columns:repeat(2,1fr);}
  .db-grid-3{grid-template-columns:repeat(2,1fr);}
  .db-main{padding:1.25rem;}
  .db-page-head{flex-direction:column;align-items:flex-start;}
  .db-tbl th,.db-tbl td{padding:.6rem .75rem;font-size:.75rem;}
  .settings-tabs{gap:.25rem;}
  .settings-tab{padding:.5rem .7rem;font-size:.78rem;}
}
`
