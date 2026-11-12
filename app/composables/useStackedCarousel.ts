import { computed, onMounted, onUnmounted, readonly, shallowRef, watch } from 'vue'

/** 层叠轮播的索引、自动播放和指针手势；不依赖 transitionend，减少动态效果时也能循环。 */
export function useStackedCarousel(count: () => number) {
  const index = shallowRef(0)
  const dragOffset = shallowRef(0)
  const interactive = computed(() => count() > 1)
  const pauses = new Set<string>()
  let timer: ReturnType<typeof setInterval> | undefined
  let mounted = false
  const gestureTarget = '.carousel-card, .carousel-edge'
  let pointer: { id: number; x: number; y: number; target: Element } | undefined
  let suppressClick = false
  let clickTimer: ReturnType<typeof setTimeout> | undefined
  let reducedMotion: MediaQueryList | undefined

  const stop = () => {
    clearInterval(timer)
    timer = undefined
  }
  const start = () => {
    stop()
    if (mounted && interactive.value && !pauses.size && !reducedMotion?.matches) {
      timer = setInterval(() => goTo(index.value + 1), 5000)
    }
  }
  const goTo = (target: number) => {
    if (!count()) return
    index.value = ((target % count()) + count()) % count()
    start()
  }
  const goPrev = () => goTo(index.value - 1)
  const goNext = () => goTo(index.value + 1)
  const pause = (reason: string) => {
    pauses.add(reason)
    stop()
  }
  const resume = (reason: string) => {
    pauses.delete(reason)
    start()
  }
  const onPointerDown = (event: PointerEvent) => {
    const target = (event.target as Element | null)?.closest(gestureTarget)
    if (!target || !interactive.value || event.button !== 0 || !event.isPrimary) return
    pointer = { id: event.pointerId, x: event.clientX, y: event.clientY, target }
    suppressClick = false
    pause('drag')
  }
  const onPointerMove = (event: PointerEvent) => {
    if (!pointer || pointer.id !== event.pointerId) return
    const dx = event.clientX - pointer.x
    const dy = event.clientY - pointer.y
    if (Math.abs(dx) > Math.abs(dy)) {
      dragOffset.value = Math.max(-60, Math.min(60, dx * 0.3))
      if (Math.abs(dx) > 10) suppressClick = true
    }
  }
  const finishPointer = (event: PointerEvent) => {
    if (!pointer || pointer.id !== event.pointerId) return
    const dx = event.clientX - pointer.x
    const dy = event.clientY - pointer.y
    const releaseTarget = document
      .elementFromPoint(event.clientX, event.clientY)
      ?.closest(gestureTarget)
    if (releaseTarget !== pointer.target || Math.hypot(dx, dy) > 10) suppressClick = true
    if (event.type !== 'pointercancel' && Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
      suppressClick = true
      goTo(index.value + (dx < 0 ? 1 : -1))
    }
    pointer = undefined
    dragOffset.value = 0
    resume('drag')
    clearTimeout(clickTimer)
    clickTimer = setTimeout(() => {
      suppressClick = false
    }, 0)
  }
  const onClickCapture = (event: MouseEvent) => {
    if (!suppressClick || event.detail === 0) return
    event.preventDefault()
    event.stopPropagation()
    suppressClick = false
  }
  const onVisibilityChange = () => (document.hidden ? pause('hidden') : resume('hidden'))
  watch(count, () => {
    index.value = 0
    dragOffset.value = 0
    pointer = undefined
    pauses.delete('drag')
    start()
  })
  onMounted(() => {
    mounted = true
    reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    reducedMotion.addEventListener('change', start)
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', finishPointer)
    window.addEventListener('pointercancel', finishPointer)
    document.addEventListener('visibilitychange', onVisibilityChange)
    onVisibilityChange()
  })
  onUnmounted(() => {
    mounted = false
    stop()
    clearTimeout(clickTimer)
    reducedMotion?.removeEventListener('change', start)
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerup', finishPointer)
    window.removeEventListener('pointercancel', finishPointer)
    document.removeEventListener('visibilitychange', onVisibilityChange)
  })
  return {
    index: readonly(index),
    interactive,
    dragOffset: readonly(dragOffset),
    goPrev,
    goNext,
    goTo,
    pause,
    resume,
    onPointerDown,
    onClickCapture
  }
}
