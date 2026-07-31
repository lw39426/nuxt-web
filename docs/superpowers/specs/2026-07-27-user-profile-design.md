# 用户个人中心页面设计文档

**日期**: 2026-07-27
**状态**: 待实现

## 1. 概述

为已登录用户提供个人中心页面，包含 7 个功能模块：个人资料编辑、我的订单、我的收藏、地址管理、浏览历史、我的评论、账号安全。

采用侧边栏布局 + 嵌套子路由，URL 语义清晰，可直接分享/访问特定模块。

## 2. 路由结构

```
pages/profile.vue                    → 个人中心布局（侧边栏 + 右侧 <NuxtPage />）
pages/profile/index.vue              → 默认重定向到 /profile/account
pages/profile/account.vue            → 个人资料编辑
pages/profile/orders.vue             → 我的订单
pages/profile/favorites.vue          → 我的收藏
pages/profile/addresses.vue          → 地址管理
pages/profile/history.vue            → 浏览历史
pages/profile/comments.vue           → 我的评论
pages/profile/security.vue           → 账号安全
```

路由守卫：`pages/profile.vue` 添加 `definePageMeta({ middleware: 'auth' })`，未登录自动弹登录弹窗。

## 3. 布局结构

```
┌─────────────────────────────────────────────────────┐
│  导航栏（登录后：头像 + 下拉菜单）                      │
├──────────────┬──────────────────────────────────────┤
│   侧边栏      │         右侧内容区                     │
│              │                                      │
│  ┌────────┐  │   ┌──────────────────────────────┐   │
│  │ 头像   │  │   │  模块标题 + 操作按钮           │   │
│  │ 用户名  │  │   ├──────────────────────────────┤   │
│  └────────┘  │   │  模块具体内容                  │   │
│              │   │                              │   │
│  ─ 功能菜单 ─  │   │                              │   │
│  👤 个人资料  │   │                              │   │
│  📦 我的订单  │   │                              │   │
│  ❤️ 我的收藏  │   │                              │   │
│  📍 地址管理  │   │                              │   │
│  🕐 浏览历史  │   │                              │   │
│  💬 我的评论  │   │                              │   │
│  🔒 账号安全  │   │                              │   │
└──────────────┴──────────────────────────────────────┘
```

### 响应式断点

| 宽度 | 布局 |
|------|------|
| `>= 768px` | 左侧固定侧边栏 + 右侧内容区 |
| `< 768px` | 侧边栏折叠为顶部水平 Tab 栏 |

## 4. 导航栏适配

登录后，导航栏右侧"登录"按钮替换为用户头像：
- 有头像：显示圆形头像图片
- 无头像：显示用户名首字母圆形
- 点击展开下拉菜单：个人中心 / 我的订单 / 退出登录
- 退出登录调用 `authStore.clearAuth()` 并跳转首页

## 5. 侧边栏组件 `ProfileSidebar.vue`

- 顶部：头像 + 用户名 + 会员等级
- 菜单：7 个入口，当前激活项高亮（基于 `route.path` 判断）
- 底部：可选退出登录按钮（移动端）

## 6. 各模块详细设计

### 6.1 个人资料 `account.vue`

- 展示 / 编辑模式切换
- 字段：头像（上传）、昵称、用户名（只读）、性别、生日、简介
- 保存按钮 → 调用 `useUserApi.updateInfo()`
- 数据来源：`useUserApi.getInfo()`

### 6.2 我的订单 `orders.vue`

- 顶部 Tab 筛选：全部 / 待付款 / 待发货 / 已完成 / 已取消
- 订单卡片：订单号、商品缩略图列表、总价、状态标签、操作按钮
- 分页加载
- 数据来源：`useOrderApi.list(params)`

### 6.3 我的收藏 `favorites.vue`

- 顶部 Tab 筛选：商品 / 文章
- 商品：网格卡片（复用 `ProductCard`）
- 文章：列表卡片（复用 `BlogCard`）
- 数据来源：`useFavoriteApi.list(params)`

### 6.4 地址管理 `addresses.vue`

- 地址卡片列表：收件人、电话、地址、默认标签
- 操作：编辑、删除、设默认
- 底部"新增地址"按钮 → 弹窗表单
- 数据来源：`useAddressApi.list()`

