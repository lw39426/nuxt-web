# process.cwd() 导致 alias 路径解析失败

**日期**：2026-06-09
**分类**：Nuxt
**严重程度**：Critical

## 问题描述

在 `nuxt.config.ts` 中使用 `process.cwd()` 配置路径别名：

```ts
alias: {
  '@sdk': resolve(process.cwd(), 'sdk')
}
```

当从非项目根目录运行 Nuxt（如 monorepo、CI 脚本、或 `cd` 到其他目录后执行 `nuxt dev`），`process.cwd()` 返回的是命令执行目录而非项目根目录，导致 `@sdk` 别名指向错误路径，构建时报模块找不到。

## 根本原因

`process.cwd()` 返回 Node.js 进程的当前工作目录，取决于命令在哪里执行，而不是配置文件所在位置。Nuxt 配置文件的位置是固定的，但工作目录是动态的。

## 解决方案

使用 `import.meta.url` 获取配置文件自身的 URL，再转为文件系统路径：

```ts
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

// ...
alias: {
  '@sdk': resolve(__dirname, 'sdk')
}
```

这样无论从哪里运行 Nuxt，路径始终基于 `nuxt.config.ts` 所在目录解析。

## 相关资源

- [Node.js - import.meta.url](https://nodejs.org/api/esm.html#importmetaurl)
- Nuxt 官方推荐使用 `fileURLToPath` 而非 `process.cwd()`
