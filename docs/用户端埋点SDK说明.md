# 用户端埋点 SDK 说明（Nuxt 4）

本文档面向前端同事，解释当前项目的“用户行为埋点”实现与使用方式。

> 结论先行：
> - **错误（Error）与 APM 性能监控交给 Sentry 托管**。
> - 我们的自研埋点系统只做 **用户行为与业务报表分析**（PV / click / expose / custom）。

## 1. 目标与边界

### 1.1 目标

用户端埋点的核心使命：

- 精准采集：记录足够丰富的用户行为上下文
- 静默上报：不影响业务交互（不阻塞、不明显消耗性能）
- 高成功率：页面关闭/切换时尽最大可能不丢数据

### 1.2 边界（重要）

当前项目明确拆分：

- **Sentry**：负责
  - JS 错误捕获（Vue error handler / window error / unhandledrejection）
  - APM 性能（路由切换 tracing 等）
- **自研 Tracker（本 SDK）**：负责
  - `page_view`（PV）
  - `click`（业务点击/动作）
  - `expose`（曝光）
  - `custom`（其它业务事件）

如需把错误也打到自研行为平台（通常不建议），可用配置显式开启（见“配置”章节）。

## 2. 目录结构与关键文件

### 2.1 SDK（可抽包）

SDK 位于项目根目录的 `sdk/`（不依赖 Nuxt，可被小程序复用）：

- `sdk/tracker/types.ts`：严格事件结构（EventPayload 等）
- `sdk/tracker/tracker.ts`：核心 `Tracker` 类（Device/Session/队列）
- `sdk/tracker/internal/queue.ts`：队列与批量上报策略（sendBeacon 优先）
- `sdk/tracker/adapters/types.ts`：Adapter 协议（StorageAdapter/NetworkAdapter）
- `sdk/tracker/adapters/browser.ts`：浏览器 Adapter 实现（localStorage/sessionStorage/fetch/beacon）
- `sdk/tracker/index.ts`：统一导出入口

### 2.2 Nuxt 落地（仅客户端）

- `app/plugins/sentry.client.ts`：初始化 Sentry（错误 + APM）
- `app/plugins/tracker.client.ts`：初始化 Tracker（PV/click/expose），并提供 `$track` 和指令 `v-track-expose`
- `app/types/sentry.d.ts`：`$sentry` 类型声明
- `app/types/tracker.d.ts`：`$track` 类型声明

### 2.3 运行时配置

- `nuxt.config.ts`：
  - `runtimeConfig.public.tracker`：行为埋点配置
  - `runtimeConfig.public.sentry`：Sentry 配置
  - `alias['@sdk']`：让 Nuxt 代码可用 `@sdk/*` 引用根目录 SDK

## 3. 事件数据结构（强类型）

SDK 事件的核心结构（见 `sdk/tracker/types.ts`）：

### 3.1 EventType

当前内置类型：

- `page_view`：页面访问
- `click`：点击/动作
- `expose`：曝光
- `custom`：自定义业务事件
- `error`：错误（默认不启用，交给 Sentry）

### 3.2 EventPayload

事件 payload 关键字段：

必填：

- `app_id`：应用标识
- `device_id`：设备标识（UUID，localStorage 长期存储）
- `session_id`：会话标识（UUID，sessionStorage；闲置超时重置）
- `event_id`：事件唯一 id（UUID）
- `event_type`：事件类型（见上）
- `timestamp`：毫秒时间戳

可选：

- `event_name`：业务事件名（如 `buy_button_click`）
- `user_id`：用户 id（登录后可设置；当前插件未自动绑定登录态，需业务自行补充）
- `url/referrer/prev_url`：页面上下文
- `env/platform/sdk_version`：环境与 SDK 信息
- `params`：业务参数（严格 JSON 值）

### 3.3 批量结构（EventBatchRequest）

上报请求会将多条事件合并成一个 batch：

```json
{
  "batch_id": "...",
  "sent_at": 1710000000000,
  "events": [
    {
      "app_id": "nuxtweb",
      "device_id": "...",
      "session_id": "...",
      "event_id": "...",
      "event_type": "page_view",
      "timestamp": 1710000000000,
      "url": "https://example.com/products/1",
      "referrer": "https://example.com/",
      "params": { "path": "/products/1", "title": "商品详情" }
    }
  ]
}
```

## 4. Device ID / Session ID 策略

### 4.1 Device ID（device_id）

- 生成：UUID v4
- 存储：localStorage（key 形如 `tracker:<appId>:device`）
- 兜底：若浏览器/隐私模式导致 localStorage 不可用，则自动降级为内存存储（本次会话有效）