### 6.5 浏览历史 `history.vue`

- 时间分组（今天 / 昨天 / 更早）
- 商品 + 文章混合列表
- 清空历史按钮
- 数据来源：`server/api/user/history.get.ts` (mock)

### 6.6 我的评论 `comments.vue`

- 评论列表：目标商品/文章、评论内容、点赞数、时间
- 删除操作
- 数据来源：`useCommentApi.getByUser(userId)`

### 6.7 账号安全 `security.vue`

- 修改密码表单（旧密码 + 新密码 + 确认密码）
- 绑定手机号展示
- 登录记录列表（mock）
- 修改密码 → 调用 `useUserApi.updatePassword()`
- 登录记录 → `server/api/user/login-records.get.ts` (mock)

## 7. 数据策略

| 模块 | 数据来源 | 对接方式 |
|------|----------|----------|
| 个人资料 | `useUserApi.getInfo()` | 已有接口，直接对接 |
| 我的订单 | `useOrderApi.list()` | 已有接口，直接对接 |
| 我的收藏 | `useFavoriteApi.list()` | 已有接口，直接对接 |
| 地址管理 | `useAddressApi.list()` | 已有接口，直接对接 |
| 我的评论 | `useCommentApi.getByUser()` | 已有接口，直接对接 |
| 账号安全 | `useUserApi.updatePassword()` | 已有接口，直接对接 |
| 浏览历史 | `server/api/user/history.get.ts` | Nuxt server mock，后续替换 |
| 登录记录 | `server/api/user/login-records.get.ts` | Nuxt server mock，后续替换 |

## 8. 数据流模式

统一使用项目现有模式：

```ts
const isLoading = ref(true)
const error = ref(false)

const loadData = async () => {
  isLoading.value = true
  error.value = false
  try {
    const data = await apiMethod()
    // 赋值
  } catch (err) {
    error.value = true
  } finally {
    isLoading.value = false
  }
}

onMounted(loadData)
```

## 9. 三态 UI 规范

每个模块统一三种状态：

| 状态 | 展示 |
|------|------|
| Loading | 骨架屏或旋转图标 |
| Error | 错误提示 + 重试按钮 |
| Empty | 插图 + 文案（如"暂无订单"、"暂无收藏"） |

参考 `blog/[id].vue` 的现有实现模式。

## 10. Mock 数据策略

对于浏览历史、登录记录等暂无后端接口的模块，在 `server/api/user/` 下创建 mock 端点：

```
server/api/user/history.get.ts         → 浏览历史 mock
server/api/user/login-records.get.ts   → 登录记录 mock
```

mock 数据格式与真实接口返回格式一致（遵循 `ApiResponse<T>` 包装），后续对接后端时只需删除 mock 文件，前端代码无需改动。

## 11. 组件复用

| 已有组件 | 复用场景 |
|----------|----------|
| `ProductCard` | 收藏商品卡片 |
| `BlogCard` | 收藏文章卡片 |
| Nuxt UI `UButton` | 表单按钮、操作按钮 |
| Nuxt UI `UModal` | 地址新增/编辑弹窗 |

## 12. 文件清单

```
app/components/ProfileSidebar.vue         → 侧边栏组件
app/components/AppNavbarLayout.vue        → 修改：适配登录态头像下拉菜单
app/pages/profile.vue                     → 个人中心布局页
app/pages/profile/index.vue               → 重定向到 account
app/pages/profile/account.vue             → 个人资料
app/pages/profile/orders.vue              → 我的订单
app/pages/profile/favorites.vue           → 我的收藏
app/pages/profile/addresses.vue           → 地址管理
app/pages/profile/history.vue             → 浏览历史
app/pages/profile/comments.vue            → 我的评论
app/pages/profile/security.vue            → 账号安全
server/api/user/history.get.ts            → 浏览历史 mock
server/api/user/login-records.get.ts      → 登录记录 mock
```

## 13. 实现顺序

1. 路由框架 + 布局页 + 侧边栏组件 + 导航栏适配
2. 个人资料模块（有接口，作为首个内容模块验证框架）
3. 我的订单模块
4. 我的收藏模块
5. 地址管理模块
6. 我的评论模块
7. 账号安全模块
8. 浏览历史模块（mock）
