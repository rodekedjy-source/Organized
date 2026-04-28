import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

// ─── Slot generator ───────────────────────────────────────────────────────────
// Pure function — no side effects, fully testable
function generateSlots(openTime, closeTime, durationMin, existingAppts) {
  const toMin = (t) => {
    const [h, m] = t.split(':').map(Number)
    return h * 60 + m
  }
  const toLabel = (min) => {
    const h = Math.floor(min / 60)
    const m = min % 60
    const ampm = h >= 12 ? 'PM' : 'AM'
    const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h
    return `${h12}:${String(m).padStart(2, '0')} ${ampm}`
  }

  const openMin  = toMin(openTime)
  const closeMin = toMin(closeTime)
  const slots    = []

  for (let cur = openMin; cur + durationMin <= closeMin; cur += 30) {
    const slotEnd = cur + durationMin

    const isBooked = existingAppts.some((appt) => {
      const d = new Date(appt.scheduled_at)
      const apptStart = d.getHours() * 60 + d.getMinutes()
      const apptEnd   = apptStart + (appt.duration_min || 60)
      return cur < apptEnd && slotEnd > apptStart
    })

    slots.push({ label: toLabel(cur), minutes: cur, available: !isBooked })
  }

  return slots
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useClientData(slug) {
  const [workspace,  setWorkspace]  = useState(null)
  const [services,   setServices]   = useState([])
  const [availability, setAvailability] = useState([])
  const [blockedDates, setBlockedDates] = useState([])   // ['YYYY-MM-DD', ...]
  const [products,   setProducts]   = useState([])
  const [offerings,  setOfferings]  = useState([])
  const [reviews,    setReviews]    = useState([])
  const [portfolio,  setPortfolio]  = useState([])
  const [loading,    setLoading]    = useState(true)
  const [notFound,   setNotFound]   = useState(false)
  const [error,      setError]      = useState(null)

  useEffect(() => {
    if (!slug) return
    let cancelled = false

    async function fetchAll() {
      setLoading(true)
      setNotFound(false)
      setError(null)

      try {
        // ── 1. Workspace (single query, anon RLS allows published only) ──────
        const { data: ws, error: wsErr } = await supabase
          .from('workspaces')
          .select(`
            id, name, slug, tagline, bio, avatar_url, cover_url,
            instagram, tiktok, phone, email, website, location,
            timezone, currency, is_published, theme,
            offers_domicile, domicile_fee, domicile_radius_km, domicile_notes,
            address_visibility, neighborhood,
            address_street, address_city, address_province,
            address_postal, address_country, share_address,
            faq_settings, featured_product_id, featured_product_note,
            working_hours
          `)
          .eq('slug', slug)
          .eq('is_published', true)
          .maybeSingle()

        if (wsErr || !ws) {
          if (!cancelled) { setNotFound(true); setLoading(false) }
          return
        }
        if (!cancelled) setWorkspace(ws)

        // ── 2. Parallel fetches (all filtered by workspace_id) ──────────────
        const today = new Date().toISOString().split('T')[0]

        const [
          { data: svcData },
          { data: availData },
          { data: blockedData },
          { data: prodData },
          { data: offerData },
          { data: reviewData },
          { data: portfolioData },
        ] = await Promise.all([
          // Services — ordered by display_order
          supabase
            .from('services')
            .select('id, name, description, duration_min, price, is_free, display_order, addons, deposit_amount, category')
            .eq('workspace_id', ws.id)
            .eq('is_active', true)
            .is('deleted_at', null)
            .order('display_order', { ascending: true }),

          // Availability — 7 rows, one per day
          supabase
            .from('availability')
            .select('day_of_week, is_open, open_time, close_time')
            .eq('workspace_id', ws.id)
            .order('day_of_week', { ascending: true }),

          // Blocked dates — future only
          supabase
            .from('blocked_dates')
            .select('blocked_date')
            .eq('workspace_id', ws.id)
            .gte('blocked_date', today),

          // Products — active, not deleted
          supabase
            .from('products')
            .select('id, name, description, price, currency, stock, image_url, images')
            .eq('workspace_id', ws.id)
            .eq('is_active', true)
            .is('deleted_at', null)
            .order('created_at', { ascending: false }),

          // Offerings (formations)
          supabase
            .from('offerings')
            .select('id, title, description, price, currency, duration_label, format, max_students, is_active')
            .eq('workspace_id', ws.id)
            .eq('is_active', true)
            .is('deleted_at', null)
            .order('created_at', { ascending: false }),

          // Reviews — approved + visible only
          supabase
            .from('reviews')
            .select('reviewer_name, rating, body, service_label, service_name, created_at')
            .eq('workspace_id', ws.id)
            .eq('is_visible', true)
            .eq('is_approved', true)
            .order('created_at', { ascending: false })
            .limit(12),

          // Portfolio photos
          supabase
            .from('portfolio_photos')
            .select('id, url, caption, display_order')
            .eq('workspace_id', ws.id)
            .order('display_order', { ascending: true }),
        ])

        if (!cancelled) {
          setServices(svcData   || [])
          setAvailability(availData || [])
          setBlockedDates((blockedData || []).map((b) => b.blocked_date))
          setProducts(prodData  || [])
          setOfferings(offerData || [])
          setReviews(reviewData || [])
          setPortfolio(portfolioData || [])
        }
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchAll()
    return () => { cancelled = true }
  }, [slug])

  // ── fetchDaySlots ──────────────────────────────────────────────────────────
  // Called when client picks a day — fetches real appointments then generates slots
  const fetchDaySlots = useCallback(
    async (dateStr, durationMin) => {
      if (!workspace) return []

      // Day of week check
      // Use noon to avoid DST edge cases
      const dow = new Date(dateStr + 'T12:00:00').getDay()
      const avail = availability.find((a) => a.day_of_week === dow)
      if (!avail || !avail.is_open) return []

      // Blocked date check
      if (blockedDates.includes(dateStr)) return []

      // Fetch existing appointments for that calendar date
      const { data: existing } = await supabase
        .from('appointments')
        .select('scheduled_at, duration_min, ends_at')
        .eq('workspace_id', workspace.id)
        .gte('scheduled_at', `${dateStr}T00:00:00+00:00`)
        .lte('scheduled_at', `${dateStr}T23:59:59+00:00`)
        .not('status', 'in', '("cancelled")')
        .is('deleted_at', null)

      return generateSlots(avail.open_time, avail.close_time, durationMin, existing || [])
    },
    [workspace, availability, blockedDates]
  )

  // ── isDateAvailable ────────────────────────────────────────────────────────
  // Used by the calendar to mark dots on available days
  const isDateAvailable = useCallback(
    (year, month, day) => {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      if (blockedDates.includes(dateStr)) return false
      const dow = new Date(dateStr + 'T12:00:00').getDay()
      const avail = availability.find((a) => a.day_of_week === dow)
      return !!(avail && avail.is_open)
    },
    [availability, blockedDates]
  )

  return {
    workspace,
    services,
    availability,
    blockedDates,
    products,
    offerings,
    reviews,
    portfolio,
    loading,
    notFound,
    error,
    fetchDaySlots,
    isDateAvailable,
  }
}
