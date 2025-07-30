import { useEffect, useRef } from 'react'

interface SplashCursorProps {
  className?: string
  color?: string
  size?: number
  duration?: number
}

export function SplashCursor({ 
  className = '', 
  color = '#3b82f6', 
  size = 20, 
  duration = 600 
}: SplashCursorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Array<{
    x: number
    y: number
    vx: number
    vy: number
    life: number
    maxLife: number
    size: number
  }>>([])

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

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      // Create particles
      for (let i = 0; i < 6; i++) {
        particlesRef.current.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 4,
          vy: (Math.random() - 0.5) * 4,
          life: duration,
          maxLife: duration,
          size: Math.random() * size + 2
        })
      }
    }

    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      // Create splash effect on click
      for (let i = 0; i < 15; i++) {
        particlesRef.current.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 8,
          vy: (Math.random() - 0.5) * 8,
          life: duration * 1.5,
          maxLife: duration * 1.5,
          size: Math.random() * size + 4
        })
      }
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Update and draw particles
      particlesRef.current = particlesRef.current.filter(particle => {
        particle.x += particle.vx
        particle.y += particle.vy
        particle.life--
        
        // Apply gravity and friction
        particle.vy += 0.1
        particle.vx *= 0.99
        particle.vy *= 0.99

        if (particle.life <= 0) return false

        // Draw particle
        const alpha = particle.life / particle.maxLife
        const currentSize = particle.size * alpha

        ctx.save()
        ctx.globalAlpha = alpha * 0.7
        ctx.fillStyle = color
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, currentSize, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()

        return true
      })

      requestAnimationFrame(animate)
    }

    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('click', handleClick)
    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('click', handleClick)
    }
  }, [color, size, duration])

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none z-10 ${className}`}
      style={{ 
        mixBlendMode: 'multiply',
        opacity: 0.6
      }}
    />
  )
}