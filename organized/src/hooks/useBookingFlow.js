import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const EMPTY_FORM = { fname: '', lname: '', email: '', phone: '', source: '', notes: '' }
const EMPTY_DOM  = { street: '', city: '', postal: '', access: '' }

export function useBookingFlow() {
  // ── Overlay open/page ────────────────────────────────────────────────────
  const [open, setOpen]   = useState(false)
  const [page, setPage]   = useState(1)   // 1=visitType 2=dateTime 3=yourInfo 4=success

  // ── Step 1: service + addons + visit type ────────────────────────────────
  const [service,       setService]       = useState(null)
  const [addons,        setAddons]        = useState([])
  const [visitType,     setVisitType]     = useState('studio')
  const [policyChecked, setPolicyChecked] = useState(false)
  const [domicileForm,  setDomicileForm]  = useState(EMPTY_DOM)

  // ── Step 2: calendar + slot ──────────────────────────────────────────────
  const [calYear,      setCalYear]      = useState(() => new Date().getFullYear())
  const [calMonth,     setCalMonth]     = useState(() => new Date().getMonth())
  const [selectedDay,  setSelectedDay]  = useState(null)
  const [selectedTime, setSelectedTime] = useState(null)
  const [slots,        setSlots]        = useState([])
  const [slotsLoading, setSlotsLoading] = useState(false)

  // ── Step 3: client info form ─────────────────────────────────────────────
  const [form,   setForm]   = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})

  // ── Result ───────────────────────────────────────────────────────────────
  const [submitting,  setSubmitting]  = useState(false)
  const [booked,      setBooked]      = useState(false)
  const [appointment, setAppointment] = useState(null)
  const [submitError, setSubmitError] = useState(null)

  // ── Open / close ─────────────────────────────────────────────────────────
  const openBooking = useCallback((svc) => {
    setService(svc)
    setAddons([])
    setVisitType('studio')
    setPolicyChecked(false)
    setDomicileForm(EMPTY_DOM)
    setSelectedDay(null)
    setSelectedTime(null)
    setSlots([])
    setCalYear(new Date().getFullYear())
    setCalMonth(new Date().getMonth())
    setForm(EMPTY_FORM)
    setErrors({})
    setBooked(false)
    setAppointment(null)
    setSubmitError(null)
    setPage(1)
    setOpen(true)
    document.body.style.overflow = 'hidden'
  }, [])

  const closeBooking = useCallback(() => {
    setOpen(false)
    document.body.style.overflow = ''
  }, [])

  // ── Page navigation ──────────────────────────────────────────────────────
  const goToPage = useCallback((n) => {
    // Validate page 1 → 2: home visit requires address + policy checkbox
    if (n === 2 && visitType === 'home') {
      const errs = {}
      if (!domicileForm.street.trim()) errs.street = 'Required'
      if (!policyChecked)              errs.policy  = 'Required'
      if (Object.keys(errs).length) {
        setErrors((prev) => ({ ...prev, ...errs }))
        return
      }
    }

    // Validate page 2 → 3: must have day + time
    if (n === 3 && (!selectedDay || !selectedTime)) return

    setErrors({})
    setPage(n)
  }, [visitType, domicileForm, policyChecked, selectedDay, selectedTime])

  // ── Add-on toggle ────────────────────────────────────────────────────────
  const toggleAddon = useCallback((addon) => {
    setAddons((prev) =>
      prev.includes(addon) ? prev.filter((a) => a !== addon) : [...prev, addon]
    )
  }, [])

  // ── Load slots for a selected day ────────────────────────────────────────
  // fetchDaySlots comes from useClientData
  const loadSlots = useCallback(async (day, fetchDaySlots) => {
    if (!service || !day) return
    const dateStr = [
      calYear,
      String(calMonth + 1).padStart(2, '0'),
      String(day).padStart(2, '0'),
    ].join('-')

    setSlotsLoading(true)
    try {
      const result = await fetchDaySlots(dateStr, service.duration_min)
      setSlots(result || [])
    } finally {
      setSlotsLoading(false)
    }
  }, [service, calYear, calMonth])

  // ── Change month ─────────────────────────────────────────────────────────
  const prevMonth = useCallback(() => {
    setCalMonth((m) => {
      if (m === 0) { setCalYear((y) => y - 1); return 11 }
      return m - 1
    })
    setSelectedDay(null)
    setSelectedTime(null)
    setSlots([])
  }, [])

  const nextMonth = useCallback(() => {
    setCalMonth((m) => {
      if (m === 11) { setCalYear((y) => y + 1); return 0 }
      return m + 1
    })
    setSelectedDay(null)
    setSelectedTime(null)
    setSlots([])
  }, [])

  // ── Form validation ──────────────────────────────────────────────────────
  const validate = useCallback(() => {
    const errs = {}
    if (!form.fname.trim())                              errs.fname = true
    if (!form.lname.trim())                              errs.lname = true
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = true
    if (form.phone.replace(/\D/g, '').length < 7)       errs.phone = true
    setErrors(errs)
    return Object.keys(errs).length === 0
  }, [form])

  // ── Submit booking ───────────────────────────────────────────────────────
  const submitBooking = useCallback(async (workspace) => {
    if (!validate() || !service || !selectedDay || !selectedTime || !workspace) return

    setSubmitting(true)
    setSubmitError(null)

    try {
      // Build ISO datetime from local calendar selection
      const dateStr = [
        calYear,
        String(calMonth + 1).padStart(2, '0'),
        String(selectedDay).padStart(2, '0'),
      ].join('-')

      // Parse "9:00 AM" → hours/minutes
      const [timePart, ampm] = selectedTime.split(' ')
      let [h, m] = timePart.split(':').map(Number)
      if (ampm === 'PM' && h !== 12) h += 12
      if (ampm === 'AM' && h === 12) h = 0

      const scheduledAt = new Date(
        `${dateStr}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`
      )
      const endsAt = new Date(scheduledAt.getTime() + service.duration_min * 60 * 1000)

      const addonsJson = addons.map((name) => {
        // If addon string contains price "+$XX" parse it
        const match = name.match(/\+\$(\d+)/)
        return { name: name.replace(/\s*\+\$\d+/, ''), price: match ? Number(match[1]) : 0 }
      })

      const { data, error } = await supabase
        .from('appointments')
        .insert({
          workspace_id:         workspace.id,
          client_name:          `${form.fname.trim()} ${form.lname.trim()}`,
          client_email:         form.email.trim(),
          client_phone:         form.phone.trim() || null,
          service_id:           service.id,
          service_name:         service.name,
          scheduled_at:         scheduledAt.toISOString(),
          ends_at:              endsAt.toISOString(),
          duration_min:         service.duration_min,
          amount:               service.is_free ? 0 : Number(service.price),
          currency:             workspace.currency || 'CAD',
          status:               'pending',
          payment_status:       'unpaid',
          notes:                form.notes.trim() || null,
          how_found:            form.source || null,
          visit_type:           visitType,
          travel_fee:           visitType === 'home' ? Number(workspace.domicile_fee || 45) : 0,
          client_address:       visitType === 'home' ? domicileForm.street.trim() : null,
          client_address_notes: visitType === 'home' ? (domicileForm.access.trim() || null) : null,
          addons:               addonsJson,
        })
        .select('id, cancellation_token, scheduled_at, service_name, client_name, client_email')
        .single()

      if (error) throw error

      setAppointment(data)
      setBooked(true)
      setPage(4)
    } catch (err) {
      const msg = err.message || ''
      if (msg.includes('conflict') || msg.includes('double') || msg.includes('overlap')) {
        setSubmitError('This time slot was just taken. Please choose another.')
        setPage(2) // send back to calendar
        setSelectedTime(null)
      } else {
        setSubmitError('Something went wrong. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }, [validate, form, service, selectedDay, selectedTime, calYear, calMonth, visitType, domicileForm, addons])

  // ── Download ICS ─────────────────────────────────────────────────────────
  const downloadICS = useCallback(() => {
    if (!appointment || !service) return
    const pad = (n) => String(n).padStart(2, '0')
    const d = new Date(appointment.scheduled_at)
    const end = new Date(d.getTime() + (service.duration_min || 60) * 60000)
    const fmt = (dt) =>
      `${dt.getFullYear()}${pad(dt.getMonth() + 1)}${pad(dt.getDate())}T${pad(dt.getHours())}${pad(dt.getMinutes())}00`

    const ics = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Organized//BeOrganized.io//EN',
      'BEGIN:VEVENT',
      `UID:${appointment.id}@beorganized.io`,
      `DTSTAMP:${fmt(new Date())}`,
      `DTSTART:${fmt(d)}`,
      `DTEND:${fmt(end)}`,
      `SUMMARY:${service.name} appointment`,
      'END:VEVENT', 'END:VCALENDAR',
    ].join('\r\n')

    const a = document.createElement('a')
    a.href = 'data:text/calendar;charset=utf-8,' + encodeURIComponent(ics)
    a.download = 'appointment.ics'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }, [appointment, service])

  return {
    // State
    open, page, service, addons, visitType, policyChecked, domicileForm,
    calYear, calMonth, selectedDay, selectedTime, slots, slotsLoading,
    form, errors, submitting, booked, appointment, submitError,

    // Setters (for controlled inputs)
    setVisitType, setPolicyChecked, setDomicileForm,
    setSelectedDay, setSelectedTime, setSlots,
    setForm, setErrors,

    // Actions
    openBooking, closeBooking, goToPage, toggleAddon,
    loadSlots, prevMonth, nextMonth, submitBooking, downloadICS,
  }
}
