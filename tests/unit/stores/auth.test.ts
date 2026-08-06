// tests/unit/stores/auth.test.ts
// auth store 的 setAuth/clearAuth 内部调用 useCookie（Nuxt 自动导入），
// 在纯 Vitest 环境中无法直接运行。这里用真实 Pinia + 通过 nuxt-mocks 的
// vi.mock('#imports') 把 useCookie 替换成我们的 cookieStore 假实现，
// 从而端到端测试 store 的真实逻辑（状态 + cookie 写入）。
//
// 注意：Pinia setup store 会解包 ref，所以读 s.token 而不是 s.token.value。
import { describe, it, expect, beforeEach } from 'vitest'
import { ref } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import { useAuthStore } from '~/stores/auth'
import { cookieStore } from 'tests/test-utils/nuxt-mocks'

describe('useAuthStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    cookieStore.clear()
  })

  it('无 token 时 isAuthenticated 为 false', () => {
    const store = useAuthStore()
    expect(store.isAuthenticated).toBe(false)
  })

  it('设置 token 后 isAuthenticated 为 true', () => {
    const store = useAuthStore()
    store.setAuth({ token: 'abc' })
    expect(store.isAuthenticated).toBe(true)
    expect(store.token).toBe('abc')
  })

  it('仅有 refreshToken 也算已认证', () => {
    const store = useAuthStore()
    store.setAuth({ refreshToken: 'rt' })
    expect(store.isAuthenticated).toBe(true)
  })

  it('clearAuth 清空 token 与 cookie', () => {
    const store = useAuthStore()
    store.setAuth({ token: 'abc', refreshToken: 'rt' })
    store.clearAuth()
    expect(store.token).toBeNull()
    expect(store.refreshToken).toBeNull()
    expect(store.user).toBeNull()
    expect(cookieStore.get('auth_token')!.value).toBeNull()
    expect(cookieStore.get('refresh_token')!.value).toBeNull()
  })

  it('initAuthFromCookie 把 cookie 读进状态（客户端分支）', () => {
    // 依赖 vitest.config.ts 中 import.meta.client=true 的 define
    cookieStore.set('auth_token', ref('from-cookie'))
    cookieStore.set('refresh_token', ref('rt-cookie'))

    const store = useAuthStore()
    store.initAuthFromCookie()
    expect(store.token).toBe('from-cookie')
    expect(store.refreshToken).toBe('rt-cookie')
  })
})
