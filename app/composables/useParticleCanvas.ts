import { onUnmounted, type Ref } from 'vue'

interface Particle {
  x: number
  y: number
  radius: number
  dx: number
  dy: number
}

export function useParticleCanvas(_canvasRef: Ref<HTMLCanvasElement | null>) {
  let animFrame: number
  let resizeHandler: () => void
  const particles: Particle[] = []

  function init(canvas: HTMLCanvasElement, isDark: () => boolean) {
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const COUNT = 50

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()

    particles.length = 0
    for (let i = 0; i < COUNT; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.5 + 0.5,
        dx: (Math.random() - 0.5) * 0.5,
        dy: (Math.random() - 0.5) * 0.5
      })
    }

    resizeHandler = resize
    window.addEventListener('resize', resizeHandler)

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = isDark() ? 'rgba(167, 139, 250, 0.4)' : 'rgba(100, 116, 139, 0.3)'

      for (const p of particles) {
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fill()

        p.x += p.dx
        p.y += p.dy

        if (p.x < 0 || p.x > canvas.width) p.dx *= -1
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1
      }

      animFrame = requestAnimationFrame(draw)
    }

    draw()
  }

  function destroy() {
    cancelAnimationFrame(animFrame)
    if (resizeHandler) {
      window.removeEventListener('resize', resizeHandler)
    }
  }

  onUnmounted(destroy)

  return { init, destroy }
}
