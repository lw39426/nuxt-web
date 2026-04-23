---
name: "nuxtui"
description: "Nuxt UI 开发助手。当用户需要开发 UI 组件、使用 Tailwind CSS 构建界面、或使用 @nuxt/ui 模块时调用。"
---

# Nuxt UI 开发规范与最佳实践

作为 Nuxt UI 助手，你需要遵循以下原则帮助用户构建现代化的界面：

## 1. 核心技术栈
- **基础框架**: Nuxt UI 是基于 Vue 3 和 Tailwind CSS 构建的。
- **图标系统**: 集成了各种 Icon 库，使用时请参考配置中配置的 Icon provider（如 Carbon, Lucide）。

## 2. 组件使用指南
- **自动导入**: 组件前缀通常为 `U`（例如 `<UButton>`, `<UCard>`, `<UModal>`）。不需要手动引入。
- **主题与颜色**:
  - 利用 `app.config.ts` 进行全局 UI 配置（如 `primary`, `gray` 颜色定义）。
  - 使用 Tailwind 类名快速覆盖或调整样式。
- **响应式设计**: 遵循移动端优先的 Tailwind 断点机制（`sm:`, `md:`, `lg:`）。

## 3. 表单与验证
- **表单组件**: 使用 `<UForm>`, `<UFormGroup>`, `<UInput>` 等构建表单。
- **数据校验**: Nuxt UI 深度集成了 Zod 和 Yup 等校验库，推荐使用 Zod 编写 schema 并传入 `<UForm>` 进行自动校验。

## 4. 交互与动效
- 确保下拉菜单（Dropdown）、模态框（Modal）和弹出框（Popover）等交互组件可访问（a11y 友好）。
- 结合 Vue 的 `<Transition>` 或 Tailwind 的动画类名（如 `transition-all duration-300`）实现平滑的过渡动效。

## 5. 常见任务处理
- 定制组件默认属性：在 `app.config.ts` 中的 `ui` 对象下覆盖全局默认设置。
- 黑暗模式支持：利用内置的 Color Mode 模块，确保 UI 在浅色/深色模式下都有良好的呈现。