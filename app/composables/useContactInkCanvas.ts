import { useMediaQuery } from '@vueuse/core'
import { onBeforeUnmount, onMounted, watch, type Ref } from 'vue'

interface StarParticle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  opacity: number
  color: number
  points: 4 | 5
  outline: boolean
  phase: number
  rotation: number
  spin: number
}

interface InkRipple {
  x: number
  y: number
  born: number
  lifetime: number
  radius: number
  strength: number
  seed: number
}

const TAU = Math.PI * 2
const MAX_RIPPLES = 9
const STAR_COLORS = {
  light: ['166, 128, 219', '226, 143, 179', '207, 166, 87'],
  dark: ['204, 183, 247', '248, 190, 212', '250, 222, 161']
} as const

/** 为联系区自动管理漂浮星星、水墨涟漪及可见性生命周期。 */
export function useContactInkCanvas(
  canvasRef: Readonly<Ref<HTMLCanvasElement | null>>,
  isDark: () => boolean
) {
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const canHover = useMediaQuery('(any-hover: hover)')
  const particles: StarParticle[] = []
  const ripples: InkRipple[] = []
  let canvas: HTMLCanvasElement | null = null
  let ctx: CanvasRenderingContext2D | null = null
  let resizeObserver: ResizeObserver | undefined
  let intersectionObserver: IntersectionObserver | undefined
  let width = 0
  let height = 0
  let inView = false
  let frame = 0
  let previousFrame = 0
  let lastPointer: { x: number; y: number; time: number } | undefined

  /** 离开或取消指针交互时重置采样，已有涟漪继续自然淡出。 */
  function leave() {
    lastPointer = undefined
  }

  /** 停止动画并丢弃旧涟漪，避免恢复可见后补播积累的动画。 */
  function stop() {
    if (frame) cancelAnimationFrame(frame)
    frame = 0
    previousFrame = 0
    ripples.length = 0
    leave()
  }

  /** 绘制圆润五角星与四角星光，用缓慢呼吸和旋转营造轻盈感。 */
  function drawStar(context: CanvasRenderingContext2D, star: StarParticle, color: string) {
    const twinkle = 0.78 + Math.sin(star.phase) * 0.22
    const radius = star.radius * (0.94 + twinkle * 0.08)
    const opacity = star.opacity * twinkle
    context.save()
    context.translate(star.x + Math.sin(star.phase) * 2.5, star.y)
    context.rotate(star.rotation)
    context.fillStyle = `rgb(${color})`
    context.strokeStyle = `rgb(${color})`
    context.lineJoin = 'round'
    context.lineWidth = radius * 0.18
    context.beginPath()
    for (let point = 0; point < star.points * 2; point++) {
      const angle = (point / (star.points * 2)) * TAU - Math.PI / 2
      const length = point % 2 === 0 ? radius : radius * (star.points === 5 ? 0.48 : 0.26)
      const x = Math.cos(angle) * length
      const y = Math.sin(angle) * length
      if (point === 0) context.moveTo(x, y)
      else context.lineTo(x, y)
    }
    context.closePath()
    context.globalAlpha = opacity * (star.outline ? 0.14 : 1)
    context.fill()
    context.globalAlpha = opacity
    context.stroke()
    context.restore()
  }

  /** 以径向晕染、正弦扰动轮廓和少量墨滴绘制单次扩散。 */
  function drawRipple(
    context: CanvasRenderingContext2D,
    ripple: InkRipple,
    progress: number,
    ink: string,
    tint: string
  ) {
    const { x, y, seed, strength } = ripple
    const radius = 16 + (ripple.radius - 16) * (1 - (1 - progress) ** 2)
    const fade = (1 - progress) ** 1.4 * strength
    const wash = context.createRadialGradient(x - radius * 0.12, y, 0, x, y, radius)
    wash.addColorStop(0, `rgba(${ink}, 0.12)`)
    wash.addColorStop(0.35, `rgba(${tint}, 0.08)`)
    wash.addColorStop(0.72, `rgba(${ink}, 0.025)`)
    wash.addColorStop(1, `rgba(${ink}, 0)`)
    context.globalAlpha = fade
    context.fillStyle = wash
    context.fillRect(x - radius, y - radius, radius * 2, radius * 2)

    for (let layer = 0; layer < 3; layer++) {
      context.globalAlpha = fade * (0.32 - layer * 0.065)
      context.strokeStyle = `rgb(${layer === 1 ? tint : ink})`
      context.lineWidth = 1.4 - layer * 0.25
      context.beginPath()
      for (let step = 0; step <= 64; step++) {
        const angle = (step / 64) * TAU
        const wobble =
          1 +
          Math.sin(angle * 3 + seed + progress * 2) * 0.045 +
          Math.sin(angle * 7 - seed + layer) * 0.025
        const edge = radius * (1 - layer * 0.19) * wobble
        const px = x + Math.cos(angle) * edge
        const py = y + Math.sin(angle) * edge * 0.92
        if (step === 0) context.moveTo(px, py)
        else context.lineTo(px, py)
      }
      context.closePath()
      context.stroke()
    }

    context.globalAlpha = fade * 0.45
    context.fillStyle = `rgb(${ink})`
    for (let drop = 0; drop < 4; drop++) {
      const angle = seed + (drop / 4) * TAU
      const distance = radius * (0.3 + drop * 0.11)
      const size = (1.2 + (Math.sin(seed + drop) + 1) * 0.8) * (1 - progress * 0.4)
      context.beginPath()
      context.arc(x + Math.cos(angle) * distance, y + Math.sin(angle) * distance, size, 0, TAU)
      context.fill()
    }
  }

  /** 绘制当前画面；零时间步长让减少动态模式下的星星保持静止。 */
  function draw(now: number, elapsed = 0) {
    if (!ctx || !width || !height) return
    const dark = isDark()
    const ink = dark ? '183, 176, 202' : '76, 74, 88'
    const tint = dark ? '171, 150, 208' : '122, 104, 149'
    const colors = STAR_COLORS[dark ? 'dark' : 'light']
    ctx.clearRect(0, 0, width, height)
    for (const particle of particles) {
      particle.x = (particle.x + particle.vx * elapsed + width) % width
      particle.y = (particle.y + particle.vy * elapsed + height) % height
      particle.phase += elapsed * 0.0009
      particle.rotation += particle.spin * elapsed
      drawStar(ctx, particle, colors[particle.color]!)
    }
    for (let i = ripples.length - 1; i >= 0; i--) {
      const ripple = ripples[i]!
      const progress = Math.max(0, (now - ripple.born) / ripple.lifetime)
      if (progress >= 1) ripples.splice(i, 1)
      else drawRipple(ctx, ripple, progress, ink, tint)
    }
    ctx.globalAlpha = 1
  }

  /** 仅在可见且允许动态时逐帧漂浮，限制恢复或卡顿后的时间步长。 */
  function animate(now: number) {
    frame = 0
    if (!ctx || !inView || document.hidden || reducedMotion.value) {
      syncPlayback()
      return
    }
    const elapsed = previousFrame ? Math.min(now - previousFrame, 40) : 0
    previousFrame = now
    draw(now, elapsed)
    frame = requestAnimationFrame(animate)
  }

  /** 统一响应可见性、主题及偏好切换，静态模式只重绘而不申请动画帧。 */
  function syncPlayback() {
    stop()
    if (!ctx || !inView || document.hidden || !width || !height) return
    draw(performance.now())
    if (!reducedMotion.value) frame = requestAnimationFrame(animate)
  }

  /** 按实际尺寸设置最高两倍分辨率，稀疏分布大小星星以保留正文留白。 */
  function resize(entries: ResizeObserverEntry[]) {
    const size = entries[0]?.contentRect
    if (!canvas || !ctx || !size) return
    width = size.width
    height = size.height
    const ratio = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = Math.round(width * ratio)
    canvas.height = Math.round(height * ratio)
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
    particles.length = 0
    const small = width < 768
    const count = Math.min(small ? 18 : 42, Math.ceil((width * height) / (small ? 20000 : 30000)))
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.016,
        vy: -0.005 - Math.random() * 0.01,
        radius: small ? 3.5 + Math.random() * 3.5 : 4.5 + Math.random() * 5,
        opacity: 0.5 + Math.random() * 0.3,
        color: i % STAR_COLORS.light.length,
        points: i % 4 === 0 ? 4 : 5,
        outline: i % 5 === 0,
        phase: Math.random() * TAU,
        rotation: Math.random() * 0.8 - 0.4,
        spin: (i % 2 === 0 ? 1 : -1) * (0.00004 + Math.random() * 0.00006)
      })
    }
    syncPlayback()
  }

  /** 离开视口时暂停绘制，重新进入后从当前星星位置恢复。 */
  function updateIntersection(entries: IntersectionObserverEntry[]) {
    inView = entries[0]?.isIntersecting ?? false
    syncPlayback()
  }

  /** 仅采样支持悬停的鼠标，以时间和距离双重节流生成有限涟漪。 */
  function emitRipple(event: PointerEvent, strong: boolean) {
    if (!canvas || !ctx || !inView || document.hidden || !width || !height) return
    if (reducedMotion.value || !canHover.value || event.pointerType !== 'mouse') return
    const rect = canvas.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * width
    const y = ((event.clientY - rect.top) / rect.height) * height
    const now = performance.now()
    if (
      !strong &&
      lastPointer &&
      (now - lastPointer.time < 96 || Math.hypot(x - lastPointer.x, y - lastPointer.y) < 20)
    ) {
      return
    }
    lastPointer = { x, y, time: now }
    ripples.push({
      x,
      y,
      born: now,
      lifetime: (strong ? 2000 : 1600) + Math.random() * 400,
      radius: (strong ? 230 : 150) + Math.random() * (strong ? 50 : 60),
      strength: strong ? 1 : 0.65,
      seed: Math.random() * TAU
    })
    if (ripples.length > MAX_RIPPLES) ripples.shift()
  }

  /** 进入联系区时生成一次更明显的水墨涟漪。 */
  function enter(event: PointerEvent) {
    emitRipple(event, true)
  }

  /** 鼠标移动时按采样阈值追加涟漪，静止时不生成新波纹。 */
  function move(event: PointerEvent) {
    emitRipple(event, false)
  }

  /** 挂载后自动接管画布，仅监听局部尺寸、视口和页面可见性。 */
  function mount() {
    canvas = canvasRef.value
    ctx = canvas?.getContext('2d') ?? null
    if (!canvas || !ctx) return
    resizeObserver = new ResizeObserver(resize)
    intersectionObserver = new IntersectionObserver(updateIntersection)
    resizeObserver.observe(canvas)
    intersectionObserver.observe(canvas)
    document.addEventListener('visibilitychange', syncPlayback)
  }

  /** 卸载时释放动画、观察器和监听，避免后台绘制及持有画布引用。 */
  function dispose() {
    stop()
    resizeObserver?.disconnect()
    intersectionObserver?.disconnect()
    if (canvas) document.removeEventListener('visibilitychange', syncPlayback)
    particles.length = 0
    ctx = null
    canvas = null
  }

  watch([reducedMotion, canHover, isDark], syncPlayback)
  onMounted(mount)
  onBeforeUnmount(dispose)

  return { enter, move, leave }
}
