import { createPopper, type Instance as PopperInstance } from '@popperjs/core'
import { onClickOutside } from '@vueuse/core'
import { nextTick, onBeforeUnmount, shallowRef } from 'vue'

const matchTriggerWidth = {
  name: 'matchTriggerWidth',
  enabled: true,
  phase: 'beforeWrite' as const,
  fn: ({ state }: { state: any }) => {
    state.styles.popper.width = `${state.rects.reference.width}px`
  }
}

/**
 * 下拉弹层交互逻辑（状态 + 副作用）：
 * - 弹层定位（@popperjs/core，fixed 策略，Teleport 到 body 后不受 overflow/transform 裁剪）
 * - 展开/收起、高亮索引、键盘滚动、点击外部关闭
 * - 组件卸载时销毁 popper 实例
 *
 * 用法：composable 持有 trigger/panel/list 三个模板 ref，组件直接
 * `ref="triggerEl"` 绑定即可（与 VueUse composable 返回 ref 的模式一致）。
 */
export function useDropdown() {
  const isOpen = shallowRef(false)
  const isShown = shallowRef(false)
  const highlighted = shallowRef(-1)
  const triggerEl = shallowRef<HTMLElement | null>(null)
  const panelEl = shallowRef<HTMLElement | null>(null)
  const listEl = shallowRef<HTMLElement | null>(null)
  let popper: PopperInstance | null = null

  const open = (initialHighlight = -1) => {
    isOpen.value = true
    isShown.value = false
    highlighted.value = initialHighlight
    nextTick(() => {
      if (!triggerEl.value || !panelEl.value) return
      popper = createPopper(triggerEl.value, panelEl.value, {
        strategy: 'fixed',
        placement: 'bottom-start',
        modifiers: [
          matchTriggerWidth,
          { name: 'offset', options: { offset: [0, 6] } },
          { name: 'preventOverflow', options: { padding: 8 } },
          { name: 'flip', options: { fallbackPlacements: ['top-start'] } }
        ]
      })
      // Popper 已同步完成首次定位，再展示面板内容，
      // 避免面板先以 (0,0) 渲染再跳到触发器下方造成的"左上角闪现"
      isShown.value = true
    })
  }

  const close = () => {
    isShown.value = false
    isOpen.value = false
    highlighted.value = -1
    if (popper) {
      popper.destroy()
      popper = null
    }
  }

  const toggle = (initialHighlight = -1) => (isOpen.value ? close() : open(initialHighlight))

  const scrollHighlightedIntoView = () => {
    nextTick(() => {
      listEl.value
        ?.querySelector(`[data-index="${highlighted.value}"]`)
        ?.scrollIntoView({ block: 'nearest' })
    })
  }

  // 注意：不能用 onClickOutside([triggerEl, panelEl]) 数组形式——
  // VueUse 对数组 target 的 unrefElement 返回非 Element，会触发 hasMultipleRoots 崩溃。
  onClickOutside(panelEl, () => close(), { ignore: [triggerEl] })

  onBeforeUnmount(() => {
    if (popper) popper.destroy()
  })

  return {
    isOpen,
    isShown,
    highlighted,
    triggerEl,
    panelEl,
    listEl,
    open,
    close,
    toggle,
    scrollHighlightedIntoView
  }
}
