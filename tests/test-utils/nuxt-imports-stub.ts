/**
 * vitest 环境中 #imports 虚拟模块的真实实现。
 *
 * Nuxt 把自动导入编译到虚拟模块 "#imports"，但 Vitest 不运行 Nuxt 的编译流程，
 * 导致 .ts/.vue 文件里的 `import { useCookie } from '#imports'` 无法解析。
 *
 * 在 vitest.config.ts 中通过 resolve.alias 把 "#imports" 指向本文件，
 * 让所有用到 #imports 的模块都拿到一套可控的假实现。
 *
 * 注意：本文件用 vi.fn() 提供 mock 函数，测试文件通过 `import { cookieStore } from
 * 'tests/test-utils/nuxt-imports-stub'` 拿到同一份引用进行 seed/断言。
 */
import { vi } from 'vitest'
import { ref, computed, type Ref } from 'vue'

// ---- cookie 共享存储（globalThis 单例，避免 vi.mock 工厂闭包复制问题）----
const COOKIE_STORE_KEY = '__NUXT_MOCK_COOKIE_STORE__'
function getCookieStoreMap(): Map<string, Ref<unknown>> {
  const g = globalThis as any
  if (!g[COOKIE_STORE_KEY]) g[COOKIE_STORE_KEY] = new Map()
  return g[COOKIE_STORE_KEY]
}
export const cookieStore: Map<string, Ref<unknown>> = new Proxy(new Map(), {
  get(_target, prop, receiver) {
    const real = getCookieStoreMap()
    const value = Reflect.get(real, prop, receiver)
    return typeof value === 'function' ? value.bind(real) : value
  },
  set(_target, prop, value) {
    return Reflect.set(getCookieStoreMap(), prop, value)
  }
})

// ---- 各个 mock 函数 ----
export const useRuntimeConfig = vi.fn(() => ({
  public: { apiBase: 'http://localhost:3000', useMock: true, tracker: {}, sentry: {} },
  apiSecretBase: 'http://127.0.0.1:5000'
}))

export const useCookie = vi.fn((key: string) => {
  const store = getCookieStoreMap()
  if (!store.has(key)) store.set(key, ref(null))
  return store.get(key)!
})

export const useToast = vi.fn(() => ({ add: toastAdd }))
export const toastAdd = vi.fn()

export const useRoute = vi.fn(() => ({
  path: '/',
  fullPath: '/',
  params: {},
  query: {},
  name: 'index'
}))

export const useRouter = vi.fn(() => ({ push: routerPush, replace: routerReplace }))
export const routerPush = vi.fn()
export const routerReplace = vi.fn()

export const navigateTo = vi.fn()

export const defineNuxtComponent = (comp: unknown) => comp

// ---- 假 store（供 useApi 等依赖 store 的模块使用）----
export const authState = {
  token: ref<string | null>(null),
  refreshToken: ref<string | null>(null),
  user: ref<{ id: number; username: string } | null>(null)
}
export const authStore = {
  get token() {
    return authState.token
  },
  get refreshToken() {
    return authState.refreshToken
  },
  get user() {
    return authState.user
  },
  isAuthenticated: computed(() => !!(authState.token.value || authState.refreshToken.value)),
  setAuth: vi.fn(),
  clearAuth: vi.fn(),
  initAuthFromCookie: vi.fn()
}
export const uiStore = {
  authModalOpen: ref(false),
  authModalView: ref<'login' | 'register'>('login'),
  openAuthModal: vi.fn(),
  closeAuthModal: vi.fn()
}

// ---- 重置函数：在测试的 beforeEach 调用 ----
export function resetNuxtImportsStub() {
  getCookieStoreMap().clear()
  useRuntimeConfig.mockClear()
  useCookie.mockClear()
  useToast.mockClear()
  toastAdd.mockClear()
  useRoute.mockClear()
  useRouter.mockClear()
  routerPush.mockClear()
  routerReplace.mockClear()
  navigateTo.mockClear()
  authState.token.value = null
  authState.refreshToken.value = null
  authState.user.value = null
  authStore.setAuth.mockClear()
  authStore.clearAuth.mockClear()
  authStore.initAuthFromCookie.mockClear()
  uiStore.authModalOpen.value = false
  uiStore.authModalView.value = 'login'
  uiStore.openAuthModal.mockClear()
  uiStore.closeAuthModal.mockClear()
}
