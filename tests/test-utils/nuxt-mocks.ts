// tests/test-utils/nuxt-mocks.ts
// Nuxt 自动导入的 mock 唯一真相源。
// Nuxt 把所有自动导入编译到虚拟模块 "#imports"，一次 mock 覆盖全部。
import { vi } from 'vitest'
import { ref, computed, type Ref } from 'vue'

// ---- 各个 mock 函数（测试直接导入用来配置/断言）----
export const routerPush = vi.fn()
export const routerReplace = vi.fn()
export const navigateTo = vi.fn()
export const toastAdd = vi.fn()

// $fetch.create() 返回的"客户端"（useApi 里真正发请求的那个）
export const mockClient = vi.fn()
// 原始全局 $fetch（useApi 里 401 刷新 token 用的是原始 $fetch）
export const $fetch = vi.fn()
$fetch.create = vi.fn(() => mockClient) as any

/**
 * Cookie 存储：key -> ref，跨 useCookie 调用共享，测试可 seed/read。
 *
 * 通过 globalThis 共享单例，原因：vi.mock('#imports') 的工厂在 Vitest 的
 * mock 注册表中可能被复制一份模块作用域，导致工厂闭包里的 Map 与测试文件
 * import 到的 Map 不是同一个实例。globalThis 上的引用不受模块复制影响。
 */
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

// ---- 假 store（完全可控，无需启动 Pinia）----
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
  setAuth: vi.fn((n: { token?: string | null; refreshToken?: string | null; user?: unknown }) => {
    if (n.token !== undefined) authState.token.value = n.token
    if (n.refreshToken !== undefined) authState.refreshToken.value = n.refreshToken
    if (n.user !== undefined) authState.user.value = n.user as any
  }),
  clearAuth: vi.fn(() => {
    authState.token.value = null
    authState.refreshToken.value = null
    authState.user.value = null
  }),
  initAuthFromCookie: vi.fn()
}

export const uiStore = {
  authModalOpen: ref(false),
  authModalView: ref<'login' | 'register'>('login'),
  openAuthModal: vi.fn(),
  closeAuthModal: vi.fn()
}

/** 调用一次，注册所有 vi.mock + vi.stubGlobal */
export function setupNuxtMocks() {
  getCookieStoreMap().clear()

  // 一次性 mock 全部 Nuxt 自动导入
  vi.mock('#imports', () => ({
    useRuntimeConfig: vi.fn(() => ({
      public: { apiBase: 'http://localhost:3000', useMock: true, tracker: {}, sentry: {} },
      apiSecretBase: 'http://127.0.0.1:5000'
    })),
    useCookie: vi.fn((key: string) => {
      const store = getCookieStoreMap()
      if (!store.has(key)) store.set(key, ref(null))
      return store.get(key)!
    }),
    useToast: vi.fn(() => ({ add: toastAdd })),
    useRoute: vi.fn(() => ({
      path: '/',
      fullPath: '/',
      params: {},
      query: {},
      name: 'index'
    })),
    useRouter: vi.fn(() => ({ push: routerPush, replace: routerReplace })),
    navigateTo,
    defineNuxtComponent: (comp: unknown) => comp
  }))

  // 注意：这里不再 mock ~/stores/* 模块。
  // - store 单元测试需要真实 Pinia store 来验证状态逻辑；
  // - useApi 测试会在自己文件里局部 mock 这两个 store 模块。
  // 全局 mock 会导致 store 测试拿到假 store（ref 不被解包）而失败。

  // Nuxt 在 globalThis 上提供 $fetch
  vi.stubGlobal('$fetch', $fetch)
}

/** 在每个测试的 beforeEach 调用：清调用历史 + 重置 cookie/store 状态 */
export function resetNuxtMocks() {
  mockClient.mockReset()
  $fetch.mockReset()
  $fetch.create.mockReturnValue(mockClient)
  toastAdd.mockReset()
  routerPush.mockReset()
  routerReplace.mockReset()
  navigateTo.mockReset()

  getCookieStoreMap().clear()

  // 重置假 store 状态与 spy
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
