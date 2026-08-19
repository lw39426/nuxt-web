# 前端自动化测试体系 — 面试题与 Q&A

> 基于 domeWeb 项目（Nuxt 4 + Vue 3.5 + Pinia 3）从零搭建的前端测试体系，覆盖单元测试 + 组件测试，CI 阻断合并。

---

## 一、整体架构类

### Q1: 请介绍一下你这套测试体系是怎么搭建的？

**A:** 项目最初是零测试状态。我从以下几个维度设计并实施了整套方案：

**第一步 — 技术选型。** 选定 Vitest 3 作为唯一测试运行器（单元 + 组件通吃），配合 `@vue/test-utils` + happy-dom 做组件测试。**刻意没有引入 `@nuxt/test-utils`**，因为它对 Nuxt 4 的兼容性尚不成熟，而且会带来 Nuxt 启动开销。

**第二步 — 解决 Nuxt 自动导入问题。** 这是最大的障碍。Nuxt 把 `useRuntimeConfig`、`useCookie`、`useToast` 等编译到虚拟模块 `#imports`，Vitest 不跑 Nuxt 编译流程，这些导入全部无法解析。我的方案是：**在 `vitest.config.ts` 用 `resolve.alias` 把 `#imports` 重定向到本地 stub 文件**，所有 `.ts`/`.vue` 里的 `#imports` 导入都拿到一套可控的假实现。

**第三步 — 分类处理不同模块的隔离需求。** 纯函数/SDK 直接 import；Pinia store 用 `createPinia()` 每个测试新建实例；组件用 `vi.stubGlobal` + stub 子组件；useApi 这种有模块级可变状态的用 `vi.resetModules()` + 动态 import。

**第四步 — CI 集成。** 在 GitHub Actions 的 workflow 里插入 test 步骤，`vitest run` 失败时退出非零，阻断后续 build，满足"测试失败阻断合并"。

最终成果：8 个测试文件、53 个测试全部通过，覆盖 utils/stores/composables/tracker/queue/组件。

---

### Q2: 为什么选 Vitest 而不是 Jest？

**A:** 主要三个原因：

1. **Vite 原生**。项目用 Vite（Nuxt 4 内置），Vitest 与 Vite 共享同一套配置（alias、define、插件），不需要维护两套构建配置。Jest 需要 babel/ts-jest + 单独配置，与 Vite 体系割裂。

2. **ESM 友好**。项目是 `"type": "module"`，Vitest 原生支持 ESM，Jest 需要额外配置 `transform` + `moduleNameMapper`，对 `#imports` 这类裸模块支持较差。

3. **速度快**。Vitest 用 Vite 的按需编译 + 智能文件监听，冷启动和 HMR 都比 Jest 快一个量级。

4. **API 兼容**。Vitest 的 API 设计与 Jest 高度兼容（`describe/it/expect/vi.fn`），团队迁移成本低。

---

### Q3: 为什么不用 `@nuxt/test-utils` 的 `mountSuspended`？

**A:** 这是一个有意识的取舍：

| 维度 | @nuxt/test-utils | @vue/test-utils + alias stub |
|---|---|---|
| Nuxt 4 兼容性 | 当时不稳定，API 频繁变动 | 无依赖，稳定 |
| 启动开销 | 需要启动完整 Nuxt 实例 | 零启动，纯 Vitest |
| 自动导入 | 原生支持 | 需要自己维护 stub |
| 测试速度 | 慢（Nuxt 启动 ~秒级） | 快（~毫秒级） |
| 调试体验 | 黑盒，出错难定位 | 白盒，stub 完全可控 |

核心哲学：**测试应该测"我的代码"，不是测"Nuxt 能不能跑起来"**。用 alias stub 把 Nuxt 自动导入替换成可控的假实现，测试更纯粹、更快、更易调试。

后续如果 `@nuxt/test-utils` 对 Nuxt 4 稳定了，可以考虑迁移，但目前的方案已经满足需求。

---

## 二、Nuxt 自动导入 Mock 类

### Q4: `#imports` 虚拟模块是怎么 mock 的？为什么不用 `vi.mock('#imports')`？

**A:** 最初确实尝试了 `vi.mock('#imports')`，但遇到两个致命问题：

**问题 1：模块复制。** `vi.mock('#imports')` 的工厂函数在 Vitest 的 mock 注册表中可能被复制一份模块作用域，导致工厂闭包里的 `cookieStore`（Map）与测试文件 import 到的 `cookieStore` 不是同一个实例。测试 seed 了 cookie，但 stub 的 `useCookie` 读不到。

