import { useMediaQuery } from '@vueuse/core'
import { onUnmounted, watch, type Ref } from 'vue'

interface Spark {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  born: number
  lifetime: number
  accent: boolean
}

const MAX_SPARKS = 64

export function useHeroPointerEffects(
  canvasRef: Ref<HTMLCanvasElement | null>,
  isDark: () => boolean
) {
  const enabled = useMediaQuery('(any-hover: hover) and (prefers-reduced-motion: no-preference)')
  const sparks: Spark[] = []
  let frame = 0
  let previousFrame = 0
  let lastTrail: { x: number; y: number; time: number } | undefined
  let hero: HTMLElement | undefined

  function resetPointer() {
    lastTrail = undefined
    hero?.style.removeProperty('--hero-pointer-x')
    hero?.style.removeProperty('--hero-pointer-y')
    hero = undefined
  }

  function stop() {
    resetPointer()
    cancelAnimationFrame(frame)
    frame = 0
    previousFrame = 0
    sparks.length = 0
    const canvas = canvasRef.value
    canvas?.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height)
  }

  function draw(now: number) {
    frame = 0
    const canvas = canvasRef.value
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const elapsed = previousFrame ? Math.min(now - previousFrame, 32) : 0
    const dark = isDark()
    const primary = dark ? '#d8b4fe' : '#7e22ce'
    const accent = dark ? '#f9a8d4' : '#db2777'
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    for (let i = sparks.length - 1; i >= 0; i--) {
      const spark = sparks[i]!
      const progress = Math.max(0, (now - spark.born) / spark.lifetime)
      if (progress >= 1) {
        sparks.splice(i, 1)
        continue
      }

      spark.x += spark.vx * elapsed
      spark.y += spark.vy * elapsed
      ctx.globalAlpha = 0.85 * (1 - progress) ** 2
      ctx.fillStyle = spark.accent ? accent : primary
      ctx.beginPath()
      ctx.arc(spark.x, spark.y, spark.size * (1 - progress * 0.45), 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalAlpha = 1
    previousFrame = sparks.length ? now : 0
    if (sparks.length) frame = requestAnimationFrame(draw)
  }

  function emit(x: number, y: number, count: number, burst: boolean) {
    const canvas = canvasRef.value
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const ratio = Math.min(window.devicePixelRatio, 2)
    const width = Math.round(canvas.clientWidth * ratio)
    const height = Math.round(canvas.clientHeight * ratio)
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width
      canvas.height = height
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
    }

    const now = performance.now()
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      const speed = (burst ? 0.08 : 0.025) + Math.random() * (burst ? 0.12 : 0.065)
      sparks.push({
        x: x + Math.cos(angle) * 5,
        y: y + Math.sin(angle) * 5,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.025,
        size: 1.25 + Math.random() * (burst ? 2 : 1.25),
        born: now,
        lifetime: 380 + Math.random() * 340,
        accent: i % 3 === 0
      })
    }
    if (sparks.length > MAX_SPARKS) sparks.splice(0, sparks.length - MAX_SPARKS)
    if (!frame) frame = requestAnimationFrame(draw)
  }

  function move(event: PointerEvent) {
    if (!enabled.value || event.pointerType !== 'mouse') return
    hero = event.currentTarget as HTMLElement
    const rect = hero.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    hero.style.setProperty('--hero-pointer-x', `${(x / rect.width - 0.5) * 22}px`)
    hero.style.setProperty('--hero-pointer-y', `${(y / rect.height - 0.5) * 16}px`)

    const now = performance.now()
    if (
      lastTrail &&
      (now - lastTrail.time < 32 || Math.hypot(x - lastTrail.x, y - lastTrail.y) < 9)
    ) {
      return
    }
    lastTrail = { x, y, time: now }
    emit(x, y, 3, false)
  }

  function burst(event: PointerEvent) {
    if (!enabled.value || event.pointerType !== 'mouse') return
    const rect = canvasRef.value?.getBoundingClientRect()
    if (rect) emit(event.clientX - rect.left, event.clientY - rect.top, 23, true)
  }

  watch(enabled, (active) => {
    if (!active) stop()
  })
  onUnmounted(stop)

  return { move, leave: resetPointer, burst }
}
