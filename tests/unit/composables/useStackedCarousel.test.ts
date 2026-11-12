// @vitest-environment happy-dom
import { defineComponent, h, nextTick, shallowRef } from 'vue'
import { mount } from '@vue/test-utils'
import { afterEach, expect, it, vi } from 'vitest'
import { useStackedCarousel } from '../../../app/composables/useStackedCarousel'

afterEach(() => {
  vi.useRealTimers()
})

it('cycles both directions, pauses for overlapping reasons and handles shrinking data', async () => {
  vi.useFakeTimers()
  const count = shallowRef(5)
  let carousel!: ReturnType<typeof useStackedCarousel>
  const wrapper = mount(
    defineComponent({
      setup() {
        carousel = useStackedCarousel(() => count.value)
        return () => h('div')
      }
    })
  )
  carousel.goPrev()
  expect(carousel.index.value).toBe(4)
  carousel.goNext()
  expect(carousel.index.value).toBe(0)
  vi.advanceTimersByTime(5000)
  expect(carousel.index.value).toBe(1)
  carousel.pause('hover')
  carousel.pause('focus')
  carousel.resume('hover')
  vi.advanceTimersByTime(10000)
  expect(carousel.index.value).toBe(1)
  carousel.resume('focus')
  vi.advanceTimersByTime(5000)
  expect(carousel.index.value).toBe(2)
  count.value = 1
  await nextTick()
  expect(carousel.index.value).toBe(0)
  expect(carousel.interactive.value).toBe(false)
  count.value = 0
  await nextTick()
  carousel.goPrev()
  expect(carousel.index.value).toBe(0)
  wrapper.unmount()
  expect(vi.getTimerCount()).toBe(0)
})
