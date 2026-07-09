import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  color: string
  alpha: number
  baseAlpha: number
  driftAngle: number
  driftSpeed: number
  pulsePhase: number
  pulseSpeed: number
}

const Particles = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const mouseRef = useRef({ x: 0, y: 0, active: false })
  const animationRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    const colors = ['#00add8', '#5fd4f4', '#a78bfa', '#38bdf8']

    const particleCount = Math.min(
      90,
      Math.floor((window.innerWidth * window.innerHeight) / 18000)
    )

    const createParticle = (): Particle => {
      const color = colors[Math.floor(Math.random() * colors.length)]
      const baseAlpha = Math.random() * 0.4 + 0.2
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 1.2,
        vy: (Math.random() - 0.5) * 1.2 - 0.3,
        radius: Math.random() * 2 + 1,
        color,
        alpha: baseAlpha,
        baseAlpha,
        driftAngle: Math.random() * Math.PI * 2,
        driftSpeed: Math.random() * 0.015 + 0.005,
        pulsePhase: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.02 + 0.008,
      }
    }

    particlesRef.current = Array.from({ length: particleCount }, createParticle)

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX
      mouseRef.current.y = e.clientY
      mouseRef.current.active = true
    }

    const handleMouseLeave = () => {
      mouseRef.current.active = false
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseleave', handleMouseLeave)

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const particles = particlesRef.current
      const mouse = mouseRef.current

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]

        p.driftAngle += p.driftSpeed
        const driftX = Math.cos(p.driftAngle) * 0.3
        const driftY = Math.sin(p.driftAngle * 0.7) * 0.2

        if (mouse.active) {
          const dx = mouse.x - p.x
          const dy = mouse.y - p.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          const maxDist = 200

          if (dist < maxDist && dist > 0) {
            const force = (maxDist - dist) / maxDist
            const angle = Math.atan2(dy, dx)
            p.vx += Math.cos(angle) * force * 0.15
            p.vy += Math.sin(angle) * force * 0.15
          }
        }

        p.vx += driftX * 0.02
        p.vy += driftY * 0.02

        p.vx *= 0.995
        p.vy *= 0.995

        const maxSpeed = 2.5
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy)
        if (speed > maxSpeed) {
          p.vx = (p.vx / speed) * maxSpeed
          p.vy = (p.vy / speed) * maxSpeed
        }

        p.x += p.vx
        p.y += p.vy

        p.pulsePhase += p.pulseSpeed
        p.alpha = p.baseAlpha + Math.sin(p.pulsePhase) * p.baseAlpha * 0.4

        if (p.x < -20) p.x = canvas.width + 20
        if (p.x > canvas.width + 20) p.x = -20
        if (p.y < -20) p.y = canvas.height + 20
        if (p.y > canvas.height + 20) p.y = -20

        const glowRadius = p.radius * 5 + Math.sin(p.pulsePhase * 1.5) * p.radius
        const glow = ctx.createRadialGradient(
          p.x,
          p.y,
          0,
          p.x,
          p.y,
          glowRadius
        )
        glow.addColorStop(0, p.color + Math.floor(p.alpha * 255).toString(16).padStart(2, '0'))
        glow.addColorStop(1, p.color + '00')

        ctx.beginPath()
        ctx.arc(p.x, p.y, glowRadius, 0, Math.PI * 2)
        ctx.fillStyle = glow
        ctx.fill()

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = p.color + Math.floor(p.alpha * 255).toString(16).padStart(2, '0')
        ctx.fill()
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const p1 = particles[i]
          const p2 = particles[j]
          const dx = p1.x - p2.x
          const dy = p1.y - p2.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < 120) {
            const alpha = (1 - dist / 120) * 0.15
            ctx.beginPath()
            ctx.moveTo(p1.x, p1.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.strokeStyle = `rgba(0, 173, 216, ${alpha})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }

      if (mouse.active) {
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i]
          const dx = mouse.x - p.x
          const dy = mouse.y - p.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < 180) {
            const alpha = (1 - dist / 180) * 0.35
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(mouse.x, mouse.y)
            const gradient = ctx.createLinearGradient(p.x, p.y, mouse.x, mouse.y)
            gradient.addColorStop(0, `rgba(0, 173, 216, ${alpha * 0.5})`)
            gradient.addColorStop(1, `rgba(167, 139, 250, ${alpha})`)
            ctx.strokeStyle = gradient
            ctx.lineWidth = 1
            ctx.stroke()
          }
        }

        const mouseGlow = ctx.createRadialGradient(
          mouse.x,
          mouse.y,
          0,
          mouse.x,
          mouse.y,
          120
        )
        mouseGlow.addColorStop(0, 'rgba(0, 173, 216, 0.08)')
        mouseGlow.addColorStop(0.5, 'rgba(167, 139, 250, 0.04)')
        mouseGlow.addColorStop(1, 'rgba(0, 173, 216, 0)')
        ctx.beginPath()
        ctx.arc(mouse.x, mouse.y, 120, 0, Math.PI * 2)
        ctx.fillStyle = mouseGlow
        ctx.fill()
      }

      animationRef.current = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseleave', handleMouseLeave)
      cancelAnimationFrame(animationRef.current)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  )
}

export default Particles
