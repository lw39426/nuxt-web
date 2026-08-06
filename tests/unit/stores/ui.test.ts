// tests/unit/stores/ui.test.ts
// Pinia setup store 会自动"解包"（unwrap）返回的 ref：
// 访问 s.view 直接拿到值，而不是 s.view.value。
// 参见 https://pinia.vuejs.org/core-concepts/#Setup-Stores
import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useUiStore } from '~/stores/ui'

describe('useUiStore', () => {
  beforeEach(() => {
    // 每个测试用全新的 Pinia 实例，状态天然隔离
    setActivePinia(createPinia())
  })

  it('默认关闭、视图为 login', () => {
    const store = useUiStore()
    expect(store.authModalOpen).toBe(false)
    expect(store.authModalView).toBe('login')
  })

  it('openAuthModal 设置视图并打开', () => {
    const store = useUiStore()
    store.openAuthModal('register')
    expect(store.authModalView).toBe('register')
    expect(store.authModalOpen).toBe(true)
  })

  it('closeAuthModal 关闭弹窗', () => {
    const store = useUiStore()
    store.openAuthModal()
    store.closeAuthModal()
    expect(store.authModalOpen).toBe(false)
  })
})
