---
name: frontend-code-review
description: Review Vue 3 / Nuxt 4 frontend code for quality, performance, security, and maintainability before commits. Use when the user asks for code review, pre-commit review, or uses /frontend-code-review.
---

# Frontend Code Review

对 Vue 3 / Nuxt 4 前端代码进行系统化审查，在每次提交前发现潜在问题。

## 触发场景

- 用户执行 `/frontend-code-review`
- 用户说"帮我 review 代码"、"代码审查"、"提交前检查"
- 用户准备提交代码前

## 审查流程

### 第一步：获取变更范围

使用 `git diff --stat` 和 `git diff` 查看本次变更的文件和代码差异。
如果是已暂存的变更，使用 `git diff --cached`。

### 第二步：按维度逐项审查

对每个变更文件，按以下维度依次审查：

#### 1. 正确性
- 逻辑是否正确，边界条件是否处理
- 异步操作是否有竞态条件（race condition）
- `ref`/`reactive` 解构是否丢失响应性（应使用 `toRefs` 或保持引用）
- `computed` 是否有副作用
- `watch`/`watchEffect` 是否需要清理（`onWatcherCleanup`）

#### 2. Nuxt / Vue 规范
- `useAsyncData`/`useFetch` 是否正确使用 key（避免缓存污染）
- SSR 兼容性：是否使用了浏览器专属 API（`window`/`document`）而未加 `import.meta.client` 保护
- 组合式函数（composables）命名是否以 `use` 开头
- 组件命名是否 PascalCase，文件名是否规范
- `<script setup>` 是否优先使用，props/emits 是否使用 TypeScript 类型定义

#### 3. 性能
- 大列表是否使用虚拟滚动或懒加载
- 图片是否使用 `<NuxtImg>` 或懒加载
- 组件是否有不必要的重渲染（过度使用 `watch` 而非 `computed`）
- `useAsyncData` 是否设置了合理的 `transform`/`getCachedData` 避免重复请求
- 路由页面是否考虑了 `definePageMeta` 的 `keepalive` 配置
- bundle 体积：是否按需引入大型库

#### 4. 安全
- 是否存在 `v-html` 渲染用户输入（XSS 风险）
- API 请求是否携带必要的鉴权 token
- 敏感信息（token/密码）是否暴露在客户端代码中
- 用户输入是否做了校验和转义

#### 5. TypeScript 类型
- 是否有隐式 `any`（项目允许 `any`，但应有注释说明原因）
- API 响应类型是否定义完整（检查 `types/` 目录）
- Props/Emits 是否类型化

#### 6. 代码质量
- 函数是否职责单一，长度合理（建议 < 50 行）
- 重复代码是否应抽取为 composable 或组件
- 错误处理是否完善（try/catch、错误边界）
- 魔法数字/硬编码字符串是否应抽取为常量

### 第三步：输出审查报告

使用以下格式输出：

```
## Code Review 报告

### 总体评价
[一句话总结代码质量，给出 1-10 分评分]

### 问题列表

#### 必须修复（Critical）
- [文件:行号] 问题描述 → 修复建议

#### 建议优化（Suggestion）
- [文件:行号] 问题描述 → 优化建议

#### 可选改进（Nice to have）
- [文件:行号] 问题描述 → 改进思路

### 亮点
[列出代码中做得好的地方，鼓励良好实践]
```

## 注意事项

- 只审查变更的代码，不审查未修改的部分
- 优先关注 Critical 问题，不要因小失大
- 给出具体修复建议，必要时提供代码示例
- 若变更文件超过 10 个，先列出高风险文件优先审查
- 若使用了项目中已有的 composable 或组件，确认用法是否符合现有约定（可查阅 `app/composables/` 目录）
