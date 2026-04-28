import { useEffect } from 'react'

const PARAMS = [
  // [xFreq,   yFreq,   xAmp,  yAmp,  xPhase, yPhase, sizePhase]
  [0.00031, 0.00019, 0.22, 0.18, 0.0,  1.2,  0.0],
  [0.00022, 0.00028, 0.18, 0.24, 2.1,  0.8,  1.8],
  [0.00017, 0.00023, 0.26, 0.20, 4.3,  3.1,  3.5],
  [0.00025, 0.00015, 0.20, 0.28, 1.7,  5.0,  5.2],
]

const BASE_POSITIONS = [
  { bx: 0.15, by: 0.20 },
  { bx: 0.75, by: 0.65 },
  { bx: 0.50, by: 0.45 },
  { bx: 0.30, by: 0.75 },
]

function getThemeBlobs(theme) {
  if (theme === 'light') {
    return {
      bg: '#B5A594',
      blobs: [
        { r: 218, g: 198, b: 172, a: 0.72, size: 0.62 },
        { r: 152, g: 122, b: 95,  a: 0.60, size: 0.48 },
        { r: 200, g: 180, b: 155, a: 0.58, size: 0.55 },
        { r: 105, g: 82,  b: 62,  a: 0.45, size: 0.36 },
      ],
    }
  }
  return {
    bg: '#080706',
    blobs: [
      { r: 235, g: 228, b: 218, a: 0.11, size: 0.55 },
      { r: 201, g: 168, b: 76,  a: 0.07, size: 0.42 },
      { r: 255, g: 245, b: 230, a: 0.06, size: 0.35 },
      { r: 180, g: 150, b: 80,  a: 0.05, size: 0.28 },
    ],
  }
}

export function useHeroCanvas(canvasRef, theme) {
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf
    let t = 0
    let dpr = window.devicePixelRatio || 1

    function resize() {
      const parent = canvas.parentElement
      if (!parent) return
      dpr = window.devicePixelRatio || 1
      const rect = parent.getBoundingClientRect()
      canvas.width  = Math.round(rect.width  * dpr)
      canvas.height = Math.round(rect.height * dpr)
      canvas.style.width  = rect.width  + 'px'
      canvas.style.height = rect.height + 'px'
    }

    function drawFrame() {
      const logW = canvas.width  / dpr
      const logH = canvas.height / dpr

      const { bg, blobs } = getThemeBlobs(theme)

      // Scale once at draw time (not on resize) to keep ctx clean
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      ctx.clearRect(0, 0, logW, logH)
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, logW, logH)

      blobs.forEach((blob, i) => {
        const p    = PARAMS[i]
        const base = BASE_POSITIONS[i]

        // Two-frequency sine wave per axis → organic, non-repeating path
        const xt = Math.sin(t * p[0] + p[4]) * p[2]
               + Math.sin(t * p[0] * 0.6 + p[4] + 1.3) * p[2] * 0.4

        const yt = Math.cos(t * p[1] + p[5]) * p[3]
               + Math.cos(t * p[1] * 0.7 + p[5] + 0.9) * p[3] * 0.35

        const size = blob.size * (1 + 0.08 * Math.sin(t * 0.00018 + p[6]))

        const cx     = (base.bx + xt) * logW
        const cy     = (base.by + yt) * logH
        const radius = size * Math.max(logW, logH)

        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius)
        const c = `${blob.r},${blob.g},${blob.b}`
        grad.addColorStop(0,    `rgba(${c},${blob.a})`)
        grad.addColorStop(0.4,  `rgba(${c},${blob.a * 0.55})`)
        grad.addColorStop(0.75, `rgba(${c},${blob.a * 0.15})`)
        grad.addColorStop(1,    `rgba(${c},0)`)

        ctx.save()
        // Slight vertical squish — more organic ellipse
        ctx.translate(cx, cy)
        ctx.scale(1, 0.75 + 0.12 * Math.sin(t * 0.00014 + i))
        ctx.translate(-cx, -cy)
        ctx.beginPath()
        ctx.arc(cx, cy, radius, 0, Math.PI * 2)
        ctx.fillStyle = grad
        ctx.fill()
        ctx.restore()
      })

      t += 16 // ~60 fps equivalent time step
      raf = requestAnimationFrame(drawFrame)
    }

    function start() {
      cancelAnimationFrame(raf)
      resize()
      drawFrame()
    }

    const onResize = () => { resize() }
    const onVisibility = () => {
      if (document.hidden) cancelAnimationFrame(raf)
      else start()
    }

    start()
    window.addEventListener('resize', onResize)
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [canvasRef, theme])
}