**问题 2：与 `vi.resetModules()` 冲突。** `vi.resetModules()` 会清空 mock 注册，而 `vi.mock()` 是 hoisted 的，无法在运行时重新注册。useApi 测试需要 `resetModules` 来重置模块级状态，两者不兼容。

**最终方案：`resolve.alias`。**

```ts
// vitest.config.ts
export default defineConfig({
  resolve: {
    alias: {
      '#imports': '/absolute/path/to/tests/test-utils/nuxt-imports-stub.ts',
    },
  },
})
```

这样 `#imports` 在任何文件里都解析到同一个 stub 文件，不存在模块复制问题。配合 `globalThis` 单例的 `cookieStore`，测试与 stub 共享同一份状态。

---

### Q5: stub 文件里的 `cookieStore` 为什么用 `globalThis` 单例 + Proxy？

**A:** 这是为了解决**模块重复实例化**问题。

Vitest 的模块系统在不同测试文件之间会复用模块缓存，但在某些场景下（比如 `vi.resetModules()` 后重新 import）会创建新的模块实例。如果 stub 文件导出一个普通的 `new Map()`，测试文件拿到的 Map 和 useApi 内部 `#imports` 解析到的 Map 可能是不同的实例。

**解决方案：**

```ts
const COOKIE_STORE_KEY = '__NUXT_MOCK_COOKIE_STORE__'
function getCookieStoreMap(): Map<string, Ref<unknown>> {
  const g = globalThis as any
  if (!g[COOKIE_STORE_KEY]) g[COOKIE_STORE_KEY] = new Map()
  return g[COOKIE_STORE_KEY]
}
export const cookieStore = new Proxy(new Map(), {
  get(target, prop, receiver) {
    const real = getCookieStoreMap()
    const value = Reflect.get(real, prop, receiver)
    return typeof value === 'function' ? value.bind(real) : value
  },
})
```

- `globalThis` 上的引用不受模块实例化影响，永远是同一个 Map
- Proxy 让外部代码可以像操作普通 Map 一样操作 `cookieStore`（`.set()` / `.get()` / `.has()` / `.clear()`）
- 所有读写都转发到 `globalThis` 单例

---

### Q6: `import.meta.client` 是怎么注入的？为什么 `test.define` 不行？

**A:** 这是一个踩了很多坑才发现的问题。

最初在 `vitest.config.ts` 里这样写：

```ts
test: {
  define: {
    'import.meta.client': 'true',
    'import.meta.server': 'false',
  },
}
```

但测试里 `import.meta.client` 仍然是 `undefined`。

**根因：** Vitest 3 的 `test.define` 无法注入 `import.meta.*` 属性。`import.meta` 是 ES 标准模块元数据对象，Vitest 对其有特殊处理，`test.define` 的替换逻辑不覆盖 `import.meta`。

**解决：把 `define` 提到 `defineConfig` 顶层：**

```ts
export default defineConfig({
  define: {
    'import.meta.client': 'true',
    'import.meta.server': 'false',
  },
  test: { ... }
})
```

顶层 `define` 走的是 Vite 的 `define` 插件，它在编译阶段做文本替换，能正确处理 `import.meta.*`。

**验证方式：** 在测试里 `console.log(import.meta.client)` 确认是 `true`（boolean），不是字符串 `'true'`。

---

## 三、测试隔离策略类

### Q7: useApi 的模块级状态（refreshPromise / requestLocks / errorToastCache）是怎么做测试隔离的？

**A:** 这是整个测试体系里最复杂的部分。useApi 模块内部有三个模块级变量：

```ts
let refreshPromise: Promise<boolean> | null = null   // 401 刷新锁
const errorToastCache = new Set<string>()             // 错误 toast 防抖
const requestLocks = new Map<string, Promise<any>>()  // 并发请求去重
```

这些状态在模块加载时创建，跨测试共享。如果不重置，一个测试的状态会影响下一个测试。

**方案：`vi.resetModules()` + 动态 import。**

```ts
async function freshApi() {
  vi.resetModules()                              // 清空模块缓存
  const stub = await import('#imports')          // 重新导入 stub（拿到新 vi.fn 实例）
  const mod = await import('~/composables/useApi') // 全新 useApi 模块实例
  api = mod.useApi()
}
```

**关键细节：**

