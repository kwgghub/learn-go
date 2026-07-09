import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  rotation: number
  rotationSpeed: number
  size: number
  color: string
  shape: 'rect' | 'circle' | 'triangle'
  alpha: number
  life: number
}

const COLORS = [
  '#00d4ff', '#0ea5e9', '#22d3ee', '#f59e0b',
  '#fbbf24', '#ef4444', '#ec4899', '#a78bfa',
  '#34d399', '#f97316',
]

const SHAPES: Particle['shape'][] = ['rect', 'circle', 'triangle']

interface ConfettiProps {
  fire: number
}

export function Confetti({ fire }: ConfettiProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  const particlesRef = useRef<Particle[]>([])

  useEffect(() => {
    if (!fire) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    // 生成粒子
    const count = 120
    const newParticles: Particle[] = []
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI - Math.PI / 2
      const speed = 8 + Math.random() * 14
      newParticles.push({
        x: canvas.width / 2 + (Math.random() - 0.5) * 200,
        y: canvas.height / 2 + (Math.random() - 0.5) * 100,
        vx: Math.cos(angle) * speed * (Math.random() > 0.5 ? 1 : -1) + (Math.random() - 0.5) * 6,
        vy: Math.sin(angle) * speed - Math.random() * 8 - 4,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.3,
        size: 6 + Math.random() * 8,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
        alpha: 1,
        life: 0,
      })
    }
    particlesRef.current = newParticles

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const particles = particlesRef.current
      let alive = false

      for (const p of particles) {
        p.life++
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.35
        p.vx *= 0.99
        p.rotation += p.rotationSpeed

        if (p.life > 60) {
          p.alpha -= 0.015
        }

        if (p.alpha > 0 && p.y < canvas.height + 50) {
          alive = true
          ctx.save()
          ctx.globalAlpha = Math.max(0, p.alpha)
          ctx.translate(p.x, p.y)
          ctx.rotate(p.rotation)
          ctx.fillStyle = p.color

          if (p.shape === 'rect') {
            ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2)
          } else if (p.shape === 'circle') {
            ctx.beginPath()
            ctx.arc(0, 0, p.size / 2.5, 0, Math.PI * 2)
            ctx.fill()
          } else {
            ctx.beginPath()
            ctx.moveTo(0, -p.size / 2)
            ctx.lineTo(p.size / 2, p.size / 3)
            ctx.lineTo(-p.size / 2, p.size / 3)
            ctx.closePath()
            ctx.fill()
          }

          ctx.restore()
        }
      }

      if (alive) {
        animationRef.current = requestAnimationFrame(animate)
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationRef.current)
    }
  }, [fire])

  if (fire <= 0) return null

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    />
  )
}
