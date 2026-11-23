import { onMounted, onBeforeUnmount, watch, type Ref } from 'vue'

/** Keep a full-screen workspace inside the area above the mobile keyboard. */
export function useViewportLayout(root: Readonly<Ref<HTMLElement | null>>, enabled: () => boolean) {
  let stop: (() => void) | undefined
  onMounted(() => {
    stop = watch(
      enabled,
      (active, _, onCleanup) => {
        const element = root.value
        if (!active || !element) return
        const viewport = window.visualViewport
        let frame = 0
        const update = () => {
          cancelAnimationFrame(frame)
          frame = requestAnimationFrame(() => {
            // Pinch zoom should retain the browser's normal panning behavior.
            if (viewport && Math.abs(viewport.scale - 1) > 0.01) return
            element.style.setProperty(
              '--app-viewport-height',
              `${viewport?.height ?? window.innerHeight}px`
            )
            element.style.setProperty('--app-viewport-top', `${viewport?.offsetTop ?? 0}px`)
          })
        }
        update()
        viewport?.addEventListener('resize', update)
        viewport?.addEventListener('scroll', update)
        window.addEventListener('resize', update)
        onCleanup(() => {
          cancelAnimationFrame(frame)
          viewport?.removeEventListener('resize', update)
          viewport?.removeEventListener('scroll', update)
          window.removeEventListener('resize', update)
          element.style.removeProperty('--app-viewport-height')
          element.style.removeProperty('--app-viewport-top')
        })
      },
      { immediate: true }
    )
  })
  onBeforeUnmount(() => stop?.())
}