1. **`resetModules()` 后 stub 也被重置**。stub 里的 `vi.fn()` 会变成新实例，所以必须重新 `import('#imports')` 拿到新引用，否则测试里拿到的 `useCookie` 是旧实例，useApi 内部用的是新实例，mock 调用对不上。

2. **cookie 必须在 `freshApi()` 之前 seed。** 因为 `useApi()` 内部会调用 `useCookie('auth_token')` 捕获当时的 ref。如果先 `freshApi()` 再 seed cookie，useApi 捕获的是空 ref，seed 的新 ref 跟 useApi 内部的是两个不同对象。

3. **假 store 状态放在 `globalThis` 单例上。** 模块重置后假 store 对象本身还在（因为 `vi.mock` 的工厂返回的是 `globalThis` 单例），但内部的 `vi.fn()` 需要 `mockClear()`。

4. **错误 toast 测试使用唯一 key。** `errorToastCache` 是模块内的 `Set`，`resetModules` 会重置它。但为了保险（比如测试顺序导致某个测试没走到 reset），每个测试用不同的 `code+message` 组合。

---

### Q8: Pinia store 测试时，`store.token` 和 `store.token.value` 有什么区别？

**A:** **Pinia setup store 会自动解包 ref。**

```ts
// store 定义
export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(null)
  return { token }
})

// 测试中
const store = useAuthStore()
store.token        // ✅ 直接拿到值（string | null）
store.token.value  // ❌ 这是 undefined，因为 token 已经被解包了
```

**原理：** Pinia 在 setup store 返回时，会检测返回值中的 `ref`，在访问 store 属性时自动 `.value` 解包。这是 Pinia 的设计行为，不是 JavaScript 的 Proxy 魔法。

**对比 option store：**

```ts
// Option store 不会自动解包
export const useXxxStore = defineStore('xxx', {
  state: () => ({ count: 0 }),
  getters: { double: (state) => state.count * 2 }
})
```

Option store 的 state 是 reactive 对象，没有 ref 解包的概念。

---

### Q9: 组件测试里 `navigateTo` 是怎么 mock 的？为什么不用 `vi.mock('#imports')`？

**A:** 组件里的 `navigateTo` 是**裸全局调用**（没有 `import { navigateTo } from '#imports'`），Nuxt 编译时自动注入。在 Vitest 里，裸全局会解析到 `globalThis`。

**方案：`vi.stubGlobal`。**

```ts
const navigateTo = vi.fn()
vi.stubGlobal('navigateTo', navigateTo)

// 测试
await wrapper.find('button').trigger('click')
expect(navigateTo).toHaveBeenCalledWith('/articles/42')
```

**为什么不用 `vi.mock('#imports')`？**
- 组件里没有 `import` 语句，`vi.mock` 无法拦截裸全局调用
- `vi.stubGlobal` 直接操作 `globalThis`，对裸全局有效
- 与 `#imports` alias 方案不冲突（一个处理显式 import，一个处理裸全局）

---

## 四、覆盖率与 CI 类

### Q10: 覆盖率阈值是怎么定的？为什么这么低？

**A:** 当前阈值：

```ts
thresholds: { lines: 3, functions: 5, branches: 2, statements: 3 }
```

**为什么低？** 这是**从零起步**的策略：

1. **先有再优。** 项目之前是零测试，首批测试覆盖了最核心的模块（utils/stores/composables/tracker/queue），整体覆盖率约 4%。如果一开始设 60%，CI 直接红灯，团队会绕过测试（`it.skip`），反而有害。

2. **逐步提升。** 每补充一批测试，就调高一次阈值。比如：
   - 当前：3%（有测试兜底）
   - 补充 pages/components 后：15%
   - 补充所有 composables 后：30%
   - 成熟期目标：60%+

3. **阈值是下限，不是目标。** 它保证"覆盖率不退化"，但不限制"覆盖率提升"。

**实际覆盖率分布：**

| 模块 | 覆盖率 | 说明 |
|---|---|---|
| app/stores | 100% | auth + ui 全覆盖 |
| app/utils | 100% | format 全覆盖 |
| app/composables | 26.6% | useApi 核心逻辑覆盖 |
| sdk/tracker | 67.74% | 核心类覆盖 |
| sdk/tracker/utils | 42.85% | uuid 覆盖 |
| app/components | 0.46% | ArticleCard 部分覆盖 |
| app/pages | 0% | 尚未覆盖 |

---

### Q11: CI 里测试失败是怎么阻断合并的？

**A:** GitHub Actions 的每个 `run` 步骤按 shell 退出码判定：

```yaml
- name: Unit + Component tests
  run: pnpm run test   # vitest run
```

