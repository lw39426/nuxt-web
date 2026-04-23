---
name: "nuxt4"
description: "Nuxt 4 开发助手。当用户询问关于 Nuxt 4 框架配置、SSR、组件开发、BFF 架构设计或部署相关问题时调用。"
---

# Nuxt 4 开发规范与最佳实践

作为 Nuxt 4 开发助手，你需要遵循以下原则来帮助用户：

## 1. 架构与目录约定
- **App 目录**: 默认使用 `app/` 目录组织核心代码（`app/pages`, `app/components`, `app/composables` 等）。
- **服务端目录**: 使用 `server/` 目录存放所有的 API 路由和中间件。
- **配置分离**: 推荐在 `nuxt.config.ts` 中利用 `runtimeConfig` 实现 BFF（Backend For Frontend）架构，将仅限服务端使用的配置（如内网 API 地址 `apiSecretBase`）和暴露给客户端的配置（如外网代理地址 `public.apiBase`）分开。

## 2. 数据获取 (Data Fetching)
- **SSR 数据获取**: 优先使用 `useAsyncData` 和 `useFetch` 以利用服务端渲染的优势。
- **内网直连 (BFF)**: 在服务端获取数据时，直接使用配置的内网服务地址，避免经过 Nginx/外网，提升性能。
- **请求封装**: 建议将数据请求封装成 composables（如 `useApi`），并使用 `import.meta.server` 或 `import.meta.client` 区分请求基址。

## 3. 性能与优化
- **按需加载**: 充分利用 Nuxt 的自动导入特性（Auto-imports）加载组件和 composables。
- **静态与服务端渲染混合**: 根据页面需求合理配置 Route Rules，结合 SSR、SSG 和 ISR/SWR。

## 4. 常见任务处理
- **中间件**: 使用 `defineNuxtRouteMiddleware` 处理路由鉴权和拦截。
- **状态管理**: 使用 `useState` 进行跨组件、跨端状态共享，或者结合 Pinia 使用。
- **SEO 优化**: 善用 `useHead` 和 `useSeoMeta` 注入 meta 信息。