### 4.2 Session ID（session_id）

- 生成：UUID v4
- 存储：sessionStorage（key 形如 `tracker:<appId>:session`）
- 规则：
  - 每次触发埋点会更新 `lastActivityAt`
  - 若 `now - lastActivityAt > 30min`（可配置），将生成新的 session_id

> 设计目的：用于统计“平均访问时长 / 会话维度指标”。

## 5. 上报策略与性能保障

### 5.1 队列与批量

事件写入内存队列，满足任一条件触发 flush：

- 定时 flush：默认每 3 秒
- 批量阈值：默认队列达到 10 条

### 5.2 发送优先级：sendBeacon > fetch(keepalive)

- 页面关闭/切后台时：优先 `navigator.sendBeacon()`，尽最大可能不丢数据
- 不支持或失败：降级为 `fetch()` 并开启 `keepalive`

### 5.3 失败重试（指数退避）

- 对可重试错误（默认：网络失败、5xx、429）进行指数退避
- 对不可重试（典型：4xx）直接丢弃，避免无限重试拖垮用户端

### 5.4 不阻塞业务

SDK 关键原则：**埋点不能影响业务**。

- `track()` 内部不会 await 网络
- session state 的存储是异步 fire-and-forget
- 若 SDK 未完成 init，会“静默丢弃”事件（避免阻塞业务）

## 6. Nuxt 4 集成说明

### 6.1 插件加载顺序

当前目录命名确保：

- `sentry.client.ts` 先加载
- `tracker.client.ts` 后加载

这样 Tracker 可以把 `device_id/session_id/app_id` 写入 Sentry tag，便于关联排查。

### 6.2 自动 PV（page_view）

在 `app/plugins/tracker.client.ts` 中：

- 监听 `nuxtApp.hook('page:finish')`
- 自动发送 `page_view`
- `params` 附带 `path/title`

### 6.3 业务埋点 API：$track

Tracker 插件向全局提供：

- `$track(eventName, params)`

默认行为：

- `event_type = 'click'`
- `event_name = eventName`
- `params = params`

类型声明位置：

- `app/types/tracker.d.ts`：为 NuxtApp / Vue 组件提供 `$track` 类型

#### 使用示例：按钮点击

```vue
<template>
  <UButton @click="onBuy">购买</UButton>
</template>

<script setup lang="ts">
const { $track } = useNuxtApp()

function onBuy() {
  $track('buy_button_click', { sku_id: 'sku_123', price: 199 })
}
</script>
```

### 6.4 曝光埋点：v-track-expose

指令：`v-track-expose`（IntersectionObserver 实现）

参数格式：

- 字符串：`v-track-expose="'product_card_expose'"`
- 对象：

```ts
{
  eventName: string,
  params?: Record<string, JsonValue>,
  once?: boolean,            // 默认 true
  threshold?: number|number[], // 默认 0.5
  rootMargin?: string        // 默认 '0px'
}
```

#### 使用示例：商品卡片曝光

```vue
<template>
  <div
    v-track-expose="{
      eventName: 'product_card_expose',
      params: { sku_id: product.id, position: index },
      once: true,
      threshold: 0.5
    }"
  >
    ...
  </div>
</template>
```

## 7. Sentry（错误与 APM）接入说明

### 7.1 为什么不自研错误监控后端

错误与 APM 属于“专业领域”：包含堆栈符号化、source map、性能 trace、采样、告警等。

本项目的策略是：

- **Sentry 托管错误/性能**
- 我们只保留业务行为数据用于内部报表

### 7.2 如何开启 Sentry

配置 DSN 即可（见下一章环境变量）。

插件在 `app/plugins/sentry.client.ts` 中初始化：

- `Sentry.vueIntegration()`：捕获 Vue 级错误
- `Sentry.browserTracingIntegration({ router })`：路由 tracing（APM）

类型声明位置：

- `app/types/sentry.d.ts`：为 NuxtApp / Vue 组件提供 `$sentry` 类型

### 7.3 Tracker 与 Sentry 关联

Tracker 插件在 init 后会把如下信息写入 Sentry tag：

- `device_id`
- `session_id`
- `app_id`

这样你在 Sentry 里可以按 device/session 过滤并定位“某次会话发生了哪些异常”。

### 7.4 可选：把 error 同步到自研行为平台

不建议默认开启；若确实需要，通过环境变量开启：

- `NUXT_PUBLIC_TRACKER_CAPTURE_ERRORS=true`