- `vitest run` 在测试失败时退出码为 **1**
- GitHub Actions 检测到非零退出码 → 标记步骤为 **failed**
- 后续步骤（Build test）**不会执行**
- PR 的 required check 失败 → **无法合并**

**配合仓库设置：**
- Settings → Branches → Branch protection rules → Add rule
- 把 `test` job 设为 **Required status check**
- 这样即使 workflow 其他步骤通过，test 失败也会阻断合并

---

## 五、深度技术类

### Q12: `vi.resetModules()` 和 `vi.restoreAllMocks()` 有什么区别？

**A:**

| 维度 | `vi.resetModules()` | `vi.restoreAllMocks()` |
|---|---|---|
| 作用 | 清空模块缓存，下次 import 重新执行模块 | 恢复所有 spy/mock 到原始实现 |
| 影响范围 | 所有模块 | 仅 `vi.fn()` / `vi.spyOn()` 创建的 mock |
| 典型场景 | 模块级状态隔离 | 清理 mock 调用历史 |
| 与 `vi.mock()` 关系 | 清空 mock 注册（需要重新 mock） | 不影响 mock 注册 |

**常见误区：**
- `mockReset()` — 清空调用历史 + 移除实现（变成空函数）
- `mockClear()` — 只清空调用历史（calls / instances）
- `mockRestore()` — 恢复到 `vi.spyOn()` 的原始实现

在 useApi 测试里，`beforeEach` 用 `mockClient.mockReset()` 清空 mock 队列，用 `vi.resetModules()` 重置模块级状态。

---

### Q13: happy-dom 和 jsdom 有什么区别？为什么选 happy-dom？

**A:**

| 维度 | happy-dom | jsdom |
|---|---|---|
| 速度 | 快（~2-5x） | 慢 |
| 内存 | 低 | 高 |
| CSS 解析 | 不支持 | 部分支持 |
| 布局引擎 | 无 | 有（部分） |
| 适用场景 | 逻辑/emit 测试 | 需要样式/布局的测试 |

**选 happy-dom 的原因：**
1. 我们的组件测试只关心**渲染内容**和**事件触发**，不关心样式布局
2. happy-dom 的速度优势明显，53 个测试跑完 < 7 秒
3. UnoCSS 生成的样式在测试环境本来就不加载，不需要 CSS 解析

**什么时候需要 jsdom？**
- 测试依赖 `getBoundingClientRect` / `offsetHeight` 等布局属性
- 测试 CSS 类名切换导致的样式变化
- 测试 `IntersectionObserver` / `ResizeObserver`（happy-dom 支持有限）

---

### Q14: 如果让你给 `pages/blog/[id].vue` 写测试，你会怎么设计？

**A:** 这是一个典型的页面组件测试场景，我会这样设计：

```ts
// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'

// 1. 注入页面可能用到的裸全局
const navigateTo = vi.fn()
vi.stubGlobal('navigateTo', navigateTo)

// 2. mock 路由参数
vi.mock('~/stores/article', () => ({
  useArticleStore: () => ({
    article: { id: 1, title: '测试文章', content: '...' },
    fetchArticle: vi.fn(),
  }),
}))

describe('BlogDetailPage', () => {
  it('渲染文章标题与内容', () => {
    const wrapper = mount(BlogDetailPage)
    expect(wrapper.text()).toContain('测试文章')
  })

  it('加载失败时跳转 404', async () => {
    // mock fetchArticle 抛出错误
    // 断言 navigateTo 被调用
  })
})
```

**关键点：**
- 页面组件通常依赖 store / route / composable，需要 mock 这些依赖
- 不要测子组件内部逻辑（那是子组件测试的事）
- 关注页面的"行为"：加载态、错误态、跳转逻辑

---

### Q15: 这套测试体系有什么局限性？未来怎么改进？

**A:** 当前局限性：

1. **覆盖率低（~4%）**。只覆盖了核心模块，pages/components 大部分未覆盖。
2. **无 E2E 测试**。单元测试测不了"用户从登录到下单"的完整流程。
3. **stub 维护成本**。Nuxt 自动导入的 API 升级时，stub 需要同步更新。
4. **useApi 测试复杂**。`resetModules` + 动态 import 的模式理解成本高，新人上手有门槛。
5. **无视觉回归测试**。组件 UI 变化（CSS 类名、布局）无法被测试捕获。

**改进路线：**