注意：开启后会额外监听 window error / unhandledrejection 并上报 `event_type=error`。

## 8. 配置与环境变量

### 8.1 Tracker 配置（行为埋点）

```bash
# 行为上报地址（不配则 SDK 自动禁用，不影响业务）
NUXT_PUBLIC_TRACKER_ENDPOINT=https://your-domain.com/track

# 可选：显式开关（默认：只要 endpoint 存在就启用）
NUXT_PUBLIC_TRACKER_ENABLED=true

# 应用标识（默认 nuxtweb）
NUXT_PUBLIC_TRACKER_APP_ID=nuxtweb

# 调试（仅 dev 环境建议开）
NUXT_PUBLIC_TRACKER_DEBUG=false

# 批量策略
NUXT_PUBLIC_TRACKER_FLUSH_INTERVAL_MS=3000
NUXT_PUBLIC_TRACKER_BATCH_SIZE=10

# session 闲置超时
NUXT_PUBLIC_TRACKER_IDLE_TIMEOUT_MS=1800000

# 不建议：自研 error 采集（默认 false）
NUXT_PUBLIC_TRACKER_CAPTURE_ERRORS=false
```

### 8.2 Sentry 配置（错误 + APM）

```bash
NUXT_PUBLIC_SENTRY_DSN=***

# 可选：显式开关（默认：只要 DSN 存在就启用）
NUXT_PUBLIC_SENTRY_ENABLED=true

# APM 采样率（线上建议较小，如 0.05~0.2；dev 可 1.0）
NUXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE=0.1

# 调试（dev 才建议）
NUXT_PUBLIC_SENTRY_DEBUG=false
```

## 9. 命名约定（团队统一口径）

建议统一 event_name 命名风格（避免报表难以聚合）：

- 小写 snake_case
- `页面/模块_元素_动作`（示例）
  - `product_detail_buy_button_click`
  - `product_list_card_expose`
  - `checkout_submit_click`

params 建议：

- 字段名 snake_case
- 只传报表需要的关键维度（避免 params 巨大影响上报成功率）
- 禁止传敏感信息（手机号、身份证、token、密码等）

## 10. 小程序复用（Adapter 模式）

SDK 通过 Adapter 解耦底层能力：

- `StorageAdapter`：`getItem/setItem/removeItem`（Promise）
- `NetworkAdapter`：`send(url, body, options)`（Promise）

因此后续接入小程序，只要实现：

- `wx.getStorageSync`/`wx.setStorageSync` 或异步存储封装成 Promise
- `wx.request` 封装为 `NetworkAdapter.send`

即可复用整个 SDK 逻辑（device/session/queue/batch/backoff 都无需重写）。

## 11. Code Review（实现检查与建议）

### 11.1 当前实现的优点

- **业务代码不散落埋点**：集中在 SDK + Nuxt 插件
- **强类型**：EventPayload + JsonValue，约束 params 结构
- **不阻塞**：track 不 await 网络；flush 使用 sendBeacon 优先
- **可扩展**：Adapter 抽象为小程序铺路
- **职责清晰**：错误与性能交给 Sentry，自研只做行为报表

### 11.2 风险点与后续可选增强（不影响当前上线）

- 队列目前是纯内存：极端情况下（崩溃/强杀/离线）仍可能丢数据
  - 可选增强：持久化队列（IndexedDB）+ 离线重放
- 多标签页 session 一致性：当前未做跨 tab 同步
  - 可选增强：BroadcastChannel 同步 lastActivity/sessionId
- 登录态绑定：当前 `$track` 未自动携带 user_id
  - 可选增强：监听 auth store，在登录后调用 `tracker.setUserId()`，并同步 `Sentry.setUser()`

## 12. FAQ

### Q1：为什么没有任何上报？

先确认：

- `NUXT_PUBLIC_TRACKER_ENDPOINT` 是否配置
- `NUXT_PUBLIC_TRACKER_ENABLED` 是否为 true（或未设置但 endpoint 存在）

### Q2：为什么 error 没进自研平台？

这是设计目标：error/APM 交给 Sentry。

若确实要进自研平台：

- `NUXT_PUBLIC_TRACKER_CAPTURE_ERRORS=true`

### Q3：Sentry 和 Tracker 会不会重复采集错误？

默认不会：Tracker 的 error 采集默认关闭。

若你手动开启 `TRACKER_CAPTURE_ERRORS`，则会出现“双上报”，一般不建议。

---

如需扩展事件类型/字段，请先更新 `sdk/tracker/types.ts` 并同步更新文档中的结构示例。