| 阶段 | 目标 | 手段 |
|---|---|---|
| P0（当前） | 核心模块覆盖 | 已完成 |
| P1 | 覆盖率 → 30% | 补充 pages/components/composables 测试 |
| P2 | 引入 E2E | Playwright 覆盖 3-5 个核心用户流程 |
| P3 | 视觉回归 | Chromatic / Percy 截图对比 |
| P4 | 覆盖率 → 60% | 全量覆盖 + 阈值逐步调高 |

---

## 六、行为面试类

### Q16: 在搭建测试体系过程中遇到的最大挑战是什么？怎么解决的？

**A:** 最大的挑战是 **useApi 的模块级状态隔离**。

useApi 内部有三个模块级变量（`refreshPromise`、`requestLocks`、`errorToastCache`），它们跨测试共享。最初用 `vi.mock('#imports')` + `vi.resetModules()` 方案，但发现：
- `resetModules()` 会清空 mock 注册
- `vi.mock()` 是 hoisted 的，无法在运行时重新注册
- 导致 `useRuntimeConfig is not undefined` 错误

**解决过程：**
1. 先尝试 `vi.hoisted()` — 但 `vi.mock()` 不能嵌套在 `vi.hoisted()` 里
2. 再尝试把 mock 工厂提成顶层函数 — 但 `vi.mock()` 是 hoisted 的，工厂里的变量引用不到
3. 最终**放弃 `vi.mock('#imports')`**，改用 `resolve.alias` 把 `#imports` 指向本地 stub 文件
4. stub 文件用 `globalThis` 单例解决模块复制问题
5. useApi 测试用 `resetModules()` + 每次重新 `import('#imports')` 拿到新 stub 引用

**教训：** 不要在一个方案上死磕，当发现 `vi.mock` + `resetModules` 根本性地不兼容时，及时切换到 alias 方案。

---

### Q17: 你是怎么决定先测哪些模块的？

**A:** 按**价值/成本**排序：

1. **sdk/tracker/** — 纯类 + 注入式依赖，零 Nuxt 依赖，隔离成本最低，价值高（核心 SDK）
2. **app/utils/format.ts** — 纯函数，sanity check 工具链
3. **app/stores/** — Pinia store，验证 Pinia 测试插件接入
4. **app/composables/useApi.ts** — 401 静默刷新锁、并发请求去重、错误 toast 防抖三段核心逻辑，价值最高但测试成本也最高
5. **app/components/ArticleCard.vue** — 代表组件，验证 happy-dom 组件测试链路

**没先测的：**
- `pages/` — 依赖多，需要 mock store + route + composable，成本高
- `layouts/` — 类似
- `middleware/` / `plugins/` — Nuxt 特定，需要 `@nuxt/test-utils`

---

### Q18: 如果项目要引入 MSW（Mock Service Worker），会和现在的方案冲突吗？

**A:** 不会冲突，但需要调整架构：

**当前方案：** mock `globalThis.$fetch`（Nuxt 的 `$fetch` 是 `ofetch` 的封装）。

**MSW 方案：** 拦截网络层（`fetch` / `XMLHttpRequest`），更接近真实请求。

**迁移路径：**
1. 保留 `#imports` alias stub（处理 `useRuntimeConfig` / `useCookie` 等非网络依赖）
2. 把 `$fetch` mock 换成 MSW 的 `rest.post('/api/v1/auth/refreshToken', ...)` 
3. MSW 的 handler 可以复用当前 mock 的响应数据

**MSW 的优势：**
- 更接近真实网络行为（HTTP 状态码、headers、延迟）
- handler 可以在测试之间共享和复用
- 支持浏览器端和 Node 端（Vitest）

**当前不引入 MSW 的原因：**
- 项目用 Nuxt 的 `$fetch`（`ofetch`），不是原生 `fetch`，MSW 需要额外配置
- 当前 mock `$fetch` 的方案已经满足需求
- 引入 MSW 会增加学习成本和配置复杂度

---

## 附录：关键文件速查

| 文件 | 职责 |
|---|---|
| `vitest.config.ts` | 运行器配置、alias、define、覆盖率阈值 |
| `vitest.setup.ts` | 每个测试文件前重置 stub 状态 |
| `tests/test-utils/nuxt-imports-stub.ts` | Nuxt 自动导入的假实现（核心） |
| `tests/unit/composables/useApi.test.ts` | 最复杂的测试，resetModules 模式 |
| `tests/components/ArticleCard.test.ts` | 组件测试，happy-dom + stubGlobal |
| `.github/workflows/test.yml` | CI workflow |
